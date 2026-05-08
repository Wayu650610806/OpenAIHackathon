import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STATE_COLORS = {
  no_person: '#94A3B8',
  standing: '#F59E0B',
  walking: '#10B981',
  sitting: '#8B5CF6',
  lying: '#3B82F6',
  get_up: '#F97316',
  get_down: '#EF4444',
}

const POSES = {
  standing: {
    root: [0, 0.05, 0], body: [0, 0, 0], torso: [0, 0, 0],
    head: [0, 0, 0], leftArm: [0, 0, -0.45], rightArm: [0, 0, 0.45],
    leftLeg: [0.08, 0, -0.12], rightLeg: [-0.08, 0, 0.12],
  },
  walking: {
    root: [0, 0.06, 0], body: [0, 0, 0], torso: [0.08, 0, 0.08],
    head: [0.03, 0, 0], leftArm: [0.32, 0, -0.32], rightArm: [-0.32, 0, 0.32],
    leftLeg: [-0.12, 0, -0.04], rightLeg: [0.12, 0, 0.04],
  },
  sitting: {
    root: [0, -0.1, 0.08], body: [-0.12, 0, 0], torso: [-0.1, 0, 0],
    head: [-0.06, 0, 0], leftArm: [0.2, 0, -0.55], rightArm: [0.2, 0, 0.55],
    leftLeg: [1.22, 0, -0.04], rightLeg: [1.22, 0, 0.04],
  },
  lying: {
    root: [1.0, 0.62, 0], body: [0, 0, Math.PI / 2], torso: [0, 0, 0],
    head: [0, 0, 0], leftArm: [0, 0, -0.08], rightArm: [0, 0, 0.08],
    leftLeg: [0.15, 0, -0.08], rightLeg: [-0.15, 0, 0.08],
  },
  get_up: {
    root: [0.0, -0.02, 0.56], body: [-0.58, 0, 0], torso: [-0.34, 0, 0],
    head: [-0.18, 0, 0], leftArm: [0.85, 0, -0.75], rightArm: [0.4, 0, 0.5],
    leftLeg: [0.86, 0, -0.08], rightLeg: [0.36, 0, 0.08],
  },
  get_down: {
    root: [-0.9, 0.12, 0.78], body: [0.1, 0, Math.PI / 2.55], torso: [0.1, 0, 0],
    head: [0.1, 0, 0], leftArm: [0.75, 0, -1.0], rightArm: [0.65, 0, 0.9],
    leftLeg: [0.35, 0, -0.3], rightLeg: [-0.3, 0, 0.25],
  },
}

function makeMaterial(color, roughness = 0.65) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.03 })
}

function roundedBox(w, h, d, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMaterial(color))
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function limb(length, radius, color) {
  const group = new THREE.Group()
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), makeMaterial(color))
  mesh.position.y = -length / 2
  mesh.castShadow = true
  group.add(mesh)
  return group
}

function createAvatar() {
  const avatar = new THREE.Group()
  const body = new THREE.Group()
  avatar.add(body)

  const shirt = makeMaterial('#60A5FA')
  const pants = makeMaterial('#475569')
  const skin = makeMaterial('#FCD34D')
  const hair = makeMaterial('#D1D5DB')

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.58, 8, 24), shirt)
  torso.position.y = 1.22
  torso.castShadow = true
  body.add(torso)

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.08, 6, 12), skin)
  neck.position.y = 1.68
  neck.castShadow = true
  body.add(neck)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 32, 24), skin)
  head.position.y = 1.92
  head.castShadow = true
  body.add(head)

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), hair)
  hairCap.position.y = 2.02
  hairCap.scale.set(1, 0.55, 1)
  hairCap.castShadow = true
  body.add(hairCap)

  const leftArm = limb(0.66, 0.055, '#FCD34D')
  const rightArm = limb(0.66, 0.055, '#FCD34D')
  leftArm.position.set(-0.34, 1.44, 0)
  rightArm.position.set(0.34, 1.44, 0)
  body.add(leftArm, rightArm)

  const leftLeg = limb(0.84, 0.075, '#475569')
  const rightLeg = limb(0.84, 0.075, '#475569')
  leftLeg.position.set(-0.13, 0.82, 0)
  rightLeg.position.set(0.13, 0.82, 0)
  body.add(leftLeg, rightLeg)

  const leftShoe = roundedBox(0.18, 0.08, 0.28, '#1F2937')
  const rightShoe = roundedBox(0.18, 0.08, 0.28, '#1F2937')
  leftShoe.position.set(0, -0.86, 0.08)
  rightShoe.position.set(0, -0.86, 0.08)
  leftLeg.add(leftShoe)
  rightLeg.add(rightShoe)

  return { avatar, body, torso, head, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe }
}

