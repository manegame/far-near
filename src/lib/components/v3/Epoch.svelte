<script>
  export let data
  export let year
  
  import { Mesh } from "@threlte/core"
  import { BoxGeometry, MeshStandardMaterial } from 'three'

  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshStandardMaterial()
</script>

<Mesh {geometry} {material} />

