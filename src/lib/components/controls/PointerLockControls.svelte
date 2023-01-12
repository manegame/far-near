<script>
    import { createEventDispatcher, onDestroy } from 'svelte'
    import { Euler, Camera, Vector3, MathUtils } from 'three'
    import { onTop } from "$lib/stores"
    import { useThrelte, useParent, useFrame } from '@threlte/core'
    import { cubicOut } from 'svelte/easing'
    import { tweened } from "svelte/motion"
  
    // Set to constrain the pitch of the camera
    // Range is 0 to Math.PI radians
    export let minPolarAngle = 0 // radians
    export let maxPolarAngle = Math.PI // radians
    export let pointerSpeed = 2.0
    export let jumpStrength = 4
    export let cameraSpeed = tweened(30, { easing: cubicOut })
    export let grounded = false
    export let position
    export let rigidBody
    export let fly = false
    export const lock = () => domElement.requestPointerLock()
    export const unlock = () => document.exitPointerLock()
  
    // T?
    const t = new Vector3()
    let isLocked = false
    let timeout
    let mouseTimeout
    let movementX, movementY
    let w, wRatio
    let h, hRatio
    
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
      clearTimeout(mouseTimeout)

      movementX = event.movementX
      movementY = event.movementY

      const FRACTION = 8
      const FIFTH_W = w / FRACTION
      const FIFTH_H = h / FRACTION

      if (event.clientX < FIFTH_W || event.clientX > (FRACTION - 1) * FIFTH_W) {
        wRatio = (event.clientX / w - 0.5)
      } else {
        wRatio = 0
      }
      if (event.clientY < FIFTH_H || event.clientY > (FRACTION - 1) * FIFTH_H) {
        hRatio = (event.clientY / h - 0.5)
      } else {
        hRatio = 0
      }

      mouseTimeout = setTimeout(() => {
        console.log('reseting')
        movementX = 0
        movementY = 0
      }, 100)
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
      clearTimeout(timeout)
      switch (e.key) {
        case 's':
        case 'ArrowDown':
          moveState.backward = 1
          break
        case 'w':
        case 'ArrowUp':     
          moveState.forward = 1
          break
        case 'a':
        case 'ArrowLeft':     
          moveState.left = 1
          break
        case 'd':
        case 'ArrowRight':     
          moveState.right = 1
          break
        case 'e':     
          moveState.up = 1
          break
        // case 'q':
        //   moveState.down = 1
        //   break
        case 'm':
          $onTop = $onTop === 'map' ? 'walk' : 'map'
          // lock()
          break
        case 'Shift':
          if (fly) {
            cameraSpeed.set(100)
            if (!rigidBody || !grounded) break
            rigidBody.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true)
          }
          if (!rigidBody || !grounded) break
          rigidBody.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true)
          break
        default:
          break
      }
    }
  
    /** @param {KeyboardEvent} e */
    function onKeyUp(e) {
      timeout = setTimeout(() => {
        moveState.backward = 0
        moveState.forward = 0
        moveState.up = 0
        moveState.down = 0
        moveState.left = 0
        moveState.right = 0
      }, 100)
      switch (e.key) {
        case 's':
        case 'ArrowDown':
          moveState.backward = 0
          break
        case 'w':
        case 'ArrowUp':
          moveState.forward = 0
          break
        case 'a':
        case 'ArrowLeft':
          moveState.left = 0
          break
        case 'd':
        case 'ArrowRight':
          moveState.right = 0
          break
        case 'e':
          moveState.up = 0
          break
        case 'q':
          moveState.down = 0
          break
        case 'm':
          // unlock()
        case 'Shift':
          if (fly) {
            cameraSpeed.set(30)
          }
          break
        default:
          break
        moveState.down = 0 
        moveState.left = 0 
        moveState.right = 0 
        moveState.forward = 0 
        moveState.backward = 0 
      }
    }

    /**
     * The thing that actually moves the player
     */
    function defaultMove () {
      // get direction
      const velocityVector = t.fromArray([
        moveState.right - moveState.left,
        moveState.up - moveState.down,
        moveState.backward - moveState.forward
      ])

      const adjustedRotation = new Euler()

      adjustedRotation.copy($camera.rotation)

      velocityVector
        .applyEuler(adjustedRotation)
    
      velocityVector
        .multiplyScalar($cameraSpeed)

      // don't override falling velocity
      if (!fly) {
        const linVel = rigidBody.linvel()
        t.y = linVel.y
      }

      // finally set the velocities and wake up the body
      rigidBody.setLinvel(t, true)
      const pos = rigidBody.translation()

      position = {
        x: pos.x,
        y: pos.y,
        z: pos.z
      }
    }

    useFrame(() => {
      if (!rigidBody) return

      if (!isNaN(wRatio) && !isNaN(hRatio)) {
        _euler.setFromQuaternion($camera.quaternion)

        if (hRatio || wRatio) {
          if (wRatio > 0.5) {
            _euler.y -= 0.002 * pointerSpeed * wRatio * 4
          } else {
            _euler.y -= 0.002 * pointerSpeed * wRatio * 4
          }
        
          if (hRatio > 0.5) {
            _euler.x -= 0.002 * pointerSpeed * hRatio * 4
          } else {
            _euler.x -= 0.002 * pointerSpeed * hRatio * 4
          }
        }
      }

      // Y and X movement based on the mouse
      if (movementX) {
        _euler.y -= movementX * 0.002 * pointerSpeed
      }
      if (movementY) {
        _euler.x -= movementY * 0.002 * pointerSpeed
      }

      // Restrictions on the axes
      _euler.x = Math.max(_PI_2 - maxPolarAngle, Math.min(_PI_2 - minPolarAngle, _euler.x))
      _euler.x = Math.min(0.8, _euler.x)
      _euler.x = Math.max(-0.8, _euler.x)

      $camera.quaternion.setFromEuler(_euler)

      onChange()

      defaultMove()
    })

    $: grounded ? dispatch("groundenter") : dispatch("groundexit")
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} on:keydown|preventDefault={onKeyDown} on:keyup={onKeyUp} />

