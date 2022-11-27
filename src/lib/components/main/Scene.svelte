<script lang="ts">
	import {
		DirectionalLight,
    AmbientLight,
    Fog,
    useThrelte,
    Three
	} from '@threlte/core'
  import { Debug } from "@threlte/rapier"
  import { Vector3, Color } from "three"
  import { onTop, epochs, lighting } from "$lib/stores"
	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import HitIndicator from './HitIndicator.svelte'
  import DirectionalLightHelper from '$lib/components/lighting/DirectionalLightHelper.svelte'
import Sky from './Sky.svelte'

  import { terrainReady } from "$lib/stores"
  
  let position = new Vector3(0, 5, 0)
  let combinedColor
  let light
  
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
      position={new Vector3(i * 30 + 20, 5, -50 - 80 * i )}
      epoch={$epochs[year]}
      radius={400}
    />
  {/each}
{/if}

<Terrain
  color={combinedColor}
  on:ready={(e) => { $terrainReady = true }}
/>

<Fog color={combinedColor} />
<Sky color={combinedColor} />

<HitIndicator />

<!-- {#if position.y < -5}
  <Pass
    pass={new BokehPass(scene, $camera, {
      focus: 3.0,
      aperture: 0.0015,
      maxblur: 0.005
    })}
  />
{/if} -->


<!-- <Debug /> -->

<!-- <Emitter /> -->