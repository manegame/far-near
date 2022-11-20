<script lang="ts">
	import { HTML } from '@threlte/extras'
  import { Vector3 } from 'three'
	import { World } from '@threlte/rapier'
	import Scene from './Scene.svelte'
</script>

<World gravity={new Vector3(0, 0, 0)}>
  <Scene />

  <HTML slot="fallback" transform>
    <p class="text-xs">
      It seems your browser<br />
      doesn't support WASM.<br />
      I'm sorry.
    </p>
  </HTML>
</World>