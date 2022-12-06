<script>
  import panzoom from "panzoom"
  import { onMount } from "svelte"
  import { onTop, placedEpochs, playerPosition } from "$lib/stores"
  import { range } from "$lib/functionality/maths"

  export let data = {}

  let element
  let w, h

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
    width: ${w}px;
    height: ${h}px;
  `

  const imageStyle = `
    width: 10px;
    height: 10px;
    object-fit: contain;
    position: absolute;
  `

  const innerMapStyle = `
    position: absolute;
    background-color: red;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `

  let playerStyle = ``

  $: playerStyle = `
    position: absolute;
    top: 0;
    left: 0;
    transform: ${translate($playerPosition)};
    width: 10px;
    height: 10px;
    background-color: blue;
  `

  function translate (pos) {
    const unit = 900
    const min = 0
    const max = Math.max(w, h)

    return `translate(${range(-unit, unit, min, max, pos.x)}px, ${range(-unit, unit, min, max, pos.z)}px)`
  }
</script>

<svelte:window bind:innerHeight={h} bind:innerWidth={w} />

<div
  style={mapStyle}
  style:z-index={$onTop === 'map' ? 1 : -1}
>
  <div style:position="relative" style:width="100%" style:height="100%" style:overflow="hidden">
    <div
      style={innerMapStyle}
      bind:this={element}
    >
      {#each Object.entries($placedEpochs) as [year, epoch] (year)}
        <!-- {year} -->
        {#each epoch as { uuid, src, pos }, i (uuid)}
          <img
            style="{imageStyle}"
            style:transform={translate(pos)}
            {src}
            alt=""
          >
        {/each}
      {/each}

      <div style={playerStyle} />
    </div>
  </div>
</div>