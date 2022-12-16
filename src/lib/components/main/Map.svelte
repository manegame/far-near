<script>
  import panzoom from "panzoom"
  import { Vector3 } from "three"
  import { onMount } from "svelte"
  import { onTop, placedEpochs, playerPosition } from "$lib/stores"
  import { range } from "$lib/functionality/maths"

  export const DEB = false

  let oldPosition = new Vector3()

  const UNIT = 1200
  const min = 0
  let element
  let instance
  let activeUuid = ''
  let w, h
  let playerStyle = ``
  let mapStyle = ``
  let worldStyle = ``
  let imageContainerStyle = ``
  let imageStyle = ``
  let innerMapStyle = ``
  let captionStyles = ``

  onMount(() => {
    eppies = Object.entries($placedEpochs).map(([year, epoch]) => {
      return [year, epoch.map((entry) => {
        if (entry.uuid === activeUuid) {
          return {...entry, active: true }
        }
        return { ...entry, active: false }
      })]
    })
    const max = getMax()
    instance = panzoom(element, {
      initialZoom: 2,
      transformOrigin: {x: 0.5, y: 0.5}
    })
    instance.moveTo(-translateComponent($playerPosition.x), -translateComponent($playerPosition.z))
  })

  $: mapStyle = `
  font-family: "Neue Haas Unica";
  font-weight: bold;
  background: rgb(36,36,36);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: ${w}px;
  background: linear-gradient(0deg, rgba(36,36,36,1) 0%, rgba(91,91,91,1) 100%), url(/textures/sky/heightmap.png); 
  height: ${h}px;
  `
  
  // background-color: red;
  $: worldStyle = `
  width: ${Math.max(w, h)}px;
    height: ${Math.max(w, h)}px;
    opacity: 0.2;
    position: absolute;
    z-index: -1;
  `

  $: imageContainerStyle = `
    top: 0;
    left: 0;
    width: 10px;
    position: absolute;
    transition: all 0.3s ease;
  `

  $: imageStyle = `
    object-fit: contain;
    object-position: center bottom;
    width: 100%;
    transition: all 0.3s ease;
  `

  $: innerMapStyle = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `
  $: captionStyles = `
    font-size: 0.8px;
    line-height: 1.5;
    text-align: center;
  `

  if (import.meta.env.DEV && DEB) {
    innerMapStyle += 'background-color: red;'
  }

  $: playerStyle = `
    position: absolute;
    top: 0;
    left: 0;
    transform: ${translate($playerPosition)};
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 100%;
  `

  function getMax () {
    return Math.max(w, h)
  }

  function translateComponent (position) {
    const max = getMax()
    return range(-UNIT, UNIT, min, max, position)
  }

  function translate (pos) {
    return `translate(${translateComponent(pos.x)}px, ${translateComponent(pos.z)}px)`
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

  $: {
    eppies = Object.entries($placedEpochs).map(([year, epoch]) => {
      return [year, epoch.map((entry) => {
        if (entry.uuid === activeUuid) {
          return {...entry, active: true }
        }
        return { ...entry, active: false }
      })]
    })
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
      <div style={worldStyle} />
    </div>
  </div>
</div>