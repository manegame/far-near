import { Vector3 } from "three"
import { writable } from "svelte/store"

import {
  DirectionalLight,
  DirectionalLightHelper,
} from 'three'

export const getChildren = (scene) => scene.children.filter(c => {
  return !(c instanceof DirectionalLight) && !(c instanceof DirectionalLightHelper) && !c.userData.raycasterIgnore
})

export const closestObject = (intersects) => {
  const distances = intersects.map(i => i.distance)

  return intersects[distances.indexOf(Math.min(...distances))] // closest hit
}

export const currentHit = writable(null)
export const hitPosition = writable(new Vector3())
export const hitLookAt = writable(new Vector3())