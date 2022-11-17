<svelte:options accessors={true} />

<script lang="ts">
  import { useTexture, Mesh } from "@threlte/core"
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

  const geometry = new PlaneGeometry(scale.x, scale.z, subdivisions, subdivisions)
  geometry.name = 'terrain'

  const tex = useTexture('/terrains/one.png')
  const map = useTexture('/textures/grass/Grass_005_BaseColor.jpg')
  const normalMap = useTexture('/textures/grass/Grass_005_Normal.jpg')
  const aoMap = useTexture('/textures/grass/Grass_005_AmbientOcclusion.jpg')
  const roughnessMap = useTexture('/textures/grass/Grass_005_Roughness.jpg')

  function generateTerrain () {
    const vertices = mesh.geometry.attributes.position.array

    const dx = scale.x / subdivisions
    const dy = scale.z / subdivisions

    let columnRows = new Map()

    // Create positions
    for (let i = 0; i < vertices.length; i += 3) {
      let row = Math.floor(Math.abs((vertices[i] + (scale.x / 2))) / dx)
      let column = Math.floor(Math.abs((vertices[i + 1] - (scale.z / 2))) / dy)

      const randomHeight = Math.random()
      vertices[i + 2] = scale.y * randomHeight
      // Store the height
      if (!columnRows.get(column)) {
        columnRows.set(column, new Map())
      }
      columnRows.get(column).set(row, randomHeight)
    }

    mesh.geometry.computeVertexNormals()

    let hs = []
      // store height data into column-major-order matrix array
    for (let i = 0; i <= subdivisions; ++i) {
      for (let j = 0; j <= subdivisions; ++j) {
        // console.log(columnRows.get(j))
        // console.log(columnRows.get(i))
        hs.push(columnRows.get(j).get(i));
      }
    }

    heights = new Float32Array(hs.length)
  }

  $: if (mesh) {
    // generateTerrain()
  }
</script>

<!-- https://codeworkshop.dev/blog/2020-11-05-displacement-maps-normal-maps-and-textures-in-react-three-fiber/ -->

<!-- <Debug /> -->

<div class="fixed inset-0 z-40">
  <input type="range" name="displacementScale" id="displacementScale" bind:value={displacementScale} step={0.1} min={-1000} max={1000}>
</div>

<AutoColliders shape={"convexHull"} position={{ y: -0.5 }}>
  <Mesh
    bind:mesh
    rotation={{ x: - Math.PI / 2 }}
    receiveShadow
    castShadow
    geometry={new PlaneGeometry(100, 100, 100, 100)}
    material={new MeshStandardMaterial({
      side: DoubleSide,
      wireframe: true,
      displacementMap: tex,
      displacementScale: -displacementScale
    })}
  />
</AutoColliders>
