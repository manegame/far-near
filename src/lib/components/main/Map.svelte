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
  background: black;
  // background: linear-gradient(0deg, rgba(36,36,36,1) 0%, rgba(91,91,91,1) 100%), url(/textures/sky/heightmap.png); 
  height: ${h}px;
  `
  
  // background-color: red;
  $: worldStyle = `
  width: ${Math.max(w, h)}px;fl
    height: ${Math.max(w, h)}px;
    opacity: 0.2;
    position: absolute;
    z-index: -1;
  `

  $: imageContainerStyle = `
    top: 0;
    left: 0;
    width: 20px;
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
            <div class="fn-relative">
              <img
                style={imageStyle}
                {src}
                alt=""
              >
            </div>
          </figure>
        {/each}
      {/each}

      <div class="fn-absolute fn-top-0 fn-left-0 fn-w-3 fn-h-3 fn-rounded-full" style:transform={translate($playerPosition)}>
        <svg class="fn-w-full fn-h-full" width="58" height="57" viewBox="0 0 58 57" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24.26 0.119997C23.96 10.38 25.1 37.32 0.68 50.46C3.02 52.08 5.36 54.36 6.68 56.28C31.76 41.52 32.12 12.54 32.48 0.119997H24.26ZM31.82 7.44L24.86 8.22C25.76 14.22 27.74 44.22 52.34 55.92C53.42 53.88 55.46 51.42 57.62 49.74C34.22 39.3 32.3 12.3 31.82 7.44Z" fill="white"/>
        </svg>          
      </div>
      <div style={worldStyle} />
    </div>
  </div>
</div>