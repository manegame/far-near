/**
 * Custom writable that persists the values to localstorage
 * @param {*} key 
 * @returns 
 */
export const persisted = (initial = null, key) => {
  function initialValue (key) {
    const value = JSON.parse(window.localStorage.getItem(key))
    if (!!value) {
      return value
    } else {
      return  null
    }
  }

  let value = initialValue(key)
	let subs = []

  const subscribe = (handler) => {
    subs = [...subs, handler]                                 // add handler to the array of subscribers
    handler(value)                                            // call handler with current value
    return () => subs = subs.filter(sub => sub !== handler)   // return unsubscribe function
  }

  const set = (new_value) => {
    if (value === new_value) return         // same value, exit

    value = new_value                       // update value

    window.localStorage.setItem(key, JSON.stringify(value)) // persist value
    subs.forEach(sub => sub(value))         // update subscribers
  }

  const update = (update_fn) => set(update_fn(value))   // update function

  return { subscribe, set, update }       // store contract
}
