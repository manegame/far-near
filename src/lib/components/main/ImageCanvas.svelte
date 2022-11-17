<script>
  import { BoxGeometry, MeshStandardMaterial, TextureLoader } from 'three'
  import { useTexture, Mesh, useLoader } from "@threlte/core"

  export let image
  export let position
  export let rotation
  export let base = 5

  const src = image.replace(/.*\//, '/workaround/')
  let ratio = 0
  let geometry
  let material
  let ready = false

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.width / texture.source.data.height
      geometry = new BoxGeometry(base, base * ratio, 0.1)
      material = new MeshStandardMaterial({ map: tex })
      ready = true
    }
  })
</script>

{#if ready}
  <Mesh {geometry} {material} {position} {rotation}/>
{/if}