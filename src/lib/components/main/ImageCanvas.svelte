<script>
  import {
    BoxGeometry,
    MeshLambertMaterial,
    TextureLoader,
    Raycaster,
    Vector3,
    Euler,
    Color,
    Box3
  } from 'three'
  import { cubicOut } from "svelte/easing"
  import { terrainReady } from "$lib/stores"
  import { AutoColliders, Collider } from '@threlte/rapier'
  import { getChildren, closestObject } from "$lib/functionality/raycaster"
  import { useTexture, Mesh, useLoader, useFrame, useThrelte, Three, Group } from "@threlte/core"
  import { Text } from "@threlte/extras"
  import { activeCanvas } from "$lib/stores"
  import { tweened } from 'svelte/motion';

  export let uuid
  export let src
  export let i
  export let title
  export let author
  export let base = 10
  export let rotation = new Euler(0, 1 - i / 10, 0)
  export let position = new Vector3(i * base, 100, i * base)

  const opacity = tweened(0, {
		duration: 400,
		easing: cubicOut
  })

  let present

  // TODO: Remove workaround
  src = src.replace(/.*\//, '/workaround/')

  const raycaster = new Raycaster(position, new Vector3( 0, -1, 0 ))
  let colorMaterial = new MeshLambertMaterial({
    color: 0xffffff
  })
  let ready = false
  let placed = false
  let ratio = 0
  let boxHeight = base
  let d = Math.random() * 10
  let geometry
  let imageMaterial
  let material
  let mesh
  let boundingBox
  let offsetY = 0
  let lineHeight = 1

  const { scene } = useThrelte()

  const onChange = () => {
    console.log('on that change')
  }

  useFrame(() => {
    d+= 0.01
    if (!placed && ready && $terrainReady) {
      const intersects = raycaster.intersectObjects(getChildren(scene))

      if (intersects.length > 0) {
        const hit = closestObject(intersects)

        const offset = hit.distance

        position.y -= offset - 10
        placed = true
      }
    }

    if (mesh && placed) {
      position.y += Math.sin(d) * 0.01
    }
  })

  let lines = Math.floor(title.length / 32)

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.naturalHeight / texture.source.data.naturalWidth

      boxHeight = base * ratio
      geometry = new BoxGeometry(base, boxHeight, 0.1)
      imageMaterial = new MeshLambertMaterial({
        map: tex,
        lightMap: tex,
        lightMapIntensity: 2
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

  $: {
    if (mesh) {
      if (uuid === $activeCanvas) {
        mesh.material.emissive = new Color(0x000000)
      } else {
        mesh.material.emissive = new Color(0x000000)
      }

      boundingBox = new Box3().setFromObject(mesh)

      const height = boundingBox.max.y - boundingBox.min.y
      const width = height * ratio

      offsetY = -((boundingBox.max.y - boundingBox.min.y) / 2)
    }
  }

  $: if (present) {
    $opacity = 1
  } else {
    $opacity = 0
  }
</script>

<!-- SENSOR -->
<Collider
	on:sensorenter={() => (present = true)}
	on:sensorexit={() => (present = false)}
	sensor
	shape={'ball'}
	{position}
	args={[90]}
/>

<Group {position}>
  {#if ready}
    <AutoColliders shape={'cuboid'}>
      <Mesh
        userData={{
          isImageCanvas: true,
          uuid
        }}
        bind:mesh
        on:change={onChange}
        {geometry}
        receiveShadow
        castShadow
        material={imageMaterial}
        {rotation}
      />
    </AutoColliders>
  {/if}
  <Text
    position={{ y: offsetY - 0.7 }}
    font="/fonts/NeueHaasUnica-Bold.ttf"
    fontSize={1}
    maxWidth={20}
    {rotation}
    whiteSpace="normal"
    text="{title}"
    textAlign="center"
    anchorX="center"
    fillOpacity={$opacity}
  />
  <Text
    position={{ y: (offsetY - (lines * lineHeight)) - 2 }}
    font="/fonts/NeueHaasUnica-Bold.ttf"
    fontSize={0.66}
    maxWidth={12}
    {rotation}
    whiteSpace="normal"
    text="{author}"
    textAlign="center"
    anchorX="center"
    fillOpacity={$opacity}
  />
</Group>

