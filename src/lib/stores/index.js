import { Vector3 } from "three"
import { writable, derived, get } from "svelte/store"
import { spring } from "svelte/motion"
import { Color } from "three"

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
  
  console.log('derived too')
  
  return eps
})

export const activeCanvas = writable('')

export const lighting = spring({
  ambient: 1,
  color: { r: 1, g: 1, b: 1 }
}, {
  stiffness: 0.03,
  damping: 0.95
})

export const hitPosition = writable(new Vector3())
export const hitLookAt = writable(new Vector3())