<script>
  import ImageCanvas from "./ImageCanvas.svelte"
  export let epoch
  export let year

  const images = epoch.map(i => i.acf.preview_image?.url).filter(i => !!i)
</script>

<div style="position: fixed; background: ##fff; z-index: 99">
  {#each images as image (image)}
    <!-- <img src={image} alt="alt" /> -->
    <ImageCanvas {image} />
  {/each}
</div>  
