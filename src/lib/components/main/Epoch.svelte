<script>
  import { Group } from "@threlte/core"
  import { Vector3 } from "three"
  import ImageCanvas from "./ImageCanvas.svelte"

  export let position = new Vector3(0, 0, -50)
  export let epoch
  export let radius

  const getRandomPoint = () => {
    function makeRandom () {
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

    return makeRandom()
  }

  const images = epoch.map(i => ({
    uuid: i.slug,
    src: i.acf.preview_image?.url,
    pos: getRandomPoint()
  }))
    .filter(i => !!i.src)

</script>

<Group {position}>
  {#each images as { uuid, src, pos }, i (uuid)}
    <ImageCanvas
      {uuid}
      position={pos}
      {src}
      {i}
    />
  {/each}
</Group>
