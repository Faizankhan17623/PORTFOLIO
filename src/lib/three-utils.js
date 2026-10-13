import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { prefersReducedMotion } from './motion'

// Phones and tablets get lighter effects (no glass refraction, lower pixel density).
export const isLowPower = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760

// Tiny value noise, used once to turn smooth spheres into soft clay blobs.
const hash = (x, y, z) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return h - Math.floor(h)
}
const fade = (t) => t * t * (3 - 2 * t)
export function valueNoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi)
  const lerp = (a, b, t) => a + (b - a) * t
  const layer = (dz) => lerp(
    lerp(hash(xi, yi, zi + dz), hash(xi + 1, yi, zi + dz), xf),
    lerp(hash(xi, yi + 1, zi + dz), hash(xi + 1, yi + 1, zi + dz), xf),
    yf,
  )
  return lerp(layer(0), layer(1), zf)
}

/**
 * Puts a WebGL canvas inside `container` and runs `setup`'s scene.
 * `setup({ renderer, scene, camera, reduced, lowPower })` returns { update(time, dt), resize(w, h), dispose() }.
 * The loop only runs while the container is on screen and the tab is visible; with reduced motion it
 * renders a single still frame. Returns a cleanup function. Never throws: with no WebGL it just does nothing.
 */
export function mountScene(container, setup, { fov = 32, maxDpr = 1.75 } = {}) {
  let renderer
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return () => {}
  }

  const reduced = prefersReducedMotion()
  const lowPower = isLowPower()
  const canvas = renderer.domElement
  canvas.style.cssText = 'display:block;width:100%;height:100%'
  container.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(fov, 1, 0.1, 100)
  const api = setup({ renderer, scene, camera, reduced, lowPower })

  let raf = 0
  let running = false
  let visible = true
  let last = 0
  const clock = { start: performance.now() }
  // If frames come slowly (weak graphics card), the picture is rendered at a lower resolution instead of stuttering.
  const perf = { quality: 1, warmup: 0, frames: 0, time: 0 }

  const renderOnce = () => renderer.render(scene, camera)
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (perf.warmup < 45) perf.warmup += 1
    else {
      perf.frames += 1
      perf.time += dt
      if (perf.frames === 60) {
        if (perf.time / perf.frames > 1 / 32 && perf.quality > 0.5) { perf.quality = Math.max(0.5, perf.quality - 0.25); applySize() }
        perf.frames = 0
        perf.time = 0
      }
    }
    api.update((now - clock.start) / 1000, dt)
    renderer.render(scene, camera)
  }
  const sync = () => {
    const shouldRun = visible && !document.hidden && !reduced
    if (shouldRun && !running) {
      running = true
      perf.warmup = 0
      last = performance.now()
      raf = requestAnimationFrame(frame)
    } else if (!shouldRun && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const applySize = () => {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : maxDpr) * perf.quality)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    return [width, height]
  }
  const resize = () => {
    const [width, height] = applySize()
    api.resize?.(width, height)
    if (!running) { api.update(1.2, 0); renderOnce() }
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { rootMargin: '120px' })
  visibilityObserver.observe(container)
  document.addEventListener('visibilitychange', sync)
  const onContextLost = (event) => { event.preventDefault(); visible = false; sync() }
  canvas.addEventListener('webglcontextlost', onContextLost)

  resize()
  sync()

  return () => {
    running = false
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
    document.removeEventListener('visibilitychange', sync)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    api.dispose?.()
    renderer.dispose()
    canvas.remove()
  }
}

// Pointer position as -1..1 on both axes, shared by the scenes.
export function trackPointer() {
  const pointer = { x: 0, y: 0 }
  const onMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return { pointer, stop: () => window.removeEventListener('pointermove', onMove) }
}
