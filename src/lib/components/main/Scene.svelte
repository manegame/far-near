<script lang="ts">
	import {
		DirectionalLight,
    AmbientLight,
    Fog,
    useThrelte
	} from '@threlte/core'
  import { Vector3, Color } from "three"
  import { onTop, epochs, lighting, terrainReady } from "$lib/stores"
	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import HitIndicator from './HitIndicator.svelte'
  import Sky from './Sky.svelte'
  
  let position = new Vector3(0, 5, 0)

  let positions = [
    new Vector3(-50, 100, -50),
    new Vector3(-125, 100, 0),
    new Vector3(-250, 100, 0),
    new Vector3(-500, 100, 50),
    new Vector3(-700, 100, 150)
  ]
  let combinedColor
  
  const { camera } = useThrelte()

  $: combinedColor = new Color($lighting.color.r, $lighting.color.g, $lighting.color.b)

  function onKeyDown (e) {
		 switch(e.keyCode) {
      case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
     }
  }

  const color = 0xccbbbb
</script>

<svelte:window on:keydown={onKeyDown} />

<AmbientLight intensity={$lighting.ambient} color={combinedColor} />

{#if $camera}
  <Player
    bind:position={position}
  />

  <DirectionalLight
    intensity={$lighting.ambient}
    color={combinedColor}
    shadow
    position={{ y: 50, x: position.x, z: position.z }}
    target={{ x: position.x, z: position.z - 50 }}
  />
{/if}

{#if $terrainReady}
  {#each Object.keys($epochs) as year, i (year)}
    <Epoch
      {year}
      position={positions[i]}
      epoch={$epochs[year]}
      radius={80}
    />
  {/each}
{/if}

<Terrain
  color={combinedColor}
  on:ready={(e) => { $terrainReady = true }}
/>

<Fog near={50} far={500} color={combinedColor} />
<Sky color={combinedColor} />

{#if import.meta.env.DEV}
  <HitIndicator />
{/if}

<!-- <Debug /> -->

<!-- <Emitter /> -->