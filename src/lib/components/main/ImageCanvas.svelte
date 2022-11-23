<script>
  import {
    BoxGeometry,
    MeshLambertMaterial,
    TextureLoader,
    Raycaster,
    Vector3,
    Euler
  } from 'three'
  import { useTexture, Mesh, useLoader, useFrame, useThrelte } from "@threlte/core"

  export let uuid
  export let src
  export let i
  export let base = 10
  export let rotation = new Euler(0, 1 - i / 10, 0)
  export let position = new Vector3(i * base, 100, i * base)
  export let opacity = 0.7

  // TODO: Remove workaround
  src = src.replace(/.*\//, '/workaround/')

  const raycaster = new Raycaster(position, new Vector3( 0, - 1, 0 ))
  let colorMaterial = new MeshLambertMaterial({
    transparent: true,
    color: 0xffffff,
    opacity
  })
  let ready = false
  let placed = false
  let geometry
  let material
  let ratio = 0
  let boxHeight = base
  let mesh
  let d = Math.random() * 10
  const { scene } = useThrelte()

  useFrame(() => {
    d+= 0.01
    if (!placed && ready) {
      const is = raycaster.intersectObjects(scene.children.filter(c => c.type === 'Mesh' || c.type === 'Water'))
      if (is.length > 0) {
        const distances = is.map(i => i.distance)

        console.log(distances)

        let offset = Math.min(...distances)

        const index = distances.indexOf(offset)

        console.log(is[index].object.type)

        position.y -= (offset - boxHeight)
        placed = true
      }
    }

    if (mesh && placed) {
      position.y += Math.sin(d) * 0.01
    }
  })

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.height / texture.source.data.width
      boxHeight = base * ratio
      geometry = new BoxGeometry(base, boxHeight, 0.1)
      const imageMaterial = new MeshLambertMaterial({
        map: tex,
        transparent: true,
        opacity
      })
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
    bind:mesh
    {geometry}
    {position}
    receiveShadow
    castShadow
    {material}
    {rotation}
  />
{/if}