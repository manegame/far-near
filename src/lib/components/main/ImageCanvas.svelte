<script>
  import {
    BoxGeometry,
    MeshBasicMaterial,
    TextureLoader,
    Raycaster,
    Vector3,
    Euler
  } from 'three'
  import { useTexture, Mesh, useLoader, useFrame, useThrelte } from "@threlte/core"

  export let image
  export let i
  export let base = 10
  export let rotation = new Euler(0, 1 - i / 10, 0)
  export let position = new Vector3(i * base, 100, i * base)

  const src = image.replace(/.*\//, '/workaround/')
  const raycaster = new Raycaster(position, new Vector3( 0, - 1, 0 ))
  let ratio = 0
  let colorMaterial = new MeshBasicMaterial({
    color: 0xffffff
  })
  let ready = false
  let geometry
  let material
  const { scene } = useThrelte()
  let intersects = undefined

  useFrame(() => {
    if (!intersects) {
      const is = raycaster.intersectObjects(scene.children)
      if (is.length > 0) {
        intersects = is
      }
    }
  })

  $: {
    if (intersects && intersects[0]) {
      const distances = intersects.map(i => i.distance)
      const offset = Math.max(...[distances])
      position.y -= intersects[0].distance - (base / 2)
    }
  }

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.height / texture.source.data.width
      geometry = new BoxGeometry(base, base * ratio, base / 10)
      const imageMaterial = new MeshBasicMaterial({ map: tex })
      material = [
        colorMaterial,
        colorMaterial,
        colorMaterial,
        colorMaterial,
        imageMaterial,
        imageMaterial
      ]
      ready = true
    }
  })

</script>

{#if ready}
  <Mesh
    {geometry}
    receiveShadow={true}
    castShadow={true}
    {material}
    {position}
    {rotation}
  />
{/if}