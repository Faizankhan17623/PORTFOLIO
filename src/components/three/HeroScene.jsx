import { useEffect, useRef } from 'react'
import {
  CapsuleGeometry, Color, DirectionalLight, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial,
  PMREMGenerator, SphereGeometry, TorusGeometry,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { mountScene, trackPointer, valueNoise } from '../../lib/three-utils'

// Soft, slow clay shapes that float around the hero card, plus one iridescent glass sphere.
// Each item is placed as a fraction of the visible half-width/height so it fits any screen:
// `wide` is the desktop layout, `narrow` the stacked phone layout. `depth` drives mouse + scroll parallax.
const ITEMS = [
  { kind: 'glass', size: 0.2, wide: [0.07, 0.08], narrow: [0.56, -0.3], depth: 1.2, spin: 0.15 },
  { kind: 'blob', color: '#c9e96b', seed: 3, size: 0.27, wide: [0.86, 0.5], narrow: [-0.8, -0.3], depth: 0.8, spin: 0.1 },
  { kind: 'blob', color: '#e97558', seed: 9, size: 0.2, wide: [0.74, -0.74], narrow: [0.7, -0.94], depth: 1, spin: -0.13 },
  { kind: 'blob', color: '#2f6a50', seed: 5, size: 0.14, wide: [0.5, 0.86], narrow: [-0.5, -0.97], depth: 1.5, spin: 0.2 },
  { kind: 'torus', color: '#f0c36a', size: 0.17, wide: [0.92, -0.14], narrow: [-0.92, -0.64], depth: 1.3, spin: 0.25 },
  { kind: 'capsule', color: '#e97558', size: 0.12, wide: [0.3, -0.86], narrow: [0.92, -0.62], depth: 1.6, spin: 0.2 },
  { kind: 'blob', color: '#a9c99a', seed: 12, size: 0.09, wide: [0.2, 0.62], narrow: [-0.1, -0.24], depth: 1.9, spin: -0.2 },
  { kind: 'blob', color: '#f6efe0', seed: 7, size: 0.07, wide: [0.98, 0.9], narrow: [0.12, -0.98], depth: 2, spin: 0.25 },
]

function makeBlobGeometry(seed) {
  let geometry = new SphereGeometry(1, 56, 40)
  // Seams get welded so the smooth normals match all the way around.
  geometry.deleteAttribute('uv')
  geometry.deleteAttribute('normal')
  geometry = mergeVertices(geometry)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    const wobble = (valueNoise(x * 1.2 + seed, y * 1.2 + seed * 2, z * 1.2 + seed * 3) - 0.5) * 0.62
      + (valueNoise(x * 2.8 + seed * 4, y * 2.8, z * 2.8 + seed) - 0.5) * 0.22
    const radius = 1 + wobble
    position.setXYZ(i, x * radius, y * radius, z * radius)
  }
  geometry.computeVertexNormals()
  return geometry
}

export default function HeroScene() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    return mountScene(host, ({ renderer, scene, camera }) => {
      const pmrem = new PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      scene.environment = pmrem.fromScene(room, 0.04).texture
      scene.environmentIntensity = 0.85
      room.dispose?.()
      camera.position.set(0, 0, 10)

      const key = new DirectionalLight('#fff4e0', 1.6)
      key.position.set(3, 5, 6)
      scene.add(key)

      const geometries = []
      const materials = []
      const track = (geometry, material) => { geometries.push(geometry); materials.push(material); return new Mesh(geometry, material) }

      const pointer = trackPointer()
      const rig = new Group()
      scene.add(rig)

      const items = ITEMS.map((item, index) => {
        let mesh
        if (item.kind === 'glass') {
          // See-through iridescent glass without the costly refraction pass, so it stays smooth on any laptop.
          const material = new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.06, metalness: 0, transparent: true, opacity: 0.5, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [160, 680], clearcoat: 1, envMapIntensity: 1.8 })
          mesh = track(new SphereGeometry(1, 64, 48), material)
        } else if (item.kind === 'torus') {
          mesh = track(new TorusGeometry(1, 0.42, 36, 72), new MeshStandardMaterial({ color: new Color(item.color), roughness: 0.55 }))
        } else if (item.kind === 'capsule') {
          mesh = track(new CapsuleGeometry(0.55, 1.3, 16, 32), new MeshStandardMaterial({ color: new Color(item.color), roughness: 0.55 }))
        } else {
          mesh = track(makeBlobGeometry(item.seed), new MeshStandardMaterial({ color: new Color(item.color), roughness: 0.62 }))
        }
        mesh.rotation.set(index * 0.9, index * 1.3, index * 0.4)
        rig.add(mesh)
        return { ...item, mesh, phase: index * 1.7, base: { x: 0, y: 0, scale: 1 } }
      })

      const view = { halfW: 1, halfH: 1, narrow: false, unit: 1 }
      const layout = () => {
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
        view.halfH = halfH
        view.halfW = halfH * camera.aspect
        view.narrow = camera.aspect < 0.95
        view.unit = Math.min(view.halfW, view.halfH) * (view.narrow ? 1.5 : 1)
        items.forEach((item) => {
          const [fx, fy] = view.narrow ? item.narrow : item.wide
          item.base.x = fx * view.halfW
          item.base.y = fy * view.halfH
          item.base.scale = item.size * view.unit * (item.kind === 'torus' ? 0.8 : 1) * (view.narrow ? 0.8 : 1)
        })
      }

      const smooth = { x: 0, y: 0, scroll: 0 }
      return {
        resize: layout,
        update(time, dt) {
          const ease = 1 - Math.exp(-dt * 3.2)
          smooth.x += (pointer.pointer.x - smooth.x) * ease
          smooth.y += (pointer.pointer.y - smooth.y) * ease
          const heroHeight = host.clientHeight || 1
          const scrolled = Math.min(Math.max(window.scrollY / heroHeight, 0), 1.4)
          smooth.scroll += (scrolled - smooth.scroll) * (dt ? ease : 1)

          items.forEach((item) => {
            const bob = Math.sin(time * 0.7 + item.phase) * 0.12 * view.unit
            item.mesh.position.set(
              item.base.x + smooth.x * item.depth * 0.32 * view.unit,
              item.base.y + bob + smooth.y * item.depth * 0.22 * view.unit + smooth.scroll * item.depth * (view.narrow ? 0.4 : 1.5) * view.unit,
              item.depth * 0.4,
            )
            item.mesh.scale.setScalar(item.base.scale * (1 + Math.sin(time * 0.9 + item.phase) * 0.025))
            item.mesh.rotation.x += item.spin * dt * 0.7
            item.mesh.rotation.y += item.spin * dt
            item.mesh.rotation.z += item.spin * dt * 0.3
          })
          rig.rotation.y = smooth.x * 0.06
          rig.rotation.x = -smooth.y * 0.04
        },
        dispose() {
          pointer.stop()
          geometries.forEach((geometry) => geometry.dispose())
          materials.forEach((material) => material.dispose())
          scene.environment?.dispose()
          pmrem.dispose()
        },
      }
    })
  }, [])

  return <div className="hero-canvas" ref={hostRef} aria-hidden="true" />
}
