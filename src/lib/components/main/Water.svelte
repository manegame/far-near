<script>
  import { PlaneGeometry, MeshBasicMaterial } from 'three'
  import { Mesh } from "@threlte/core"
</script>

<Mesh position={{ y: -10 }} rotation={{ x: - Math.PI / 2 }} geometry={new PlaneGeometry(2000, 2000, 2, 2)} material={new MeshBasicMaterial({ color: 0x000066 })} />