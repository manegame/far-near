<script lang="ts">
	import {
		// AudioListener,
		DirectionalLight,
    OrbitControls,
    PerspectiveCamera,
    Pass,
    Fog,
    useThrelte
	} from '@threlte/core'
  import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
  import { onTop, epochs } from "$lib/store"

	import Terrain from './TerrainFile.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import Sky from './Sky.svelte'

  function onKeyDown (e) {
		 switch(e.keyCode) {
      case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
     }
  }

  const { scene, camera } = useThrelte()
</script>

<svelte:window on:keydown={onKeyDown} />

<DirectionalLight intensity={.5} scale={{ x: 20, y: 20, z: 20 }} shadow position={{ y: 20, x: 8, z: -5 }} />

<Terrain />

<Player position={{ y: 10 }} />

{#each Object.keys($epochs) as year (year)}
  <Epoch epoch={$epochs[year]} {year} />
{/each}

<Fog color="0xdddddd" />

<Pass
  pass={new BokehPass(scene, $camera, {
    focus: 3.0,
    aperture: 0.0015,
    maxblur: 0.005
  })}
/>

<!-- <Sky /> -->

<!-- <Debug /> -->

<!-- <Emitter /> -->