import { writable, derived } from "svelte/store"
import { spring } from "svelte/motion"
import { Vector3 } from "three"
import { persisted } from "./persisted"

/**
 * Source of truth
 */
export const data = writable([])

/**
 * Which we are seeing
 */
export const onTop = writable('map')

/**
 * Derived from data
 */
export const epochs = derived(data, ($data) => {
  // Split the data per year
  let years = $data.map(d => new Date(d.date).getFullYear())
  years = [...new Set([...years])]
  
  const eps = {}
  
  years.forEach(y => {
    eps[y] = $data.filter(item => new Date(item.date).getFullYear() === y)
  })
  
  return eps
})

/**
 * Set by the Epoch component
 */
export const placedEpochs = writable({})

export const activeCanvas = writable('')

export const lighting = spring({
  ambient: 0.9,
  color: { r: 0.9, g: 0.9, b: 0.9 }
}, {
  stiffness: 0.03,
  damping: 0.95
})

export function lightsOff () {
  lighting.set({
    ambient: 0.6,
    color: { r: 0.3, g: 0.3, b: 0.3 }
})
}

export function lightsOn () {
  lighting.set({
    ambient: 0.9,
    color: { r: 0.9, g: 0.9, b: 0.9 }
  })
}

export let waterReady = writable(false)
export let terrainReady = writable(false)
export let playerPosition = writable(new Vector3())