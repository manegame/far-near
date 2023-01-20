<script>
  import {
    BoxGeometry,
    MeshLambertMaterial,
    Raycaster,
    Vector3,
    Euler,
    Color,
    Box3,
    MeshBasicMaterial
  } from 'three'
  import { cubicOut } from "svelte/easing"
  import {
    terrainReady,
    lightsOff,
    lightsOn,
    playerPosition,
    locked
  } from "$lib/stores"
  import { AutoColliders, Collider } from '@threlte/rapier'
  import { getChildren, closestObject, currentObject } from "$lib/functionality/raycaster"
  import { useTexture, Mesh, useFrame, useThrelte, Group, InteractiveObject } from "@threlte/core"
  import { Text } from "@threlte/extras"
  import { activeCanvas } from "$lib/stores"
  import { tweened } from "svelte/motion"
  import { createEventDispatcher } from "svelte"

  export let uuid
  export let src
  export let i
  export let title
  export let author
  export let base = 10
  export let position = new Vector3(i * base, 100, i * base)
  export let MIN_DISTANCE = 50

  console.log('image canvas')

  const dispatch = createEventDispatcher()
  const INITIAL_ROTATION = new Euler(0, 1 - i / 10, 0)
  const imageOpacity = tweened(0, {
		duration: 400,
		easing: cubicOut
  })
  const opacity = tweened(0, {
		duration: 400,
		easing: cubicOut
  })
  const raycaster = new Raycaster(position, new Vector3( 0, -1, 0 ))
  const { scene } = useThrelte()

  let present = false
  let imagePresent = false
  let imageClose = false
  let ready = false
  let placed = false
  let ratio = 0
  let boxHeight = base
  let d = Math.random() * 10
  let geometry
  let imageMaterial
  let mesh
  let group
  let boundingBox
  let offsetY = 0
  let lineHeight = 1
  let lightsAreOff = false
  let lines = Math.floor(title.length / 32)

  export let rotation = tweened(INITIAL_ROTATION, {
    duration: 100,
    easing: cubicOut
  })

  if (import.meta.env.DEV) {
    src = src.replace(/.*\//, '/workaround/')
  }

  title = title.replaceAll('&#8217;', '’')
  title = title.replaceAll('&#8220;', '“')
  title = title.replaceAll('&#8221;', '”')

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

  const tex = useTexture(src, {
    onLoad: (texture) => {
      ratio = texture.source.data.naturalHeight / texture.source.data.naturalWidth

      boxHeight = base * ratio
      geometry = new BoxGeometry(base, boxHeight, 0)
      imageMaterial = new MeshLambertMaterial({
        map: tex,
        transparent: true,
        lightMap: tex,
        lightMapIntensity: 2
      })

      imageOpacity.subscribe(v => imageMaterial.opacity = v)

      ready = true
    }
  })

  $: {
    if (mesh) {
      boundingBox = new Box3().setFromObject(mesh)

      const height = boundingBox.max.y - boundingBox.min.y
      const width = height * ratio

      offsetY = -((boundingBox.max.y - boundingBox.min.y) / 2)
    }
  }

  $: if (imagePresent) {
    $imageOpacity = 1
  } else {
    $imageOpacity = 0
  }

  $: if (present) {
    $opacity = 1
  } else {
    $opacity = 0
  }

  // Emit the position and url for opening the article
  $: if (imageClose) {
    // lightsOff()
    const newDir = new Vector3(1, 1, 1);
    const pos = new Vector3()
    pos.addVectors(newDir, $playerPosition);
    group.lookAt(pos);
  }

  $: {
    if ($currentObject?.userData?.uuid === uuid) {
      lightsOff()
      dispatch('fadeout')
      // lightsAreOff = true
      setTimeout(() => {
      lightsAreOff = true
    }, 500)
    } else if (lightsAreOff) {
      if (!!$currentObject?.userData?.uuid === false) {
        lightsOn()
        dispatch('fadein')
        lightsAreOff = false
      }
    }
  }

  const onClick = () => {
    console.log('on click')
  }
</script>

<!-- SENSORS -->

<!-- When you come close -->
<Collider
	on:sensorenter={() => (imageClose = true)}
	on:sensorexit={() => (imageClose = false)}
	sensor
	shape={'ball'}
	{position}
	args={[MIN_DISTANCE]}
/>
<!-- When you are far away -->
<Collider
	on:sensorenter={() => (imagePresent = true)}
	on:sensorexit={() => (imagePresent = false)}
	sensor
	shape={'ball'}
	{position}
	args={[1000]}
/>
<!-- When you wanna see the text -->
<Collider
	on:sensorenter={() => (present = true)}
	on:sensorexit={() => (present = false)}
	sensor
	shape={'ball'}
	{position}
	args={[90]}
/>

<Group
  bind:group
  {position}
  rotation={$rotation}
>
  {#if ready}
    <AutoColliders
      shape={'cuboid'}>
      <Mesh
        interactive
        on:click={onClick}
        userData={{
          isImageCanvas: true,
          uuid
        }}
        bind:mesh
        {geometry}
        castShadow
        material={imageMaterial}
      />
    </AutoColliders>
    {/if}
    <Text
    userData={{
      isImageCanvas: false,
      uuid
    }}
    position={{ y: offsetY - 0.7 }}
    font="/fonts/NeueHaasUnica-ExtraBold.ttf"
    fontSize={1}
    maxWidth={20}
    whiteSpace="normal"
    text="{title}"
    textAlign="center"
    anchorX="center"
    fillOpacity={$opacity}
    />
    <Text
    userData={{
      isImageCanvas: false,
      uuid
    }}
    position={{ y: (offsetY - (lines * lineHeight)) - 2 }}
    font="/fonts/NeueHaasUnica-Bold.ttf"
    fontSize={0.66}
    maxWidth={12}
    whiteSpace="normal"
    text="{author}"
    textAlign="center"
    anchorX="center"
    fillOpacity={$opacity}
    />
  </Group>
