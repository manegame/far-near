<script>
  import {
    PlaneGeometry,
    Vector2
  } from 'three'
  import {
    AutoColliders
  } from "@threlte/rapier"
  import { DoubleSide, MeshBasicMaterial } from "three"
  import { Water } from "three/examples/jsm/objects/Water2"
  import { useThrelte, Mesh } from "@threlte/core"

  export let ready = false
  export let geometry = new PlaneGeometry(2000, 2000, 20, 20)

  const { scene } = useThrelte()

  const water = new Water(geometry, {
    color: 0xdf4fdfd,
    scale: 10, // 1 to 10
    flowDirection: new Vector2(-1, 0), // -1 to 1
    textureWidth: 256,
    textureHeight: 256
  })
  water.material.side = DoubleSide
  water.rotation.x = - Math.PI / 2
  water.position.y = -5
  scene.add(water)

  ready = true
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
