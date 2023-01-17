<script>
  import {
    Vector2,
    Vector3,
    Raycaster
  } from "three"
  import {
    useFrame,
    useThrelte,
    PerspectiveCamera
  } from "@threlte/core"
  import { RigidBody, CollisionGroups, Collider, Debug } from "@threlte/rapier"
  import PointerLockControls from "$lib/components/controls/PointerLockControls.svelte"
  import { playerPosition } from "$lib/stores"
  import { multiCameraSetup } from "$lib/components/cameras"
  import { onMount } from "svelte"
  import { currentHit, closestObject, getChildren } from "$lib/functionality/raycaster"

  export let position = undefined
  export let playerCollisionGroups = [0]
  export const groundCollisionGroups = [15]
  export let radius = 0.3
  export let height = 1.7
  export let grounded = false
  
  const cameras = []
  const views = [{ left: 0, bottom: 0, width: 1.0, height: 1.0 }]
  const raycaster = new Raycaster()
  const pointer = new Vector2()

  let rigidBody
  let lock
  let rotation = new Vector3(0, 1, 0)
  let pointerdown // do not remove

  const { scene, renderer } = useThrelte()

  if (!renderer) throw new Error()

  useFrame(() => {
    multiCameraSetup(cameras, renderer, scene, views)
  })

  function raycastClosest  (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, cameras[0]);

    const intersects = raycaster.intersectObjects(getChildren(scene));

    return closestObject(intersects)
  }

  function processHit (object) {
    $currentHit = object
  }

  function onPointerMove(e) {
    const closest = raycastClosest(e)
    processHit(closest)
  }

  function onPointerDown(e) {
    pointerdown = true
    const closest = raycastClosest(e)
    processHit(closest)
  }

  function onPointerUp() {
    pointerdown = false
  }

  onMount(() => {
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
  })

  $: playerPosition.set(position)
</script>

<!-- FPS camera -->
<PerspectiveCamera
  bind:camera={cameras[0]}
  bind:position
  fov={70}
  far={20000}
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