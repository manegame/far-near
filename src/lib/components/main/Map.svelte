<script>
  import panzoom from "panzoom"
  import { onMount } from "svelte"
  import "../../../assets/styles.css"

  export let data = {}

  let element

  let points = [
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 400, y: 300 },
    { x: 500, y: 500 },
    { x: 200, y: 100 }
  ]

  onMount(() => {
    panzoom(element)
  })
</script>

<div
  class="map"
>
  <div class="map-inner" bind:this={element}>
    
  </div>
</div>