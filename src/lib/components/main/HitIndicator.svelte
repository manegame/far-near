<script>
  import { ConeGeometry, MeshStandardMaterial } from 'three'
  import { Mesh } from '@threlte/core'
  import { hitPosition, hitLookAt } from "$lib/stores"

  // let mesh

  // $: {
  //   if (mesh) console.log(mesh.lookAt)
  // }

  // $:console.log($hitLookAt)
</script>

{#if import.meta.env.DEV}
  <Mesh
    userData={{ ignoteRaycaster: true }}
    position={$hitPosition}
    lookAt={$hitLookAt}
    geometry={new ConeGeometry(4, 10, 15)}
    material={new MeshStandardMaterial({ color: 0xff0000 })}
  />
{/if}