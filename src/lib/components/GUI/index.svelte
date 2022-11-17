<script>
  import Navigation from "./navigation.svelte"
  import Toggle from "./toggle.svelte"
  import { onTop } from "$lib/store"
</script>

<div
  class="container"
  style:position="fixed"
  style:z-index="10"
  style:font-family="sans-serif"
  style:width="100vw"
  style:height="100vh"
>
  <Navigation />
  <div style:display="flex" style:justify-content="flex-end">
    <Toggle />
  </div>
</div>