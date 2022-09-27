<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Physics from './physics/Index.svelte'

  let width   = window.innerWidth
  let height  = window.innerHeight
</script>

<Canvas size={{ width, height  }}>
  <Physics />
</Canvas>