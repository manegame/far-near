<script>
  import {
    BoxGeometry,
    MeshLambertMaterial,
    TextureLoader,
    Raycaster,
    Vector3,
    Euler,
    Color,
    SpotLight
  } from 'three'
  import { AutoColliders } from '@threlte/rapier'
  import { useTexture, Mesh, useLoader, useFrame, useThrelte, Three, Group } from "@threlte/core"
  import { activeCanvas } from "$lib/stores"

  export let uuid
  export let src
  export let i
  export let base = 10
  export let rotation = new Euler(0, 1 - i / 10, 0)
  export let position = new Vector3(i * base, 100, i * base)

  // TODO: Remove workaround
  src = src.replace(/.*\//, '/workaround/')

  const raycaster = new Raycaster(position, new Vector3( 0, - 1, 0 ))
  let colorMaterial = new MeshLambertMaterial({
    color: 0xffffff
  })
  let ready = false
  let placed = false
  let ratio = 0
  let boxHeight = base
  let d = Math.random() * 10
  let geometry
  let material
  let mesh
  let light

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

        position.y -= (offset - boxHeight)
        placed = true
      }
    }

    if (mesh && placed) {
      position.y += Math.sin(d) * 0.01
      // rotation.y += Math.sin(d) * 0.005
    }
  })

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.height / texture.source.data.width
      boxHeight = base * ratio
      geometry = new BoxGeometry(base, boxHeight, 0.1)
      const imageMaterial = new MeshLambertMaterial({
        map: tex
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

  $: if (uuid === $activeCanvas) {
    mesh.material.emissive = new Color(0xffffff)
  }

  // $: if (light && mesh) {
  //   light.position.y += 10
  //   light.position.x += 10
  //   light.target = mesh
  //   console.log(light)
  // }

</script>

<Group>
  {#if ready}
    <AutoColliders shape={'cuboid'}>
      <Mesh
        userData={{
          isImageCanvas: true,
          uuid
        }}
        bind:mesh
        {geometry}
        {position}
        receiveShadow
        castShadow
        {material}
        {rotation}
      />
    </AutoColliders>
  {/if}

</Group>
<!-- <Three
  bind:ref={light}
  position={position}
  type={SpotLight}
  args={[0xffffff, 1]}
/> -->