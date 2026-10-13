import { useEffect, useRef } from 'react'
import {
  AdditiveBlending, CanvasTexture, Color, DirectionalLight, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, PMREMGenerator, SRGBColorSpace, Sprite, SpriteMaterial, TorusGeometry, Vector3,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mountScene } from '../../lib/three-utils'

// Pill colours per skill group: [background, text].
const TONES = {
  languages: ['#e97558', '#ffffff'],
  frontend: ['#d4f27f', '#18382b'],
  styling: ['#a9c99a', '#18382b'],
  backend: ['#2f6a50', '#f4ffd0'],
  databases: ['#f0c36a', '#18382b'],
  testing: ['#f6efe0', '#18382b'],
  deployment: ['#18382b', '#d4f27f'],
  devops: ['#43544a', '#ffffff'],
  ai: ['#e97558', '#ffffff'],
}

function makeLabel(text, [background, color]) {
  const scale = 2
  const height = 44 * scale
  const probe = document.createElement('canvas').getContext('2d')
  probe.font = `600 ${22 * scale}px "Space Grotesk", sans-serif`
  const width = Math.ceil(probe.measureText(text).width + 36 * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = background
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(0, 0, width, height, height / 2)
  else ctx.rect(0, 0, width, height)
  ctx.fill()
  ctx.fillStyle = color
  ctx.font = `600 ${22 * scale}px "Space Grotesk", sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, width / 2, height / 2 + 2)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  const sprite = new Sprite(material)
  const unitHeight = 0.5
  sprite.userData.size = [(width / height) * unitHeight, unitHeight]
  return { sprite, material, texture }
}

// A slowly turning sphere of skill labels around a glassy core. Drag to spin it.
export default function SkillsOrbitScene({ skills }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    return mountScene(host, ({ renderer, scene, camera }) => {
      const pmrem = new PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      scene.environment = pmrem.fromScene(room, 0.04).texture
      room.dispose?.()
      const key = new DirectionalLight('#ffffff', 1.2)
      key.position.set(3, 4, 6)
      scene.add(key)
      camera.position.set(0, 0, 12)

      const disposables = []
      const keep = (item) => { disposables.push(item); return item }
      const orbit = new Group()
      scene.add(orbit)

      // glassy core with a wire shell
      const coreGeometry = keep(new IcosahedronGeometry(1.2, 2))
      orbit.add(new Mesh(coreGeometry, keep(new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.55, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [160, 680], clearcoat: 1, envMapIntensity: 1.8 }))))
      orbit.add(new Mesh(keep(new IcosahedronGeometry(1.45, 1)), keep(new MeshBasicMaterial({ color: '#5f9a6d', wireframe: true, transparent: true, opacity: 0.4 }))))
      ;[[0.5, 0.2], [-0.35, 1.1]].forEach(([tiltX, tiltZ]) => {
        const ring = new Mesh(keep(new TorusGeometry(3.1, 0.012, 8, 128)), keep(new MeshBasicMaterial({ color: '#d4f27f', transparent: true, opacity: 0.8, blending: AdditiveBlending })))
        ring.rotation.set(Math.PI / 2 + tiltX, 0, tiltZ)
        orbit.add(ring)
      })

      // one label per skill, spread evenly over a sphere
      const entries = Object.entries(skills).flatMap(([group, items]) => items.map((name) => [group, name]))
      const labels = entries.map(([group, name], i) => {
        const label = makeLabel(name, TONES[group] || TONES.devops)
        disposables.push(label.material, label.texture)
        const y = entries.length > 1 ? 1 - (i / (entries.length - 1)) * 2 : 0
        const ring = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = i * 2.399963
        label.unit = new Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring)
        orbit.add(label.sprite)
        return label
      })

      let radius = 3.2
      const layout = () => {
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
        const halfW = halfH * camera.aspect
        radius = Math.min(3.4, halfW * 0.74, halfH * 0.74)
        // wide boxes get a wider orbit so the labels spread out instead of piling up in the middle
        const radiusX = Math.min(halfW * 0.78, radius * 2.1)
        labels.forEach((label) => label.sprite.position.set(label.unit.x * radiusX, label.unit.y * radius, label.unit.z * radius))
      }

      // drag to spin, with a little inertia; vertical scrolling on touch screens still works
      const canvas = renderer.domElement
      canvas.style.cursor = 'grab'
      canvas.style.touchAction = 'pan-y'
      const drag = { active: false, x: 0, y: 0, vx: 0 }
      const onDown = (event) => { drag.active = true; drag.x = event.clientX; drag.y = event.clientY; canvas.setPointerCapture?.(event.pointerId); canvas.style.cursor = 'grabbing' }
      const onMove = (event) => {
        if (!drag.active) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        drag.x = event.clientX
        drag.y = event.clientY
        orbit.rotation.y += dx * 0.006
        orbit.rotation.x = Math.max(-0.9, Math.min(0.9, orbit.rotation.x + dy * 0.004))
        drag.vx = dx * 0.006 * 60
      }
      const onUp = () => { drag.active = false; canvas.style.cursor = 'grab' }
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)

      const world = new Vector3()
      return {
        resize: layout,
        update(time, dt) {
          if (!drag.active) {
            const idle = 0.28
            drag.vx += (idle - drag.vx) * Math.min(1, dt * 1.6)
            orbit.rotation.y += drag.vx * dt
            orbit.rotation.x *= 1 - Math.min(1, dt * 0.8)
          }
          orbit.children[0].rotation.y = time * 0.3
          labels.forEach((label) => {
            label.sprite.getWorldPosition(world)
            const depth = (world.z / radius + 1) / 2 // 0 = back, 1 = front
            label.material.opacity = 0.22 + 0.78 * depth
            const k = 0.62 + 0.38 * depth
            label.sprite.scale.set(label.sprite.userData.size[0] * k, label.sprite.userData.size[1] * k, 1)
          })
        },
        dispose() {
          canvas.removeEventListener('pointerdown', onDown)
          canvas.removeEventListener('pointermove', onMove)
          canvas.removeEventListener('pointerup', onUp)
          canvas.removeEventListener('pointercancel', onUp)
          disposables.forEach((item) => item.dispose?.())
          scene.environment?.dispose()
          pmrem.dispose()
        },
      }
    })
  }, [skills])

  return <div className="skills-orbit-canvas" ref={hostRef} />
}
