<svelte:options accessors={true} />

<script lang="ts">
  import { Mesh, useTexture } from "@threlte/core"
  import { useGltf } from "@threlte/extras"
  import {
    AutoColliders
  } from "@threlte/rapier"
  import Water from "$lib/components/main/Water.svelte"
  import { waterReady } from "$lib/stores"
  import {
    // MeshStandardMaterial,
    ShadowMaterial,
    MeshBasicMaterial,
    DoubleSide,
    MeshNormalMaterial,
    MeshLambertMaterial,
    RepeatWrapping
  } from "three"
  import { createEventDispatcher } from "svelte"
  export let color
  let geometry
  
  const dispatch = createEventDispatcher()
  const { gltf } = useGltf('/terrains/v7-compressed.glb', {
    useDraco: true
  })
  const map = useTexture('/textures/grass/Grass_005_BaseColor.png')
  map.wrapS = RepeatWrapping
  map.wrapT = RepeatWrapping
  map.repeat.set(16, 16);
  let mesh

  $: {
    if ($gltf && $waterReady) {
      console.log($gltf.nodes)
      geometry = $gltf.nodes.Plane.geometry
      geometry.computeVertexNormals() 
      dispatch('ready')
    }
  }

</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<!-- <Debug /> -->

{#if $gltf}
  <AutoColliders shape={"trimesh"}>
    <Mesh
      bind:mesh
      receiveShadow
      castShadow
      {geometry}
      scale={{ x: 800, y: 300, z: 800 }}
      position={{ y: 50 }}
      material={new MeshLambertMaterial({
        // transparent: true,
        // opacity: 0.5,
        color,
        map,
        side: DoubleSide
      })}
    />
  </AutoColliders>
{/if}

<Water
  bind:ready={$waterReady}
/>

<!-- https://threejs.org/examples/webgl_water.html -->