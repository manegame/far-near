<script lang="ts">
	import {
		DirectionalLight,
    OrbitControls,
    AmbientLight,
    PerspectiveCamera,
    Pass,
    Fog,
    useThrelte
	} from '@threlte/core'
  import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
  import { onTop, epochs } from "$lib/store"

	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import DirectionalLightHelper from '$lib/components/lighting/DirectionalLightHelper.svelte'
  import Sky from './Sky.svelte'

  let terrainReady = false

  function onKeyDown (e) {
		 switch(e.keyCode) {
      case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
     }
  }

  const color = 0x20342f
</script>

<svelte:window on:keydown={onKeyDown} />


<DirectionalLight
  intensity={10}
  color={0xff0000}
  shadow
  visible
  position={{ y: 100 }}
  target={{ x: 100, z: 100 }}>
  {#if import.meta.env.DEV}
    <DirectionalLightHelper />
  {/if}
</DirectionalLight>

<!-- <AmbientLight intensity={0.2} /> -->

<Player position={{ y: 5 }} />

{#if terrainReady}
  {#each Object.keys($epochs) as year (year)}
    <Epoch
      epoch={$epochs[year]}
      x={0}
      z={0}
    />
  {/each}
{/if}

<Terrain
  on:ready={(e) => { terrainReady = true }}
/>

<Fog {color} />
<Sky {color} />

<!-- <Pass
  pass={new BokehPass(scene, $camera, {
    focus: 3.0,
    aperture: 0.0015,
    maxblur: 0.005
  })}
/> -->


<!-- <Debug /> -->

<!-- <Emitter /> -->