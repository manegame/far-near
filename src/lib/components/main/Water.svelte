<script>
  import {
    PlaneGeometry,
    MeshBasicMaterial,
    RepeatWrapping,
    Vector2
  } from 'three'
  import { onMount } from "svelte"
  import { Water } from "three/examples/jsm/objects/Water2"
  import { useThrelte, useTexture } from "@threlte/core"
  import { Mesh } from "@threlte/core"

  export let geometry = new PlaneGeometry(2000, 2000, 20, 20)

  const { scene } = useThrelte()

  const water = new Water(geometry, {
    color: 0xdf4fdfd,
    scale: 3, // 1 to 10
    flowDirection: new Vector2(-0.1, -0.2), // -1 to 1
    textureWidth: 256,
    textureHeight: 256
  })
  scene.add(water)
  water.rotation.x = - Math.PI / 2
  water.position.y = -5
</script>

<!-- <Mesh position={{ y: -100 }} rotation={{ x: - Math.PI / 2 }} {geometry} material={new MeshBasicMaterial({ color: 0x000066 })} /> -->
