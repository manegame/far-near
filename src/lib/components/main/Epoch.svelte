<script>
  import { Vector3 } from "three"
  import { placedEpochs } from "$lib/stores"
  import ImageCanvas from "./ImageCanvas.svelte"

  export let year
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
        1000,
        position.z + opp
      )
    }

    return makeRandom()
  }

  const images = epoch.map(i => {
    const point = getRandomPoint()
    return {
      uuid: i.slug,
      src: i.acf.preview_image?.url,
      acf: i.acf,
      pos: new Vector3(
        point.x + position.x,
        point.y,
        point.z + position.z
      )
    }
  })
    .filter(i => !!i.src)

  $placedEpochs[year] = images

</script>

{#each images as { uuid, src, pos }, i (uuid)}
  <ImageCanvas
    {uuid}
    position={pos}
    {src}
    {i}
  />
{/each}
