<svelte:options accessors={true} />

<script lang="ts">
  import { useTexture, Mesh } from "@threlte/core"
  import { useGltf } from "@threlte/extras"
  import {
    useRapier,
    Debug,
    AutoColliders,
    RigidBody,
    Collider
  } from "@threlte/rapier"
  import {
    BoxGeometry,
    MeshStandardMaterial,
    MeshBasicMaterial,
    PlaneGeometry,
    CanvasTexture,
    ClampToEdgeWrapping,
    DoubleSide
  } from "three"
  import {
    generateHeight,
    generateTexture,
  } from "../../threejs/terrain/index.js"

  const {
    rapier // RAPIER
  } = useRapier()

  const subdivisions = 20
  const scale = new rapier.Vector3(200.0, 3.0, 200.0);

  let displacementScale = 40
  let mesh = null
  let heights = new Float32Array()
  let args = []

  let collider
  let rigid

  const { gltf } = useGltf('/terrains/v6.glb')
</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<Debug />

<div class="fixed inset-0 z-40">
  <input type="range" name="displacementScale" id="displacementScale" bind:value={displacementScale} step={0.1} min={-1000} max={1000}>
</div>

{#if $gltf}
  <AutoColliders shape={"convexHull"} position={{ y: -0.5 }}>
    <Mesh
      bind:mesh
      receiveShadow
      castShadow
      geometry={$gltf.nodes.Plane.geometry}
      scale={{ x: 100, y: 100, z: 100 }}
      position={{ y: -50 }}
      material={new MeshStandardMaterial({
        side: DoubleSide,
        wireframe: true
      })}
    />
  </AutoColliders>
{/if}