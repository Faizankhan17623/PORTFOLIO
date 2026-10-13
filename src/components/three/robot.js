import { CapsuleGeometry, CylinderGeometry, Group, Mesh, SphereGeometry, TorusGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// The portfolio robot, standing 4.2 units tall with its feet at y = 0. Shared by the hero and the scan section.
// `solid(color, roughness, extra)` creates a material, so every scene decides how the robot is drawn.
// The head and the arms are groups pivoting at the neck and shoulders, so scenes can turn and wave them.
export function createRobot(solid) {
  const shell = solid('#f1efe6', 0.35, { metalness: 0.25 }) // cream outer plates
  const body = solid('#2f6a50', 0.4, { metalness: 0.3 }) // brand green torso
  const joint = solid('#22302a', 0.5, { metalness: 0.6 }) // dark joints
  const accent = solid('#e97558', 0.45, { metalness: 0.2 }) // coral details
  const screen = solid('#0a1511', 0.15, { metalness: 0.4 })
  const glow = solid('#d4f27f', 0.3, { emissive: '#d4f27f', emissiveIntensity: 1.4 })

  const root = new Group()
  const geometries = []
  const add = (parent, geometry, material, x, y, z) => {
    geometries.push(geometry)
    const mesh = new Mesh(geometry, material)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }

  const head = new Group()
  head.position.set(0, 2.8, 0)
  root.add(head)

  const arms = [-1, 1].map((side) => {
    const arm = new Group()
    arm.position.set(side * 0.82, 2.45, 0)
    root.add(arm)
    add(arm, new SphereGeometry(0.27, 24, 18), joint, 0, 0, 0) // shoulder
    const limb = add(arm, new CapsuleGeometry(0.12, 0.85, 12, 24), shell, side * 0.08, -0.57, 0)
    limb.rotation.z = -side * 0.1
    add(arm, new SphereGeometry(0.17, 20, 14), accent, side * 0.13, -1.15, 0) // hand
    return arm
  })

  const blinkers = []
  ;[-1, 1].forEach((side) => {
    add(root, new RoundedBoxGeometry(0.5, 0.24, 0.72, 4, 0.1), shell, side * 0.27, 0.12, 0.08) // foot
    add(root, new CylinderGeometry(0.14, 0.17, 0.62, 24), joint, side * 0.27, 0.55, 0) // shin
    add(root, new SphereGeometry(0.19, 24, 16), shell, side * 0.27, 0.95, 0) // knee
    add(root, new CylinderGeometry(0.15, 0.14, 0.45, 24), shell, side * 0.27, 1.22, 0) // thigh
    const ear = add(head, new CylinderGeometry(0.2, 0.2, 0.14, 28), accent, side * 0.82, 0.45, 0) // ear dish
    ear.rotation.z = Math.PI / 2
    blinkers.push(add(head, new RoundedBoxGeometry(0.2, 0.26, 0.05, 3, 0.05), glow, side * 0.27, 0.5, 0.53)) // eye
  })

  add(root, new RoundedBoxGeometry(1.0, 0.3, 0.62, 4, 0.12), joint, 0, 1.55, 0) // pelvis
  add(root, new RoundedBoxGeometry(1.25, 1.15, 0.85, 6, 0.22), body, 0, 2.2, 0) // torso
  add(root, new RoundedBoxGeometry(0.62, 0.4, 0.06, 3, 0.07), screen, 0, 2.32, 0.43) // chest panel
  add(root, new RoundedBoxGeometry(0.46, 0.08, 0.05, 2, 0.03), glow, 0, 2.32, 0.47) // chest light bar
  add(root, new SphereGeometry(0.055, 12, 10), accent, -0.17, 2.0, 0.43) // chest buttons
  add(root, new SphereGeometry(0.055, 12, 10), shell, 0, 2.0, 0.43)
  add(root, new SphereGeometry(0.055, 12, 10), glow, 0.17, 2.0, 0.43)
  add(root, new CylinderGeometry(0.16, 0.2, 0.24, 24), joint, 0, 2.76, 0) // neck

  add(head, new RoundedBoxGeometry(1.5, 0.98, 1.0, 6, 0.3), shell, 0, 0.5, 0) // head
  add(head, new RoundedBoxGeometry(1.2, 0.64, 0.06, 3, 0.16), screen, 0, 0.5, 0.5) // face screen
  const smile = add(head, new TorusGeometry(0.13, 0.02, 10, 24, Math.PI), glow, 0, 0.37, 0.53)
  smile.rotation.z = Math.PI
  add(head, new CylinderGeometry(0.03, 0.03, 0.34, 12), joint, 0, 1.16, 0) // antenna
  add(head, new SphereGeometry(0.09, 16, 12), glow, 0, 1.38, 0) // antenna tip

  return { root, head, arms: { left: arms[0], right: arms[1] }, blinkers, geometries }
}
