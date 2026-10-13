import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CapsuleGeometry, CircleGeometry, Color, CylinderGeometry,
  DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PMREMGenerator, Plane,
  PlaneGeometry, Points, PointsMaterial, ShaderMaterial, SphereGeometry, TorusGeometry, Vector3,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mountScene, trackPointer } from '../../lib/three-utils'

const LIME = new Color('#d4f27f')
const MINT = new Color('#7fe3c0')
const AVATAR_TOP = 3.75

// Everything below the scan height is drawn as a glowing hologram; everything above stays solid clay.
const holoVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 view = viewMatrix * world;
    vWorld = world.xyz;
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-view.xyz);
    gl_Position = projectionMatrix * view;
  }
`
const holoFragment = /* glsl */ `
  uniform float uScan;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying vec3 vWorld;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    if (vWorld.y > uScan) discard;
    float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 2.2);
    float lines = 0.5 + 0.5 * sin(vWorld.y * 95.0 - uTime * 2.5);
    float edge = smoothstep(uScan - 0.4, uScan, vWorld.y);
    vec3 color = mix(uColor, uColor2, edge);
    float alpha = (0.16 + fresnel * 0.95) * (0.45 + 0.55 * lines) + edge * 0.75;
    gl_FragColor = vec4(color * (0.7 + fresnel), alpha);
  }
`

const floorFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  float line(float v, float w) { float d = min(fract(v), 1.0 - fract(v)); return 1.0 - smoothstep(0.0, w, d); }
  void main() {
    vec2 p = (vUv - 0.5) * 16.0;
    float r = length(p);
    float angle = atan(p.y, p.x) / 6.2831853;
    float grid = max(line(r * 0.8, 0.05), line(angle * 36.0, 0.05));
    float pulse = exp(-pow((r - mod(uTime * 1.6, 8.0)) * 1.4, 2.0)) * 0.55;
    float fadeOut = 1.0 - smoothstep(1.5, 7.4, r);
    float fadeIn = smoothstep(1.1, 1.9, r);
    float alpha = (grid * 0.55 + pulse) * fadeOut * fadeIn;
    gl_FragColor = vec4(uColor, alpha);
  }
`
const planeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float alpha = pow(1.0 - vUv.y, 1.6) * (0.2 + 0.04 * sin(uTime * 2.0 + vUv.y * 8.0));
    gl_FragColor = vec4(uColor, alpha);
  }
`
const padFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(uColor, (1.0 - smoothstep(0.0, 1.0, d)) * 0.5);
  }
`

const glowMaterial = (fragmentShader, uniforms, extra = {}) => new ShaderMaterial({
  uniforms,
  vertexShader: planeVertex,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
  ...extra,
})

