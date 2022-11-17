<script>
  import ImageCanvas from "./ImageCanvas.svelte"
  export let epoch
  export let year

  const images = epoch.map(i => i.acf.preview_image?.url).filter(i => !!i)
</script>

{#each images as image, i (image)}
  <ImageCanvas {image} {i} />
{/each}
