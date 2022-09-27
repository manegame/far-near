<script lang="ts">
  import { Mesh } from "@threlte/core"
  import { AutoColliders } from "@threlte/rapier"
  import {
    BoxGeometry,
    MeshBasicMaterial,
    PlaneGeometry,
    CanvasTexture,
    ClampToEdgeWrapping,
  } from "three"
  import {
    generateHeight,
    generateTexture,
  } from "../../threejs/terrain/index.js"

  const width = 200,
    height = 200

  const data = generateHeight(20, 20)
  // const geometry = new PlaneGeometry(100, 100, 100, 100)

  const texture = new CanvasTexture(generateTexture(data, width, height))
  texture.wrapT = ClampToEdgeWrapping
  texture.wrapS = ClampToEdgeWrapping
</script>

<AutoColliders shape={"cuboid"} position={{ y: -0.5 }}>
  <Mesh
    rotation={{ x: Math.PI / 2 }}
    receiveShadow
    geometry={new PlaneGeometry(100, 100, 100, 100)}
    material={new MeshBasicMaterial({ map: texture })}
  />
</AutoColliders>
