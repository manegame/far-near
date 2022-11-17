<script>
    import { Vector3, Raycaster, Vector2 } from 'three'
    import { useFrame, useThrelte, PerspectiveCamera, OrthographicCamera, OrbitControls } from '@threlte/core'
    import { RigidBody, CollisionGroups, Collider, Debug } from '@threlte/rapier'
    import { createEventDispatcher, onDestroy } from 'svelte'
    import PointerLockControls from '$lib/components/controls/PointerLockControls.svelte'
    import { onTop } from "$lib/store"
    import { onMount } from "svelte"
  
    export let position = undefined
    export let playerCollisionGroups = [0]
    export let groundCollisionGroups = [15]
    export let radius = 0.3
    export let height = 1.7
    export let speed = 6
    export let jumpStrength = 4
  
    let rigidBody
    let lock

    let playerCamera
    let topViewCamera
  
    let forward = 0
    let backward = 0
    let left = 0
    let right = 0
    let grounded = false
    let pointerdown = false
    
    const dispatch = createEventDispatcher()
    
    const { scene, renderer } = useThrelte()

    const pointer = new Vector2();
    const raycaster = new Raycaster()
    
    const t = new Vector3()
  
    $: grounded ? dispatch('groundenter') : dispatch('groundexit')
  
    const lockControls = () => {
      lock()
    }

  
    if (!renderer) throw new Error()
  
    renderer.domElement.addEventListener('click', lockControls)
  
    onDestroy(() => {
      renderer.domElement.removeEventListener('click', lockControls)
    })
  
    useFrame(() => {
      raycaster.setFromCamera( pointer, playerCamera)
      const intersects = raycaster.intersectObjects(scene.children)

      for ( let i = 0; i < intersects.length; i ++ ) {
        if (pointerdown) {
          console.log(intersects[i])
        }
        // intersects[i].object.material.color.set( 0xff0000 );
      }

      if (!rigidBody) return
      // get direction
      const velVec = t.fromArray([right - left, 0, backward - forward])
      // sort rotate and multiply by speed
      velVec.applyEuler(playerCamera.rotation).multiplyScalar(speed)
      // don't override falling velocity
      const linVel = rigidBody.linvel()
      t.y = linVel.y
      // finally set the velocities and wake up the body
      rigidBody.setLinvel(t, true)
  
      // when body position changes update position prop for camera
      const pos = rigidBody.translation()
      position = { x: pos.x, y: pos.y, z: pos.z }

      const makeView = (camera, background, { left, bottom, width, height }) => {
        left = Math.floor( window.innerWidth * left );
        bottom = Math.floor( window.innerHeight * bottom );
        width = Math.floor( window.innerWidth * width );
        height = Math.floor( window.innerHeight * height );

        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);
        renderer.setScissorTest(true);
        renderer.setClearColor(background);
        renderer.render(scene, camera);
        camera.updateProjectionMatrix()
      }

      makeView(playerCamera, 0xffffff, {
        left: 0,
        bottom: 0,
        width: 1.0,
        height: 1.0
      })

      makeView(topViewCamera, 0xffffff, {
        left: 0.7,
        bottom: 0.7,
        width: 0.28,
        height: 0.28
      })

    })
  
    /** @param {KeyboardEvent} e */
    function onKeyDown(e) {
      switch (e.key) {
        case 's':
          backward = 1
          break
        case 'w':
          forward = 1
          break
        case 'a':
          left = 1
          break
        case 'd':
          right = 1
          break
        case ' ':
          if (!rigidBody || !grounded) break
          rigidBody.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true)
          break
        default:
          break
      }
    }
  
    /** @param {KeyboardEvent} e */
    function onKeyUp(e) {
      switch (e.key) {
        case 's':
          backward = 0
          break
        case 'w':
          forward = 0
          break
        case 'a':
          left = 0
          break
        case 'd':
          right = 0
          break
        default:
          break
      }
    }

    function onPointerMove (e) {
      pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    }

    function onPointerDown () {
      pointerdown = true
    }

    function onPointerUp () {
      pointerdown = false
    }

    onMount(() => {
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointerup', onPointerUp)
    })
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

<!-- FPS camera -->
<PerspectiveCamera bind:camera={playerCamera} bind:position  fov={90}>
  <PointerLockControls pointerSpeed={2.0} bind:lock />
</PerspectiveCamera>

<!-- Top view camera -->
<!-- <PerspectiveCamera position={{ y: 10, x: position.x, z: position.z }} rotation={{ x: - Math.PI / 2 }} bind:camera={topViewCamera} fov={90}>
</PerspectiveCamera> -->
<OrthographicCamera position={{ y: 10, x: position.x, z: position.z }} rotation={{ x: - Math.PI / 2 }} bind:camera={topViewCamera}>
</OrthographicCamera>

<!-- What is this? -->
<RigidBody bind:rigidBody {position} enabledRotations={[false, false, false]}>

<!-- Player -->
<CollisionGroups groups={playerCollisionGroups}>
  <Collider shape={'capsule'} args={[height / 2 - radius, radius]} />
</CollisionGroups>

<CollisionGroups groups={groundCollisionGroups}>
  <Collider
    sensor
    on:sensorenter={() => (grounded = true)}
    on:sensorexit={() => (grounded = false)}
    shape={'ball'}
    args={[radius * 1.2]}
    position={{ y: -height / 2 + radius }}
  />
</CollisionGroups>
</RigidBody>
