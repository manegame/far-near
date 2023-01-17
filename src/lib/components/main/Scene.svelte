<script lang="ts">
	import {
		DirectionalLight,
    AmbientLight,
    Fog,
    useThrelte
	} from '@threlte/core'
  import { Vector3, Color } from "three"
  import { onTop, epochs, lighting, terrainReady, waterReady } from "$lib/stores"
  import { currentHit } from "$lib/functionality/raycaster"
	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
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

  function onKeyDown (e) {
		 switch(e.keyCode) {
       case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
       case(27):
        if ($onTop === 'walk') {
          $onTop = 'map'
        }
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
    position={{ y: 50, x: position.x, z: position.z }}
    target={{ x: position.x, z: position.z - 50 }}
  />
{/if}

{#if $terrainReady && $waterReady}
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

<Fog near={50} far={400} color={combinedColor} />
<Sky color={combinedColor} />

{#if import.meta.env.DEV}
  <!-- <HitIndicator /> -->
{/if}

<!-- <Debug /> -->

<!-- <Emitter /> -->