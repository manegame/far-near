<script>
  import { Mesh } from "@threlte/core"
  import { Vector2, SphereGeometry, MeshBasicMaterial } from "three"
</script>

<Mesh
  geometry={new SphereGeometry(100, 20, 20)}
  material={new MeshBasicMaterial({ color: 0xff0000})}
/>