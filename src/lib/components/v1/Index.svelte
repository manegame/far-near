<script lang="ts">
	import { HTML } from '@threlte/extras'
	import { World } from '@threlte/rapier'
	import Scene from './PhysicsScene.svelte'
</script>


<World>
  <Scene />

  <HTML slot="fallback" transform>
    <p class="text-xs">
      It seems your browser<br />
      doesn't support WASM.<br />
      I'm sorry.
    </p>
  </HTML>
</World>