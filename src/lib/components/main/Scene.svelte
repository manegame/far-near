<script lang="ts">
	import {
		// AudioListener,
		DirectionalLight,
    OrbitControls,
    PerspectiveCamera,
    Fog
	} from '@threlte/core'
  import { epochs } from "$lib/store"
	import { Debug } from '@threlte/rapier'
	import { GridHelper } from 'three'
	import Emitter from './Emitter.svelte'
	import Terrain from './TerrainFile.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'
  import {  } from 'three/examples/jsm/controls/OrbitControls'
</script>

<DirectionalLight shadow position={{ y: 20, x: 8, z: -3 }} />

<!-- <PerspectiveCamera position={{ x: 10, y: 10, z: 10 }}>
  <OrbitControls />
</PerspectiveCamera> -->

<Terrain />


<Player position={{ z: 2 }} />

{#each Object.keys($epochs) as year (year)}
  <Epoch epoch={$epochs[year]} {year} />
{/each}

<Fog color="0xdddddd" />

<Terrain />

<!-- <Debug /> -->

<Emitter />