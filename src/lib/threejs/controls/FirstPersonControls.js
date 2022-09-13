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
      mouseX: 0,
      mouseY: 0
    }
    this.previous = null
    this.keys = {}
    this.previousKeys = {}

    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
    this.domElement.addEventListener('keydown', (e) => this.onKeyDown(e), false)
    this.domElement.addEventListener('keyup', (e) => this.onKeyUp(e), false)
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

  onMouseMove ({ pageX, pageY }) {
    this.current.mouseX = pageX - this.domElement.clientWidth / 2
    this.current.mouseY = pageY - this.domElement.clientHeight / 2

    if (this.previous === null) {
      this.previous = {...this.current}
    }

    // Add deltas 
    this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
    this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY
  }
  
  onKeyDown ({ keyCode }) {
    this.keys[keyCode] = true
  }

  onKeyUp ({ keyCode }) {
    this.keys[keyCode] = false
  }

  update () {
    this.previous = { ...this.current }
  }
}

export class FirstPersonControls {
  constructor (camera, domElement) {
    this.camera = camera
    this.domElement = domElement
    this.input = new InputController(this.domElement)
    this.rotation = new THREE.Quaternion()
    this.translation = new THREE.Vector3()
    this.phi = 0 // quaternion
    this.theta = 0 // vector

    this.lookSpeed = 0.05
  }

  update (delta) {
    console.log(this.domElement)
    this.updateRotation(delta)
    this.updateCamera(delta)
  }

  updateCamera (delta) {
    console.log('update the camera')
    this.camera.quaternion.copy(this.rotation)
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
  
      console.log(this.rotation)
    }
  }

}