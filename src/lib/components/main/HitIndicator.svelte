<script>
  import { ConeGeometry, MeshStandardMaterial } from 'three'
  import { Mesh } from '@threlte/core'
  import { hitPosition, hitLookAt } from "$lib/functionality/raycaster"
</script>

{#if import.meta.env.DEV}
  <Mesh
    userData={{ ignoreRaycaster: true }}
    position={$hitPosition}
    lookAt={$hitLookAt}
    geometry={new ConeGeometry(1, 4, 15)}
    material={new MeshStandardMaterial({ color: 0xff0000 })}
  />
{/if}