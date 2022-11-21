<script>
  import { Mesh } from "@threlte/core"
  import { Vector2, SphereGeometry, MeshBasicMaterial, BackSide } from "three"

  export let color
</script>

<Mesh
  geometry={new SphereGeometry(10000, 20, 20)}
  material={new MeshBasicMaterial({
    color,
    side: BackSide
  })}
/>