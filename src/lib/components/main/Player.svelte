<script>
    import { Vector3 } from 'three'
    import { useFrame, useThrelte, PerspectiveCamera } from '@threlte/core'
    import { RigidBody, CollisionGroups, Collider } from '@threlte/rapier'
    import { createEventDispatcher, onDestroy } from 'svelte'
    import PointerLockControls from '$lib/components/controls/PointerLockControls.svelte'
  
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
  
    const t = new Vector3()
    const dispatch = createEventDispatcher()
  
    $: grounded ? dispatch('groundenter') : dispatch('groundexit')
  
    const lockControls = () => {
      lock()
    }

    const { scene, renderer } = useThrelte()
  
    if (!renderer) throw new Error()
  
    renderer.domElement.addEventListener('click', lockControls)
  
    onDestroy(() => {
      renderer.domElement.removeEventListener('click', lockControls)
    })
  
    useFrame(() => {
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

      // for ( let ii = 0; ii < views.length; ii++ ) {
      //   const view = views[ ii ];
      //   const camera = cameras[ii];

      //   console.log(camera.id)

      //   const left = Math.floor( window.innerWidth * view.left );
      //   const bottom = Math.floor( window.innerHeight * view.bottom );
      //   const width = Math.floor( window.innerWidth * view.width );
      //   const height = Math.floor( window.innerHeight * view.height );

      //   renderer.setViewport( left, bottom, width, height );
      //   renderer.setScissor( left, bottom, width, height );
      //   renderer.setScissorTest( true );
      //   renderer.setClearColor( view.background );
      // }

      makeView(playerCamera, 0xffffff, {
        left: 0,
        bottom: 0,
        width: 1.0,
        height: 1.0
      })

      makeView(topViewCamera, 0xaaaaaa, {
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

    $: console.log(playerCamera, topViewCamera)
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

<PerspectiveCamera bind:camera={playerCamera} bind:position  fov={90}>
  <PointerLockControls pointerSpeed={2.0} bind:lock />
</PerspectiveCamera>

<!-- Top view camera -->
<PerspectiveCamera position={{ y: 10, x: position.x, z: position.z }} rotation={{ x: - Math.PI / 2 }} bind:camera={topViewCamera} fov={90}>
</PerspectiveCamera>

<RigidBody bind:rigidBody {position} enabledRotations={[false, false, false]}>
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