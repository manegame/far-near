import * as THREE from 'three'
import { clamp } from "../../../lib/functionality/maths/index.js"

 export class InputController {
  constructor (domElement) {
    this.domElement = domElement 
    this.initialize()
  }

  initialize () {
    this.current = {
      leftButton: false,
      rightButton: false,
      mouseXDelta: 0,
      mouseYDelta: 0,
      mouseX: 0,
      mouseY: 0
    }
    this.previous = null
    this.keys = {}
    this.previousKeys = {}

    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false)
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false)
  }

  onMouseMove ({ clientX, clientY }) {
    this.current.mouseX = clientX - this.domElement.clientWidth / 2
    this.current.mouseY = clientY - this.domElement.clientHeight / 2

    if (this.previous === null) {
      this.previous = {...this.current}
    }
    this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
    this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY
  }



  onMouseDown ({ button }) {
    switch (button) {
      case 0:
        this.current.leftButton = true
        break
      case 2:
        this.current.rightButton = true
        break
    }
  }

  onMouseUp ({ button }) {
    switch (button) {
      case 0:
        this.current.leftButton = true
        break
      case 2:
        this.current.rightButton = true
        break
    }
  }

    // Add deltas 
  key = (code) => this.keys[code] === true
  
  onKeyDown ({ code }) {
    this.keys[code] = true
  }

  onKeyUp ({ code }) {
    this.keys[code] = false
  }

  update () {
    if (this.previous !== null) {
      this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
      this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY
      this.previous = { ...this.current }
    }
  }
}

export class FirstPersonControls {
  constructor (camera, domElement, objects = []) {
    this.camera = camera
    this.domElement = domElement
    this.input = new InputController(this.domElement)
    this.rotation = new THREE.Quaternion()
    this.translation = new THREE.Vector3()
    this.phi = 0 // quaternion
    this.phiSpeed = 8 // unused for now
    this.theta = 0 // vector
    this.thetaSpeed = 5
    this.headbobActive = false
    this.headbobTimer = 0

    this.objects = objects
    this.lookSpeed = 5
  }

  update (delta) {
    this.updateRotation(delta)
    this.updateCamera()
    this.updateTranslation(delta)
    this.updateHeadbob(delta)
    this.input.update()
  }

  updateCamera () {
    this.camera.quaternion.copy(this.rotation)
    this.camera.position.copy(this.translation)
    this.camera.position.y += Math.sin(this.headbobTimer * 12) * 0.2

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.rotation);

    const dir = forward.clone();

    forward.multiplyScalar(100);
    forward.add(this.translation);

    let closest = forward;
    const result = new THREE.Vector3();
    const ray = new THREE.Ray(this.translation, dir);
    for (let i = 0; i < this.objects.length; ++i) {
      if (ray.intersectBox(this.objects[i] || ray.intersectSphere(this.objects[i]), result)) {
        console.log('intersecting!!!!!')
        if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
          closest = result.clone();
        }
      }
    }

    this.camera.lookAt(closest);
  }

  updateHeadbob (delta) {
    if (this.headbobActive) {
      const wavelength = Math.PI
      const nextStep = 1 + Math.floor(((this.headbobTimer + 0.000001) * 10) / wavelength)
      const nextStepTime = nextStep * wavelength / 10
      this.headbobTimer = Math.min(this.headbobTimer + delta, nextStepTime)

      if (this.headbobTimer == nextStepTime) {
        this.headbobActive = false
      }
    }
  }

  updateTranslation (delta) {
    const forwardVelocity = (this.input.key('KeyW') ? 1 : 0)  + (this.input.key('KeyS') ? -1 : 0)
    const strafeVelocity =  (this.input.key('KeyA') ? 1 : 0)  + (this.input.key('KeyD') ? -1 : 0)

    const qx = new THREE.Quaternion()
    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)

    console.log(forwardVelocity, strafeVelocity)

    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(qx)
    forward.multiplyScalar(forwardVelocity * delta * 10)

    const left = new THREE.Vector3(-1, 0, 0)
    left.applyQuaternion(qx)
    left.multiplyScalar(strafeVelocity * delta * 10)

    this.translation.add(forward)
    this.translation.add(left)

    if (forwardVelocity != 0 || strafeVelocity != 0)  {
      this.headbobActive = true
    }
  }

  updateRotation (delta) {
    const xh = this.input.current.mouseXDelta / this.domElement.clientWidth
    const yh = this.input.current.mouseYDelta / this.domElement.clientHeight
    
    if (!isNaN(xh) && !isNaN(yh)) {
      // // Convert our deltas to spherical coordinates
      this.phi += -xh * this.lookSpeed
      this.theta = clamp(this.theta + -yh * this.lookSpeed, -Math.PI / 6, Math.PI / 6)
  
      // // Now to a rotation
      const qx = new THREE.Quaternion()
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)
      const qz = new THREE.Quaternion()
      qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta)
  
      const q = new THREE.Quaternion()
      q.multiply(qx)
      q.multiply(qz)
  
      this.rotation.copy(q)    
    }
  }

  handleResize () {
    this.camera.updateProjectionMatrix()
  }  


}