<script>
  import {
    Raycaster,
    Vector2,
    SpotLight
  } from "three"
  import {
    useFrame,
    useThrelte,
    PerspectiveCamera,
    Three
  } from "@threlte/core"
  import { getChildren } from "$lib/functionality/raycaster"
  import { RigidBody, CollisionGroups, Collider, Debug } from "@threlte/rapier"
  import { onDestroy } from "svelte"
  // import FlyControls from "$lib/components/controls/FlyControls.svelte"
  import PointerLockControls from "$lib/components/controls/PointerLockControls.svelte"
  import { lighting, playerPosition, activeCanvas } from "$lib/stores"
  import { hitPosition, hitLookAt, closestObject } from "$lib/functionality/raycaster"
  import { onMount } from "svelte"

  export let position = undefined
  export let playerCollisionGroups = [0]
  export const groundCollisionGroups = [15]
  export let radius = 0.3
  export let height = 1.7
  export let grounded = false
  
  const cameras = []
  const views = [
    { left: 0, bottom: 0, width: 1.0, height: 1.0 },
    { left: 0.7, bottom: 0.7, width: 0.3, height: 0.3 }
  ]
  
  let hit = undefined
  let previousHit = undefined

  let rigidBody
  let lock
  let light
  let pointerdown
  let rotation

  const { scene, renderer } = useThrelte()

  const pointer = new Vector2()
  const raycaster = new Raycaster()

  const lockControls = () => {
    lock()
  }

  if (!renderer) throw new Error()

  renderer.domElement.addEventListener("click", lockControls)

  $: if (hit) processHit()

  onDestroy(() => {
    renderer.domElement.removeEventListener("click", lockControls)
  })

  const makeView = (camera, background, { left, bottom, width, height }) => {
    left = Math.floor(window.innerWidth * left)
    bottom = Math.floor(window.innerHeight * bottom)
    width = Math.floor(window.innerWidth * width)
    height = Math.floor(window.innerHeight * height)

    renderer.setViewport(left, bottom, width, height)
    renderer.setScissor(left, bottom, width, height)
    renderer.setScissorTest(true)
    renderer.setClearColor(background)
    renderer.render(scene, camera)
    camera.updateProjectionMatrix()
  }

  useFrame(() => {
    raycaster.setFromCamera(pointer, cameras[0])
    const children = getChildren(scene)
    const intersects = raycaster.intersectObjects(children)

    if (intersects.length > 0) {
      const hit = closestObject(intersects)

      hitPosition.set(hit.point)
      hitLookAt.set(hit.face.normal)
      
      if (previousHit?.object === hit?.object) return

      if (hit?.object.userData.isImageCanvas) {
        lightsOff()
      }

      $activeCanvas = hit?.object.userData?.uuid

      if (previousHit?.object.userData.isImageCanvas && !hit?.object.userData.isImageCanvas) {
        lightsOn()
      }
      previousHit = hit
    }

    if (cameras.length > 0) {
      for (let i = 0; i < cameras.length; i++) {
        makeView(cameras[i], 0xfffff, views[i])
      }
    }
  })

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  function onPointerDown() {
    pointerdown = true
  }

  function onPointerUp() {
    pointerdown = false
  }
  
  function lightsOff () {
    lighting.set({
      ambient: 0.2,
      color: { r: 0.2, g: 0.2, b: 0.2 }
  })
  }
  
  function lightsOn () {
    lighting.set({
      ambient: 0.9,
      color: { r: 0.9, g: 0.9, b: 0.9 }
    })
  }

  $: {
    if (position) {
      playerPosition.set(position)
    }
  }

  onMount(() => {
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
  })

</script>

<!-- FPS camera -->
<PerspectiveCamera
  bind:camera={cameras[0]}
  bind:position
  bind:rotation={rotation}
  fov={70}
  far={11000}
>
  <PointerLockControls
    bind:position={position}
    bind:rigidBody={rigidBody}
    bind:grounded={grounded}
    bind:lock
    pointerSpeed={2.0}
    fly
  />
    <Three
    bind:ref={light}
    position={position}
    rotation={rotation}
    type={SpotLight}
    args={[0xffffff, 100, 1000, ]}
  />
</PerspectiveCamera>

<!-- Player -->
<RigidBody
  bind:rigidBody
  {position}
  enabledRotations={[false, false, false]}
  >
  <CollisionGroups
    groups={playerCollisionGroups}>
    <Collider shape={"capsule"} args={[height / 2 - radius, radius]} />
  </CollisionGroups>
</RigidBody>
<!-- <Debug /> -->