<script>
  import { Group } from "@threlte/core"
  import { Vector3 } from "three"
  import ImageCanvas from "./ImageCanvas.svelte"

  export let position = new Vector3(0, 0, -50)
  export let epoch
  export let radius = 200

  const images = epoch.map(i => ({
    uuid: i.slug,
    src: i.acf.preview_image?.url
  }))
    .filter(i => !!i.src)

  const getRandomPoint = (radius) => {
    let ang = Math.random() * 2 * Math.PI
    let hyp = Math.sqrt(Math.random()) * radius
    let adj = Math.cos(ang) * hyp
    let opp = Math.sin(ang) * hyp

    return new Vector3(
      position.x + adj,
      100,
      position.z + opp
    )
  }

  const randomPoints = images.map(() => getRandomPoint(radius))
</script>

<Group {position}>
  {#each images as { uuid, src }, i (uuid)}
    <ImageCanvas
      {uuid}
      position={randomPoints[i]}
      {src}
      {i}
    />
  {/each}
</Group>
