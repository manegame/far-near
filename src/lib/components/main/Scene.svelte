<script lang="ts">
	import {
		DirectionalLight,
    AmbientLight,
    HemisphereLight,
    Fog,
    useThrelte
	} from '@threlte/core'
  import { Vector3 } from "three"
  import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
  import { onTop, epochs } from "$lib/store"

	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import DirectionalLightHelper from '$lib/components/lighting/DirectionalLightHelper.svelte'
  import Sky from './Sky.svelte'
  
  let terrainReady = false
  let position = new Vector3(0, 5, 0)

  const { camera } = useThrelte()

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


<AmbientLight intensity={1} color={0xffd1d1} />

{#if $camera}
  <Player
    bind:position={position}
  />

  <DirectionalLight
    intensity={1}
    color={0xffffff}
    shadow
    position={{ y: 50, x: position.x, z: position.z }}
    target={{ x: position.x, z: position.z - 50 }}
  >
    {#if import.meta.env.DEV}
      <DirectionalLightHelper />
    {/if}
  </DirectionalLight>
{/if}

{#if terrainReady}
  {#each Object.keys($epochs) as year, i (year)}
    <Epoch
      position={new Vector3(0, 0, -50 - 50 * i )}
      epoch={$epochs[year]}
      radius={40}
    />
  {/each}
{/if}

<Terrain
  {color}
  on:ready={(e) => { terrainReady = true }}
/>

<Fog {color} />
<Sky {color} />

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