function createFurniture() {
  const chair = new THREE.Group()
  chair.name = 'chair'
  const seat = roundedBox(1.0, 0.1, 0.72, '#CBD5E1')
  seat.position.set(0, 0.46, 0)
  const back = roundedBox(1.0, 0.86, 0.1, '#94A3B8')
  back.position.set(0, 0.86, -0.36)
  chair.add(seat, back)
  ;[-0.36, 0.36].forEach(z => {
    ;[-0.38, 0.38].forEach(x => {
      const leg = roundedBox(0.08, 0.5, 0.08, '#64748B')
      leg.position.set(x, 0.22, z)
      chair.add(leg)
    })
  })
  chair.position.set(0, 0, 0)

  const bed = new THREE.Group()
  bed.name = 'bed'
  const mattress = roundedBox(2.25, 0.24, 0.92, '#CBD5E1')
  mattress.position.set(-0.08, 0.31, 0)
  const pillow = roundedBox(0.48, 0.18, 0.78, '#E2E8F0')
  pillow.position.set(-0.9, 0.56, 0)
  bed.add(mattress, pillow)

  return { chair, bed }
}

function applyPose(rig, pose) {
  rig.avatar.position.set(...pose.root)
  rig.body.rotation.set(...pose.body)
  rig.torso.rotation.set(...pose.torso)
  rig.head.rotation.set(...pose.head)
  rig.leftArm.rotation.set(...pose.leftArm)
  rig.rightArm.rotation.set(...pose.rightArm)
  rig.leftLeg.rotation.set(...pose.leftLeg)
  rig.rightLeg.rotation.set(...pose.rightLeg)
  rig.leftShoe.visible = true
  rig.rightShoe.visible = true
}

