<script lang="ts">
	import {
		// AudioListener,
		DirectionalLight,
		Object3DInstance,
		OrbitControls,
		PerspectiveCamera
	} from '@threlte/core'
  import PointerLockControls from "../controls/PointerLockControls.svelte"
	import { Debug } from '@threlte/rapier'
	import { GridHelper } from 'three'
	import Emitter from './Emitter.svelte'
	import Terrain from './Terrain.svelte'
  import Player from './Player.svelte'
</script>

<!-- <PerspectiveCamera position={{ y: 10, z: 10, x: 10 }}> -->
	<!-- <OrbitControls enableZoom={true} /> -->
	<!-- <AudioListener /> -->
<!-- </PerspectiveCamera> -->

<DirectionalLight shadow position={{ y: 20, x: 8, z: -3 }} />

<Object3DInstance object={new GridHelper(50)} />

<Player position={{ z: 2 }} />

<Terrain />

<Debug />

<Emitter />