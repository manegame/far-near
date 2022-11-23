<script>
  import {
    Vector3,
    Raycaster,
    Vector2,
    DirectionalLight,
    DirectionalLightHelper,
    CameraHelper
  } from "three"
  import {
    useFrame,
    useThrelte,
    PerspectiveCamera,
    OrthographicCamera,
    Three
  } from "@threlte/core"
  import { RigidBody, CollisionGroups, Collider, Debug } from "@threlte/rapier"
  import { createEventDispatcher, onDestroy } from "svelte"
  // import FlyControls from "$lib/components/controls/FlyControls.svelte"
  import PointerLockControls from "$lib/components/controls/PointerLockControls.svelte"
  import { onTop } from "$lib/store"
  import { onMount } from "svelte"

  export let position = undefined
  export let playerCollisionGroups = [0]
  export let groundCollisionGroups = [15]
  export let radius = 0.3
  export let height = 1.7
  export let grounded = false
  
  const cameras = []
  const views = [
    { left: 0, bottom: 0, width: 1.0, height: 1.0 },
    { left: 0.7, bottom: 0.7, width: 0.3, height: 0.3 }
  ]

  let rigidBody
  let lock
  let hit = undefined
  let oldHit = undefined

  let pointerdown = false

  const dispatch = createEventDispatcher()

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
    const intersects = raycaster.intersectObjects(scene.children.filter(c => !(c instanceof DirectionalLight) && !(c instanceof DirectionalLightHelper)))

    for (let i = 0; i < intersects.length; i++) {
      if (pointerdown) {
        // Do something with the intersection
        hit = intersects[0]
      }
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

  function changeOpacity (h, opacity = 1.0) {
    if (h.object.material && h.object.material.length === 6) {
      h.object.material.forEach(mat => {
        mat.opacity = opacity
      })
    }
  }

  function processHit () {
    changeOpacity(hit, 1.0)

    oldHit = hit
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