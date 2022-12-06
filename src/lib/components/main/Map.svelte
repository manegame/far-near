<script>
  import panzoom from "panzoom"
  import { onMount } from "svelte"
  import { onTop, placedEpochs } from "$lib/stores"

  export let data = {}

  let element

  onMount(() => {
    panzoom(element)
  })

  const mapStyle = `
    background-color: black;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  `

  const epochStyle = `
    width: 400px;
    height: 400px;
    object-fit: contain;
  `

  const innerMapStyle = `
    position: absolute;
    top: 0;
    left: 0;
  `
</script>

<div
  style={mapStyle}
  style:z-index={$onTop === 'map' ? 1 : -1}
>
  <div
    style={innerMapStyle}
    bind:this={element}
  >
  {#each Object.entries($placedEpochs) as [year, epoch] (year)}
    {year}
    {#each epoch as { uuid, src, pos }, i (uuid)}
      <img style={epochStyle} {src} alt="">
    {/each}
  {/each}

  </div>
</div>