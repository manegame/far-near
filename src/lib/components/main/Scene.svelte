<script lang="ts">
	import {
		// AudioListener,
		DirectionalLight,
		Object3DInstance,
		OrbitControls,
		PerspectiveCamera
	} from '@threlte/core'
  import { epochs } from "$lib/store"

  import PointerLockControls from "../controls/PointerLockControls.svelte"
	import { Debug } from '@threlte/rapier'
	import { GridHelper } from 'three'
	import Emitter from './Emitter.svelte'
	import Terrain from './Terrain.svelte'
  import Epoch from './Epoch.svelte'
  import Player from './Player.svelte'

  $: console.log($epochs)
</script>

<DirectionalLight shadow position={{ y: 20, x: 8, z: -3 }} />

<Object3DInstance object={new GridHelper(50)} />

<Player position={{ z: 2 }} />

{#each Object.keys($epochs) as year (year)}
  <Epoch epoch={$epochs[year]} {year} />
{/each}

<Terrain />

<Debug />

<!-- <Emitter /> -->