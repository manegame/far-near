<script>
  import { Vector3, BoxGeometry, MeshBasicMaterial } from "three"
  import { InstancedMesh, Instance } from '@threlte/core'
  import { placedEpochs } from "$lib/stores"
  import ImageCanvas from "./ImageCanvas.svelte"
  import { createEventDispatcher } from "svelte"

  export let year
  export let position = new Vector3(0, 0, -50)
  export let epoch
  export let radius

  const dispatch = createEventDispatcher()

  const getRandomPoint = () => {
    function makeRandom () {
      let ang = Math.random() * 2 * Math.PI
      let hyp = Math.sqrt(Math.random()) * radius
      let adj = Math.cos(ang) * hyp
      let opp = Math.sin(ang) * hyp

      return new Vector3(
        position.x - (radius / 2) + adj,
        1000,
        position.z - (radius / 2) + opp
      )
    }

    return makeRandom()
  }

  const asText = (str) => str.replace(/<[^>]+>/g, '')

  const images = epoch.map(i => {
    const point = getRandomPoint()
    return {
      uuid: i.slug,
      title: i.title.rendered || '',
      src: i.acf.preview_image?.url,
      author: asText(i.acf.article_by),
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

  const onClick = () => {
    console.log('on click')
  }

  const onFadeout = () => {
    dispatch('fadeout')
  }

  const onFadein = () => {
    dispatch('fadein')
  }

</script>

{#each images as { uuid, src, pos: position, title, author }, i (`${uuid}${i}`)}
  <ImageCanvas
    on:fadeout={onFadeout}
    on:fadein={onFadein}
    {title}
    {author}
    {uuid}
    {position}
    {src}
    {i}
  />
{/each}
