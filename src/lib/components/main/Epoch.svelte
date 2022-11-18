<script>
  import { Group } from "@threlte/core"
  import ImageCanvas from "./ImageCanvas.svelte"
  export let epoch
  export let year

  // const randomX = 0
  // const randomZ = 0
  const randomX = 5 + Math.floor(Math.random() * 10)
  const randomZ = 5 + Math.floor(Math.random() * 10)

  const images = epoch.map(i => i.acf.preview_image?.url).filter(i => !!i)
</script>


<Group position={{ x: randomX, z: randomZ, y: 4 }}>
  {#each images as image, i (image)}
    <ImageCanvas {image} {i} />
  {/each}
</Group>
