<svelte:options accessors={true} />

<script lang="ts">
  import { writable } from "svelte/store"
  import { Mesh } from "@threlte/core"
  import { useGltf } from "@threlte/extras"
  import Water from "$lib/components/main/Water.svelte"
  import {
    Debug,
    AutoColliders
  } from "@threlte/rapier"
  import {
    // MeshStandardMaterial,
    ShadowMaterial,
    MeshBasicMaterial,
    DoubleSide
  } from "three"
  import { createEventDispatcher } from "svelte"
  
  const dispatch = createEventDispatcher()
  const { gltf } = useGltf('/terrains/v6.glb')
  let mesh
  let waterReady = false

  $: {
    if ($gltf && waterReady) {
      dispatch('ready')
    }
  }

</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<!-- <Debug /> -->

{#if $gltf}
  <AutoColliders shape={"trimesh"} position={{ y: -0.5 }}>
    <Mesh
      bind:mesh
      receiveShadow
      castShadow
      geometry={$gltf.nodes.Plane.geometry}
      scale={{ x: 800, y: 400, z: 800 }}
      position={{ y: -8 }}
      material={new MeshBasicMaterial({
        color: 0x333333,
        side: DoubleSide
      })}
    />
  </AutoColliders>
{/if}

<Water
  bind:ready={waterReady}
/>

<!-- https://threejs.org/examples/webgl_water.html -->