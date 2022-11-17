<script lang="ts">
	import {
		// AudioListener,
		DirectionalLight,
    OrbitControls,
    PerspectiveCamera,
    Fog
	} from '@threlte/core'
  import { onTop, epochs } from "$lib/store"
	import { Debug } from '@threlte/rapier'
	import { GridHelper } from 'three'
	import Emitter from './Emitter.svelte'
	import Terrain from './TerrainFile.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'

  function onKeyDown (e) {
		 switch(e.keyCode) {
      case(81):
        $onTop = $onTop === 'map' ? 'walk' : 'map'
        break
     }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<DirectionalLight intensity={.5} scale={{ x: 20, y: 20, z: 20 }} shadow position={{ y: 20, x: 8, z: -5 }} />

<!-- <PerspectiveCamera position={{ x: 10, y: 10, z: 10 }}>
  <OrbitControls />
</PerspectiveCamera> -->

<Terrain />

<Player position={{ y: 10 }} />

{#each Object.keys($epochs) as year (year)}
  <Epoch epoch={$epochs[year]} {year} />
{/each}

<Fog color="0xdddddd" />

<Terrain />

<!-- <Debug /> -->

<!-- <Emitter /> -->