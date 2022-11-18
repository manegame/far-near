<script>
  import { BoxGeometry, MeshBasicMaterial, TextureLoader, Raycaster, Vector3 } from 'three'
  import { useTexture, Mesh, useLoader, useFrame, useThrelte } from "@threlte/core"

  export let image
  export let i
  export let rotation
  export let base = 2
  export let position = new Vector3(i * base, 100, i * base)


  const src = image.replace(/.*\//, '/workaround/')
  let ratio = 0
  let geometry
  let imageMaterial
  let colorMaterial = new MeshBasicMaterial({ color: 0xffffff })
  let ready = false
  const raycaster = new Raycaster(position, new Vector3( 0, - 1, 0 ))
  const { scene } = useThrelte()
  let intersects


  useFrame(() => {
    if (!intersects) {
      intersects = raycaster.intersectObjects(scene.children)
    }
  })

  $: {
    if (intersects) {
      position.y -= intersects[0].distance + base
    }
  }

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.height / texture.source.data.width
      geometry = new BoxGeometry(base, base * ratio, 0.05)
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