<svelte:options accessors={true} />

<script lang="ts">
  import { Mesh } from "@threlte/core"
  import { useGltf } from "@threlte/extras"
  import Water from "$lib/components/main/Water.svelte"
  import {
    Debug,
    AutoColliders
  } from "@threlte/rapier"
  import {
    MeshStandardMaterial,
    DoubleSide
  } from "three"

  const flyToMe = (e) => {
    console.log(e)
  }

  let mesh

  const { gltf } = useGltf('/terrains/v6.glb')
</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<!-- <Debug /> -->

{#if $gltf}
  <AutoColliders shape={"trimesh"} position={{ y: -0.5 }}>
    <Mesh
      on:click={flyToMe}
      bind:mesh
      receiveShadow
      castShadow
      geometry={$gltf.nodes.Plane.geometry}
      scale={{ x: 800, y: 400, z: 800 }}
      position={{ y: -8 }}
      material={new MeshStandardMaterial({
        // side: DoubleSide
        // wireframe: true
      })}
    />
  </AutoColliders>
{/if}

<Water />

<!-- https://threejs.org/examples/webgl_water.html -->