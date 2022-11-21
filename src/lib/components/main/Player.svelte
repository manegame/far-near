<script>
  import { Vector3, Raycaster, Vector2 } from "three"
  import {
    useFrame,
    useThrelte,
    PerspectiveCamera,
    OrthographicCamera,
    OrbitControls,
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

  let rigidBody
  let lock

  let playerCamera
  let topViewCamera

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

  onDestroy(() => {
    renderer.domElement.removeEventListener("click", lockControls)
  })

  useFrame(() => {
    raycaster.setFromCamera(pointer, playerCamera)
    const intersects = raycaster.intersectObjects(scene.children)

    for (let i = 0; i < intersects.length; i++) {
      if (pointerdown) {
        // Do something with the intersection
        // console.log(intersects[i])
      }
    }

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

    makeView(playerCamera, 0xffffff, {
      left: 0,
      bottom: 0,
      width: 1.0,
      height: 1.0,
    })

    makeView(topViewCamera, 0xffffff, {
      left: 0.7,
      bottom: 0.7,
      width: 0.28,
      height: 0.28,
    })
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

  onMount(() => {
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
  })

</script>
<!-- Top view camera -->
<!-- <PerspectiveCamera position={{ y: 10, x: position.x, z: position.z }} rotation={{ x: - Math.PI / 2 }} bind:camera={topViewCamera} fov={90}>
</PerspectiveCamera> -->

<!-- FPS camera -->
<PerspectiveCamera
  bind:camera={playerCamera}
  bind:position
  fov={90}
>
  <PointerLockControls
    bind:position={position}
    bind:rigidBody={rigidBody}
    bind:grounded={grounded}
    bind:lock
    fly
    pointerSpeed={2.0}
  />
</PerspectiveCamera>

<OrthographicCamera
  position={{ y: 10, x: position.x, z: position.z }}
  rotation={{ x: -Math.PI / 2 }}
  bind:camera={topViewCamera}
/>

<!-- Player -->
<RigidBody
  bind:rigidBody
  {position}
  enabledRotations={[false, false, false]}
>
  <CollisionGroups groups={playerCollisionGroups}>
    <Collider shape={"capsule"} args={[height / 2 - radius, radius]} />
  </CollisionGroups>

  <CollisionGroups groups={groundCollisionGroups}>
    <Collider
      sensor
      on:sensorenter={() => (grounded = true)}
      on:sensorexit={() => (grounded = false)}
      shape={"ball"}
      args={[radius * 1.2]}
      position={{ y: -height / 2 + radius }}
    />
  </CollisionGroups>
</RigidBody>