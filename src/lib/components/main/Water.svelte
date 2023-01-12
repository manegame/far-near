<script>
  import {
    PlaneGeometry,
    Vector2
  } from 'three'
  import { waterReady } from "$lib/stores"
  import { base } from "$lib/utils"
  import { useTexture } from "@threlte/core"
  import {
    AutoColliders
  } from "@threlte/rapier"
  import { DoubleSide, MeshBasicMaterial } from "three"
  import { Water } from "three/examples/jsm/objects/Water2"
  import { useThrelte, Mesh } from "@threlte/core"

  export let geometry = new PlaneGeometry(2000, 2000, 20, 20)

  let loaded = 0

  const { scene } = useThrelte()

  const flowMap = useTexture(base() + '/textures/water/Water_1_M_Flow.jpg', {
    onLoad: () => loaded++
  })
  const normalMap0 = useTexture(base() + '/textures/water/Water_1_M_Normal.jpg', {
    onLoad: () => loaded++
  })
  const normalMap1 = useTexture(base() + '/textures/water/Water_2_M_Normal.jpg', {
    onLoad: () => loaded++
  })

  $: {
    if (loaded === 3) {
      const water = new Water(geometry, {
        color: 0xdf4fdfd,
        scale: 10, // 1 to 10
        flowDirection: new Vector2(-0.1, 0), // -1 to 1
        flowMap,
        normalMap0,
        normalMap1,
        textureWidth: 256,
        textureHeight: 256
      })
      water.material.side = DoubleSide
      water.rotation.x = - Math.PI / 2
      water.position.y = -5
      scene.add(water)
    
      $waterReady = true
    }
  }
</script>

<AutoColliders shape={"cuboid"}>
  <Mesh
    {geometry}
    userData={{ raycasterIgnore: true }}
    material={new MeshBasicMaterial({ color: 0xff0000, visible: false })}
    position={{ y: 0 }}
    rotation={{ x: - Math.PI / 2 }}
  />
</AutoColliders>
