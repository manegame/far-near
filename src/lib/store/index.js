import { writable, derived } from "svelte/store"

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