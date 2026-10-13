import {
  CanvasTexture, CircleGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, SphereGeometry, SRGBColorSpace, TorusGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const CODE_COLORS = ['#7fe3c0', '#d4f27f', '#e97558', '#8ab4ff', '#c3a6ff']

function makeScreen(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return { ctx: canvas.getContext('2d'), texture, width, height }
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

// A code editor with coloured lines, drawn once.
function drawCode({ ctx, width, height }) {
  ctx.fillStyle = '#1a1e29'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#242938'
  ctx.fillRect(0, 0, width, 30)
  ;['#e97558', '#f0c36a', '#7fe3c0'].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(18 + i * 18, 15, 5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#212636'
  ctx.fillRect(0, 30, 96, height - 30)
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i === 2 ? '#d4f27f' : '#3a4157'
    roundRect(ctx, 14, 48 + i * 24, 40 + ((i * 17) % 34), 8, 4)
    ctx.fill()
  }
  const indent = [0, 0, 1, 1, 2, 2, 1, 1, 0, 1, 2, 2, 1, 0]
  indent.forEach((level, i) => {
    const x = 120 + level * 26
    let cursor = x
    for (let part = 0; part < 3; part += 1) {
      const w = 34 + ((i * 23 + part * 41) % 70)
      ctx.fillStyle = CODE_COLORS[(i + part * 2) % CODE_COLORS.length]
      roundRect(ctx, cursor, 52 + i * 19, w, 8, 4)
      ctx.fill()
      cursor += w + 12
      if (cursor > width - 40) break
    }
  })
}

// A project showcase that the right monitor flips through.
function drawProject({ ctx, width, height }, project, index, total) {
  ctx.fillStyle = '#f6f2e8'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#18382b'
  ctx.fillRect(0, 0, width, 32)
  ctx.fillStyle = '#d4f27f'
  ctx.font = '600 15px "Space Grotesk", sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('faizan.dev / projects', 16, 17)

  ctx.fillStyle = '#d4f27f'
  roundRect(ctx, 28, 62, 118, 26, 13)
  ctx.fill()
  ctx.fillStyle = '#18382b'
  ctx.font = '700 13px "Space Grotesk", sans-serif'
  ctx.fillText((project.category || 'Project').toUpperCase(), 42, 76)

  let size = 60
  ctx.fillStyle = '#18382b'
  ctx.font = `700 ${size}px "Space Grotesk", sans-serif`
  while (ctx.measureText(project.title).width > width - 56 && size > 28) {
    size -= 4
    ctx.font = `700 ${size}px "Space Grotesk", sans-serif`
  }
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(project.title, 28, 156)

  ctx.font = '500 16px "DM Sans", sans-serif'
  let x = 28
  project.tags.slice(0, 3).forEach((tag) => {
    const w = ctx.measureText(tag).width + 26
    if (x + w > width - 24) return
    ctx.strokeStyle = 'rgba(24,56,43,0.35)'
    ctx.lineWidth = 1.5
    roundRect(ctx, x, 186, w, 30, 15)
    ctx.stroke()
    ctx.fillStyle = '#3f5a4b'
    ctx.fillText(tag, x + 13, 207)
    x += w + 8
  })

  ctx.fillStyle = '#e97558'
  ctx.font = '700 15px "Space Grotesk", sans-serif'
  ctx.fillText('Live project  ↗', 28, height - 26)
  for (let i = 0; i < total; i += 1) {
    ctx.fillStyle = i === index ? '#18382b' : 'rgba(24,56,43,0.22)'
    ctx.beginPath()
    ctx.arc(width - 28 - (total - 1 - i) * 18, height - 31, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

// The desk setup behind the robot: desk, two monitors, plant, mug, rug and a pinboard.
// Units match the robot (about 4 units tall); the desk top is at y = 2.
export function createDesk(projects) {
  const group = new Group()
  const geometries = []
  const materials = []
  const textures = []
  const standard = (color, props = {}) => {
    const material = new MeshStandardMaterial({ color, roughness: 0.6, ...props })
    materials.push(material)
    return material
  }
  const add = (geometry, material, x, y, z, parent = group) => {
    geometries.push(geometry)
    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }

  // rug
  ;[['#f0a43a', 3.7], ['#f7d56a', 2.9], ['#fbeaa6', 2.1]].forEach(([color, radius], i) => {
    const rug = add(new CircleGeometry(radius, 64), standard(color, { roughness: 0.9 }), 0.5, 0.01 + i * 0.005, 0.5)
    rug.rotation.x = -Math.PI / 2
    rug.scale.set(1, 0.6, 1)
  })

  // desk
  const wood = standard('#d8b57d', { roughness: 0.55 })
  add(new RoundedBoxGeometry(4.8, 0.16, 1.9, 4, 0.06), standard('#fbfaf4', { roughness: 0.4 }), 1.4, 2.0, 0)
  ;[[-0.85, -0.7], [3.65, -0.7], [-0.85, 0.7], [3.65, 0.7]].forEach(([x, z]) => {
    add(new CylinderGeometry(0.07, 0.06, 1.92, 14), wood, x + 0.0, 0.96, z)
  })

  // monitors
  const code = makeScreen(512, 310)
  const showcase = makeScreen(512, 310)
  textures.push(code.texture, showcase.texture)
  drawCode(code)
  let index = 0
  drawProject(showcase, projects[0], 0, projects.length)
  const bezel = standard('#2a2b34', { roughness: 0.4, metalness: 0.3 })
  ;[{ x: 0.55, ry: 0.2, screen: code }, { x: 2.35, ry: -0.2, screen: showcase }].forEach(({ x, ry, screen }) => {
    const monitor = new Group()
    monitor.position.set(x, 2.08, -0.25)
    monitor.rotation.y = ry
    group.add(monitor)
    add(new RoundedBoxGeometry(0.62, 0.05, 0.36, 3, 0.02), bezel, 0, 0.025, 0.05, monitor)
    add(new RoundedBoxGeometry(0.12, 0.42, 0.07, 3, 0.03), bezel, 0, 0.26, -0.02, monitor)
    add(new RoundedBoxGeometry(1.84, 1.2, 0.1, 4, 0.06), bezel, 0, 0.98, 0, monitor)
    const material = new MeshBasicMaterial({ map: screen.texture, toneMapped: false })
    materials.push(material)
    add(new PlaneGeometry(1.7, 1.03), material, 0, 0.98, 0.056, monitor)
  })

  // keyboard, mouse, mug, plant
  add(new RoundedBoxGeometry(1.2, 0.05, 0.42, 3, 0.02), standard('#e6e3da'), 1.35, 2.105, 0.55)
  add(new SphereGeometry(0.11, 16, 12), standard('#e6e3da'), 2.3, 2.12, 0.55).scale.set(1, 0.55, 1.4)
  add(new CylinderGeometry(0.16, 0.14, 0.3, 24), standard('#e97558'), 3.35, 2.23, 0.4)
  const handle = add(new TorusGeometry(0.09, 0.025, 8, 16, Math.PI), standard('#e97558'), 3.5, 2.23, 0.4)
  handle.rotation.z = -Math.PI / 2
  add(new CylinderGeometry(0.2, 0.15, 0.3, 24), standard('#c9b8a4'), -0.35, 2.23, -0.35)
  const leaf = standard('#7cc04a', { roughness: 0.5 })
  ;[[-0.35, 0.28, 0], [-0.17, 0.2, 0.5], [-0.53, 0.2, -0.5]].forEach(([x, lean, tilt]) => {
    const l = add(new SphereGeometry(0.2, 16, 12), leaf, x, 2.65 + lean * 0.6, -0.35)
    l.scale.set(0.45, 1.5, 0.3)
    l.rotation.z = tilt
  })

  // pinboard on the back wall
  add(new RoundedBoxGeometry(3.0, 1.7, 0.1, 4, 0.06), standard('#e7d2a6'), 1.4, 4.3, -1.05)
  add(new RoundedBoxGeometry(2.8, 1.5, 0.06, 3, 0.04), standard('#a98765', { roughness: 0.9 }), 1.4, 4.3, -0.99)
  ;[['#fbfaf2', 0.55, 4.45, -0.12], ['#cfe0f6', 1.55, 4.1, 0.1], ['#fbfaf2', 2.25, 4.5, 0.06]].forEach(([color, x, y, tilt]) => {
    const note = add(new RoundedBoxGeometry(0.6, 0.72, 0.02, 2, 0.01), standard(color), x, y, -0.94)
    note.rotation.z = tilt
    add(new SphereGeometry(0.06, 12, 10), standard('#e97558'), x, y + 0.28, -0.91)
  })

  // The right monitor flips to the next project every few seconds.
  let last = 0
  return {
    group,
    update(time) {
      if (time - last > 3.4) {
        last = time
        index = (index + 1) % projects.length
        drawProject(showcase, projects[index], index, projects.length)
        showcase.texture.needsUpdate = true
      }
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
    },
  }
}