export default function RoomScene({ state = 'standing', isFall = false }) {
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const stateRef = useRef(state)
  const fallRef = useRef(isFall)

  useEffect(() => {
    stateRef.current = state
    fallRef.current = isFall
  }, [state, isFall])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(isFall ? '#FFF1F2' : '#F8FAFC')
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(3.2, 2.4, 4.4)
    camera.lookAt(0, 0.8, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const ambient = new THREE.HemisphereLight('#FFFFFF', '#CBD5E1', 2.4)
    scene.add(ambient)
    const key = new THREE.DirectionalLight('#FFFFFF', 2.8)
    key.position.set(4, 5, 3)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.55, 64),
      new THREE.MeshStandardMaterial({ color: '#E0F2FE', roughness: 0.88 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(5, 10, '#BFDBFE', '#E2E8F0')
    grid.position.y = 0.006
    scene.add(grid)

    const rig = createAvatar()
    scene.add(rig.avatar)
    const { chair, bed } = createFurniture()
    scene.add(chair, bed)

    const presenceRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.012, 12, 80),
      new THREE.MeshBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.45 })
    )
    presenceRing.rotation.x = Math.PI / 2
    presenceRing.position.y = 0.04
    scene.add(presenceRing)

    const impact = new THREE.Group()
    for (let i = 0; i < 10; i += 1) {
      const ray = roundedBox(0.035, 0.035, 0.48, '#EF4444')
      ray.position.set(0, 0.08, 0)
      ray.rotation.y = (i / 10) * Math.PI * 2
      ray.translateZ(0.38)
      impact.add(ray)
    }
    impact.visible = false
    scene.add(impact)

    const clock = new THREE.Clock()
    const target = {
      root: new THREE.Vector3(),
      body: new THREE.Euler(),
      torso: new THREE.Euler(),
      head: new THREE.Euler(),
      leftArm: new THREE.Euler(),
      rightArm: new THREE.Euler(),
      leftLeg: new THREE.Euler(),
      rightLeg: new THREE.Euler(),
    }

    function setSize() {
      const rect = host.getBoundingClientRect()
      const width = Math.max(280, rect.width)
      const height = Math.max(240, rect.height)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    setSize()

    const resizeObserver = new ResizeObserver(setSize)
    resizeObserver.observe(host)

    function tick() {
      const elapsed = clock.getElapsedTime()
      const currentState = stateRef.current
      const pose = POSES[currentState] || POSES.standing

      target.root.set(...pose.root)
      target.body.set(...pose.body)
      target.torso.set(...pose.torso)
      target.head.set(...pose.head)
      target.leftArm.set(...pose.leftArm)
      target.rightArm.set(...pose.rightArm)
      target.leftLeg.set(...pose.leftLeg)
      target.rightLeg.set(...pose.rightLeg)

      rig.avatar.position.lerp(target.root, 0.12)
      rig.body.rotation.x += (target.body.x - rig.body.rotation.x) * 0.12
      rig.body.rotation.y += (target.body.y - rig.body.rotation.y) * 0.12
      rig.body.rotation.z += (target.body.z - rig.body.rotation.z) * 0.12

      ;['torso', 'head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'].forEach(part => {
        rig[part].rotation.x += (target[part].x - rig[part].rotation.x) * 0.14
        rig[part].rotation.y += (target[part].y - rig[part].rotation.y) * 0.14
        rig[part].rotation.z += (target[part].z - rig[part].rotation.z) * 0.14
      })

      if (currentState === 'walking') {
        const stride = Math.sin(elapsed * 7.2)
        rig.avatar.position.x = Math.sin(elapsed * 1.5) * 0.16
        rig.avatar.position.y += Math.abs(stride) * 0.025
        rig.leftLeg.rotation.x += stride * 0.12
        rig.rightLeg.rotation.x -= stride * 0.12
        rig.leftArm.rotation.x -= stride * 0.16
        rig.rightArm.rotation.x += stride * 0.16
      }

      if (currentState === 'standing') {
        rig.avatar.position.y += Math.sin(elapsed * 2) * 0.018
      }

      if (currentState === 'get_up') {
        rig.avatar.position.y += Math.sin(elapsed * 4) * 0.035
      }

      if (currentState === 'get_down') {
        rig.avatar.position.y += Math.sin(elapsed * 10) * 0.018
      }

      if (currentState === 'no_person') {
        rig.avatar.visible = false
        presenceRing.visible = true
        presenceRing.scale.setScalar(1 + Math.sin(elapsed * 2.4) * 0.08)
        presenceRing.material.opacity = 0.32 + Math.sin(elapsed * 3) * 0.08
      } else {
        rig.avatar.visible = true
        presenceRing.visible = false
      }

      chair.visible = currentState === 'sitting'
      bed.visible = ['lying', 'get_up', 'get_down'].includes(currentState)
      impact.visible = Boolean(fallRef.current)
      impact.position.set(-0.9, 0.02, 0.78)
      impact.rotation.y += 0.045
      impact.scale.setScalar(1 + Math.sin(elapsed * 7) * 0.08)
      scene.background.set(fallRef.current ? '#FFF1F2' : '#F8FAFC')
      floor.material.color.set(fallRef.current ? '#FEE2E2' : '#E0F2FE')

      renderer.render(scene, camera)
      sceneRef.current.frame = requestAnimationFrame(tick)
    }

    applyPose(rig, POSES[stateRef.current] || POSES.standing)
    sceneRef.current = { renderer, frame: requestAnimationFrame(tick) }

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(sceneRef.current?.frame)
      renderer.dispose()
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(mat => mat.dispose())
          else obj.material.dispose()
        }
      })
      host.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full h-full min-h-[260px] overflow-hidden rounded-xl bg-slate-50">
      <div ref={hostRef} className="absolute inset-0" aria-label={`3D ${state} pose animation`} />
      <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
        {state.replace(/_/g, ' ')}
      </div>
    </div>
  )
}
