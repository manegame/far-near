import { writable, derived } from "svelte/store"
import { spring } from "svelte/motion"

export const data = writable([])
export const onTop = writable('map')

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

export const activeCanvas = writable('')

export const lighting = spring({
  ambient: 0.9,
  color: { r: 0.9, g: 0.9, b: 0.9 }
}, {
  stiffness: 0.03,
  damping: 0.95
})

export let waterReady = writable(false)
export let terrainReady = writable(false)