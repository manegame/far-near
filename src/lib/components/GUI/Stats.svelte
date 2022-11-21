<script>
  import Stats from 'three/examples/jsm/libs/stats.module.js'
  import { useFrame } from "@threlte/core"
  import { onMount } from "svelte"
  
  const stats = new Stats()

  const init = () => {
    document.body.appendChild(stats.dom)
  }

  useFrame(() => {
    stats.update()
  })

  onMount(init)
</script>