export default function HologramScene({ progressRef, onFrame }) {
  const hostRef = useRef(null)
  const frameRef = useRef(onFrame)

  useEffect(() => { frameRef.current = onFrame }, [onFrame])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    return mountScene(host, ({ renderer, scene, camera, lowPower }) => {
      renderer.localClippingEnabled = true
      const pmrem = new PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      scene.environment = pmrem.fromScene(room, 0.04).texture
      scene.environmentIntensity = 0.7
      room.dispose?.()
      const key = new DirectionalLight('#ffffff', 1.4)
      key.position.set(3, 6, 5)
      scene.add(key)

      const disposables = []
      const keep = (item) => { disposables.push(item); return item }
      const pointer = trackPointer()

      const scanUniform = { value: 0 }
      const timeUniform = { value: 0 }
      const solidPlane = new Plane(new Vector3(0, 1, 0), 0) // keeps everything above the scan height
      const holoMaterial = keep(new ShaderMaterial({
        uniforms: { uScan: scanUniform, uTime: timeUniform, uColor: { value: LIME }, uColor2: { value: new Color('#f4ffd0') } },
        vertexShader: holoVertex,
        fragmentShader: holoFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }))

      // ---- the avatar, built from simple clay shapes ----
      const solid = (color, roughness = 0.6) => keep(new MeshStandardMaterial({ color, roughness, side: DoubleSide, clippingPlanes: [solidPlane] }))
      const skin = solid('#d9a37c', 0.7)
      const hairMat = solid('#241915', 0.5)
      const shirt = solid('#2f6a50', 0.7)
      const pants = solid('#1f2c36', 0.75)
      const shoeMat = solid('#f6efe0', 0.6)
      const dark = solid('#16100e', 0.4)
      const white = solid('#ffffff', 0.4)

      const avatar = new Group()
      const part = (geometry, material, x, y, z, scale = [1, 1, 1]) => {
        const mesh = new Mesh(keep(geometry), material)
        mesh.position.set(x, y, z)
        mesh.scale.set(...scale)
        avatar.add(mesh)
        return mesh
      }
      ;[-1, 1].forEach((side) => {
        part(new CapsuleGeometry(0.17, 0.6, 12, 24), pants, side * 0.22, 0.78, 0)
        part(new SphereGeometry(0.26, 24, 16), shoeMat, side * 0.23, 0.14, 0.1, [1, 0.55, 1.5])
        const arm = part(new CapsuleGeometry(0.13, 0.62, 12, 24), shirt, side * 0.62, 1.92, 0)
        arm.rotation.z = -side * 0.12
        part(new SphereGeometry(0.15, 20, 14), skin, side * 0.67, 1.43, 0)
        part(new SphereGeometry(0.12, 20, 14), skin, side * 0.55, 3.08, 0.02, [0.7, 1, 0.8]) // ear
        part(new SphereGeometry(0.075, 20, 14), dark, side * 0.2, 3.12, 0.47) // eye
        part(new SphereGeometry(0.025, 12, 10), white, side * 0.18, 3.15, 0.53) // eye shine
      })
      part(new CapsuleGeometry(0.42, 0.55, 16, 28), shirt, 0, 1.85, 0, [1, 1, 0.78])
      part(new CylinderGeometry(0.14, 0.16, 0.22, 20), skin, 0, 2.6, 0)
      part(new SphereGeometry(0.55, 40, 28), skin, 0, 3.1, 0, [1, 1.02, 0.96]) // head
      part(new SphereGeometry(0.575, 40, 28, 0, Math.PI * 2, 0, 1.3), hairMat, 0, 3.15, -0.02, [1, 1, 0.98]) // hair cap
      part(new SphereGeometry(0.3, 24, 16), hairMat, 0.12, 3.62, 0.3, [1.1, 0.5, 0.7]) // fringe
      const smile = part(new TorusGeometry(0.13, 0.017, 10, 24, Math.PI), dark, 0, 2.96, 0.5)
      smile.rotation.z = Math.PI

      // Hologram copies: same shapes, drawn by the scan shader as children so they share every transform.
      avatar.children.slice().forEach((mesh) => {
        const hologram = new Mesh(mesh.geometry, holoMaterial)
        hologram.renderOrder = 2
        mesh.add(hologram)
      })
      scene.add(avatar)

      // ---- platform, light beam, floor grid, scan ring, particles ----
      const standard = (color, props = {}) => keep(new MeshStandardMaterial({ color, ...props }))
      const base = new Mesh(keep(new CylinderGeometry(1.55, 1.7, 0.24, 64)), standard('#0f2c23', { metalness: 0.55, roughness: 0.35 }))
      base.position.y = -0.12
      const top = new Mesh(keep(new CylinderGeometry(1.22, 1.3, 0.08, 64)), standard('#14382c', { metalness: 0.5, roughness: 0.3, emissive: '#1d5a3f', emissiveIntensity: 0.5 }))
      top.position.y = 0.04
      scene.add(base, top)
      const ring = (radius, tube, color, y) => {
        const mesh = new Mesh(keep(new TorusGeometry(radius, tube, 10, 96)), keep(new MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: AdditiveBlending })))
        mesh.rotation.x = Math.PI / 2
        mesh.position.y = y
        scene.add(mesh)
        return mesh
      }
      ring(1.5, 0.025, LIME, 0.01)
      ring(1.1, 0.014, MINT, 0.09)

      const timeShared = { uTime: timeUniform }
      const pad = new Mesh(keep(new CircleGeometry(1.15, 64)), keep(glowMaterial(padFragment, { uColor: { value: MINT } })))
      pad.rotation.x = -Math.PI / 2
      pad.position.y = 0.1
      const beam = new Mesh(keep(new CylinderGeometry(1.05, 1.3, 3.8, 48, 1, true)), keep(glowMaterial(beamFragment, { ...timeShared, uColor: { value: LIME } })))
      beam.position.y = 1.95
      const floor = new Mesh(keep(new PlaneGeometry(16, 16)), keep(glowMaterial(floorFragment, { ...timeShared, uColor: { value: new Color('#7fe3c0') } })))
      floor.rotation.x = -Math.PI / 2
      floor.position.y = -0.26
      scene.add(pad, beam, floor)

      const scanGroup = new Group()
      const scanRing = new Mesh(keep(new TorusGeometry(1.0, 0.022, 8, 96)), keep(new MeshBasicMaterial({ color: '#f4ffd0', transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false })))
      const scanHalo = new Mesh(keep(new TorusGeometry(1.0, 0.1, 8, 96)), keep(new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false })))
      const scanDisc = new Mesh(keep(new CircleGeometry(1.0, 64)), keep(new MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.07, blending: AdditiveBlending, depthWrite: false, side: DoubleSide })))
      ;[scanRing, scanHalo, scanDisc].forEach((mesh) => { mesh.rotation.x = Math.PI / 2; scanGroup.add(mesh) })
      scene.add(scanGroup)

      const COUNT = lowPower ? 60 : 130
      const seeds = Array.from({ length: COUNT }, (_, i) => ({ a: (i * 2.399) % (Math.PI * 2), r: 0.5 + ((i * 0.618) % 1) * 1.3, s: 0.15 + ((i * 0.37) % 1) * 0.45, o: (i * 0.173) % 1 }))
      const positions = new Float32Array(COUNT * 3)
      const dots = new BufferGeometry()
      dots.setAttribute('position', new BufferAttribute(positions, 3))
      const dotMaterial = keep(new PointsMaterial({ color: LIME, size: 0.06, transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false }))
      scene.add(new Points(keep(dots), dotMaterial))

      const state = { p: progressRef.current || 0, narrow: false }
      const lookAt = new Vector3(0, 1.75, 0)
      const smooth = { x: 0, y: 0 }

      return {
        resize() { state.narrow = camera.aspect < 0.85 },
        update(time, dt) {
          const ease = 1 - Math.exp(-dt * 3)
          state.p += ((progressRef.current ?? 0) - state.p) * (dt ? 1 - Math.exp(-dt * 5) : 1)
          smooth.x += (pointer.pointer.x - smooth.x) * ease
          smooth.y += (pointer.pointer.y - smooth.y) * ease
          timeUniform.value = time

          const scanY = -0.2 + (AVATAR_TOP + 0.25) * state.p
          scanUniform.value = scanY
          solidPlane.constant = -scanY
          scanGroup.position.y = scanY
          scanGroup.visible = state.p > 0.015 && state.p < 0.985
          scanGroup.scale.setScalar(1 + Math.sin(time * 3) * 0.03)

          avatar.rotation.y = Math.sin(time * 0.5) * 0.16 + smooth.x * 0.3
          const distance = state.narrow ? 14.8 : 12.4
          const theta = (state.p - 0.5) * 0.8 + smooth.x * 0.22
          camera.position.set(Math.sin(theta) * distance, 2.2 + smooth.y * 0.35 + (0.5 - state.p) * 0.4, Math.cos(theta) * distance)
          lookAt.y = state.narrow ? 2.35 : 1.95
          camera.lookAt(lookAt)

          for (let i = 0; i < COUNT; i += 1) {
            const seed = seeds[i]
            const rise = (time * seed.s + seed.o) % 1
            const angle = seed.a + time * 0.25
            positions[i * 3] = Math.cos(angle) * seed.r * (1 - rise * 0.4)
            positions[i * 3 + 1] = rise * 3.8
            positions[i * 3 + 2] = Math.sin(angle) * seed.r * (1 - rise * 0.4)
          }
          dots.attributes.position.needsUpdate = true

          frameRef.current?.(state.p)
        },
        dispose() {
          pointer.stop()
          disposables.forEach((item) => item.dispose?.())
          scene.environment?.dispose()
          pmrem.dispose()
        },
      }
    }, { fov: 32 })
  }, [progressRef])

  return <div className="holo-canvas" ref={hostRef} aria-hidden="true" />
}
