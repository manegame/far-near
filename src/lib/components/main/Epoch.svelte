<script>
  import { Group } from "@threlte/core"
  import { Vector3 } from "three"
  import ImageCanvas from "./ImageCanvas.svelte"
  export let epoch
  export let radius = 100
  export let x = 0
  export let z = 0

  const images = epoch.map(i => i.acf.preview_image?.url).filter(i => !!i)

  const getRandomPoint = (radius, x, z) => {
    let ang = Math.random() * 2 * Math.PI
    let hyp = Math.sqrt(Math.random()) * radius
    let adj = Math.cos(ang) * hyp
    let opp = Math.sin(ang) * hyp

    return new Vector3(
      x + adj,
      100,
      z + opp
    )
  }

  const randomPoints = images.map(() => getRandomPoint(radius, x, z))
</script>

<Group
  position={new Vector3(x, 0, z)}
>
  {#each images as image, i (image)}
    <ImageCanvas
      position={randomPoints[i]}
      {image}
      {i}
    />
  {/each}
</Group>
