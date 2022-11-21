<script>
  import {
    PlaneGeometry,
    Vector2
  } from 'three'
  import { Water } from "three/examples/jsm/objects/Water2"
  import { useThrelte } from "@threlte/core"

  export let ready = false
  export let geometry = new PlaneGeometry(2000, 2000, 20, 20)

  const { scene } = useThrelte()

  const water = new Water(geometry, {
    color: 0xdf4fdfd,
    scale: 3, // 1 to 10
    flowDirection: new Vector2(-0.1, -0.2), // -1 to 1
    textureWidth: 512,
    textureHeight: 512
  })
  water.rotation.x = - Math.PI / 2
  water.position.y = -5
  scene.add(water)

  ready = true
</script>
