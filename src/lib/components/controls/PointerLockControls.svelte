<script>
    import { createEventDispatcher, onDestroy } from 'svelte'
    import { Euler, Camera, Vector3 } from 'three'
    import { useThrelte, useParent, useFrame } from '@threlte/core'
  
    // Set to constrain the pitch of the camera
    // Range is 0 to Math.PI radians
    export let minPolarAngle = 0 // radians
    export let maxPolarAngle = Math.PI // radians
    export let pointerSpeed = 1.0
    export let jumpStrength = 4
    export let cameraSpeed = 9
    export let grounded = false
    export let position
    export let rigidBody
    export let fly = false
  
    // T?
    const t = new Vector3()
    let isLocked = false
    
    const { renderer, invalidate } = useThrelte()
    const domElement = renderer.domElement
    const camera = useParent()
    const dispatch = createEventDispatcher()
  
    const _euler = new Euler(0, 0, 0, 'YXZ')
    const _PI_2 = Math.PI / 2

    const moveState = {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      forward: 0,
      backward: 0
      // pitchUp: 0,
      // pitchDown: 0,
      // yawLeft: 0,
      // yawRight: 0,
      // rollLeft: 0,
      // rollRight: 0
    };
  
    if (!renderer) {
      throw new Error('Threlte Context missing: Is <PointerLockControls> a child of <Canvas>?')
    }
    if (!($camera instanceof Camera)) {
      throw new Error('Parent missing: <PointerLockControls> need to be a child of a <Camera>')
    }
  
    const onChange = () => {
      invalidate('PointerLockControls: change event')
      dispatch('change')
    }
  
    export const lock = () => domElement.requestPointerLock()
    export const unlock = () => document.exitPointerLock()
  
    domElement.addEventListener('mousemove', onMouseMove)
    domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange)
    domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError)
  
    onDestroy(() => {
      domElement.removeEventListener('mousemove', onMouseMove)
      domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange)
      domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError)
    })
  
    /**
     * @param {MouseEvent} event
     */
    function onMouseMove(event) {
      const { movementX, movementY } = event

      moveState.up = Math.sign($camera.rotation.z) * -1
      moveState.down = Math.sign($camera.rotation.z)
      // console.log($camera.rotation.z)
  
      _euler.setFromQuaternion($camera.quaternion)
  
      _euler.y -= movementX * 0.002 * pointerSpeed
      _euler.x -= movementY * 0.002 * pointerSpeed
  
      _euler.x = Math.max(_PI_2 - maxPolarAngle, Math.min(_PI_2 - minPolarAngle, _euler.x))
  
      $camera.quaternion.setFromEuler(_euler)
  
      onChange()
    }
  
    function onPointerlockChange() {
      if (document.pointerLockElement === domElement) {
        dispatch('lock')
        isLocked = true
      } else {
        dispatch('unlock')
        isLocked = false
      }
    }
  
    function onPointerlockError() {
      console.error('PointerLockControls: Unable to use Pointer Lock API')
    }

    /** @param {KeyboardEvent} e */
    function onKeyDown(e) {
      switch (e.key) {
        case 's':
          moveState.backward = 1
          break
        case 'w':
          moveState.forward = 1
          break
        case 'a':
          moveState.left = 1
          break
        case 'd':
          moveState.right = 1
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
          moveState.backward = 0
          break
        case 'w':
          moveState.forward = 0
          break
        case 'a':
          moveState.left = 0
          break
        case 'd':
          moveState.right = 0
          break
        default:
          break
      }
    }

    function defaultMove () {
      const upOrDown = (+ (moveState.forward || moveState.backward ))
      
      // get direction
      const velocityVector = t.fromArray([
        moveState.right - moveState.left,
        fly ? upOrDown : 0,
        moveState.backward - moveState.forward
      ])

      velocityVector.applyEuler($camera.rotation).multiplyScalar(cameraSpeed)

      // don't override falling velocity
      if (!fly) {
        const linVel = rigidBody.linvel()
        t.y = linVel.y
      }

      // finally set the velocities and wake up the body
      rigidBody.setLinvel(t, true)
  
      // when body position changes update position prop for camera
      const pos = rigidBody.translation()
      position = {
        x: pos.x,
        y: pos.y,
        z: pos.z
      }

      // console.log(pos.y)
    }

    useFrame(() => {
      if (!rigidBody) return
      defaultMove()
    })

    $: grounded ? dispatch("groundenter") : dispatch("groundexit")
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

