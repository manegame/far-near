import { writable } from 'svelte/store';

export const filmControlStatus = writable(false) // Stores the status of the film controls
export const expand = writable(false)
// -1 for backward, 1 for forward and 0 for static
export const playDirection = writable(0)
export const darkMenu = writable(false)
export const whiteMenu = writable(false)
export const sidenote = writable(null)
export const y = writable(0)