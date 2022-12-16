<script>
  import panzoom from "panzoom"
  import { onMount } from "svelte"
  import { onTop, placedEpochs, playerPosition } from "$lib/stores"
  import { range } from "$lib/functionality/maths"

  export let data = {}

  export const DEB = false

  let element
  let instance
  let activeUuid = ''
  let w, h

  onMount(() => {
    instance = panzoom(element, { initialZoom: 2 })
    instance.moveTo(-w / 2, -h / 2)
  })

  const mapStyle = `
    font-family: "Neue Haas Unica";
    font-weight: bold;
    background: rgb(36,36,36);
    background: linear-gradient(0deg, rgba(36,36,36,1) 0%, rgba(91,91,91,1) 100%); 
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: ${w}px;
    height: ${h}px;
  `

  const imageContainerStyle = `
    width: 30px;
    position: absolute;
    transition: all 0.3s ease;
  `

  const imageStyle = `
    object-fit: contain;
    object-position: center bottom;
    width: 100%;
    transition: all 0.3s ease;
  `

  let innerMapStyle = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `
  let captionStyles = `
    font-size: 1.8px;
    line-height: 1.5;
    text-align: center;
  `

  if (import.meta.env.DEV && DEB) {
    innerMapStyle += 'background-color: red;'
  }

  let playerStyle = ``

  $: playerStyle = `
    position: absolute;
    top: 0;
    left: 0;
    transform: ${translate($playerPosition)};
    width: 5px;
    height: 5px;
    background-color: blue;
    border-radius: 100%;
  `

  function translate (pos) {
    const unit = 1200
    const min = 0
    const max = Math.min(w, h)

    return `translate(${range(-unit, unit, min, max, pos.x)}px, ${range(-unit, unit, min, max, pos.z)}px)`
  }

  function scale (uuid) {
    if (uuid === activeUuid) {
      return 'scale(1.2'
    }

    return 'scale(1)'
  }

  function highlight (uuid) {
    if (uuid) {
      activeUuid = uuid
    } else {
      activeUuid = ''
    }
  }

  let eppies = Object.entries($placedEpochs)

  $: eppies = Object.entries($placedEpochs).map(([year, epoch]) => {
    return [year, epoch.map((entry) => {
      if (entry.uuid === activeUuid) {
        return {...entry, active: true }
      }
      return { ...entry, active: false }
    })]
  })
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
      {#each eppies as [year, epoch] (year)}
        <!-- {year} -->
        {#each epoch as { uuid, src, pos, active, title }, i (uuid)}
          <figure
            style="{imageContainerStyle};"
            style:transform="{translate(pos)} {active ? 'scale(2)' : 'scale(1)'}"
            style:z-index={+active}
            on:mouseenter={() => highlight(uuid) }
            on:mouseleave={() => highlight('') }
          >
            <div class="position: relative">
              <img
                style={imageStyle}
                {src}
                alt=""
              >
              <figcaption
                style={captionStyles}
                style:width="100%"
                style:opacity={+active}
                >
                {@html title}
              </figcaption>
            </div>
          </figure>
        {/each}
      {/each}

      <div style={playerStyle} />
    </div>
  </div>
</div>