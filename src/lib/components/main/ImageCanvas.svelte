<script>
  import { BoxGeometry, MeshBasicMaterial, TextureLoader } from 'three'
  import { useTexture, Mesh, useLoader } from "@threlte/core"

  export let image
  export let i
  export let rotation
  export let base = 5
  export let position = { x: i * base, y: 0, z: i * base }

  const src = image.replace(/.*\//, '/workaround/')
  let ratio = 0
  let geometry
  let imageMaterial
  let colorMaterial = new MeshBasicMaterial({ color: 0xffffff })
  let ready = false

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.width / texture.source.data.height
      geometry = new BoxGeometry(base, base * ratio, 0.1)
      imageMaterial = new MeshBasicMaterial({ map: tex })
      ready = true
    }
  })
</script>

{#if ready}
  <Mesh
    {geometry}
    material={[
      colorMaterial,
      colorMaterial,
      colorMaterial,
      colorMaterial,
      colorMaterial,
      imageMaterial
    ]}
    {position}
    {rotation}
  />
{/if}