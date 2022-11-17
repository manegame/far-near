<svelte:options accessors={true} />

<script lang="ts">
  import { Mesh } from "@threlte/core"
  import { useGltf } from "@threlte/extras"
  import {
    Debug,
    AutoColliders
  } from "@threlte/rapier"
  import {
    MeshStandardMaterial,
    DoubleSide
  } from "three"

  let mesh

  const { gltf } = useGltf('/terrains/v6.glb')
</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<Debug />

{#if $gltf}
  <AutoColliders shape={"trimesh"} position={{ y: -0.5 }}>
    <Mesh
      bind:mesh
      receiveShadow
      castShadow
      geometry={$gltf.nodes.Plane.geometry}
      scale={{ x: 800, y: 800, z: 800 }}
      position={{ y: -50 }}
      material={new MeshStandardMaterial({
        // side: DoubleSide
        // wireframe: true
      })}
    />
  </AutoColliders>
{/if}

<!-- https://threejs.org/examples/webgl_water.html -->