<script>
  import { BoxGeometry, MeshStandardMaterial, TextureLoader } from 'three'
  import { useTexture, Mesh, useLoader } from "@threlte/core"

  export let image

  const loader = useLoader(TextureLoader, () => new TextureLoader())
  loader.crossOrigin = ''
  loader.load(image, (object) => {
    console.log(object)
  })

  // const tex = useTexture(image)

  // console.log(tex)

  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshStandardMaterial()
</script>

<Mesh {geometry} {material} />