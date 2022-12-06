<script>
  import { Mesh } from "@threlte/core"
  import { Vector2, SphereGeometry, MeshBasicMaterial, BackSide, RepeatWrapping } from "three"
  import { useTexture } from "@threlte/core"

  const tex = useTexture('/textures/sky/sky.png')
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set( 22, 22 );
  tex.repeat.set(4, 1)

  export let color
</script>

<Mesh
  geometry={new SphereGeometry(10000, 20, 20)}
  material={new MeshBasicMaterial({
    map: tex,
    color,
    side: BackSide
  })}
/>

<Mesh
  geometry={new SphereGeometry(10000, 20, 200)}
  scale={{ x: 0.97, y: 0.97, z: 0.97 }}
  material={new MeshBasicMaterial({
    transparent: true,
    opacity: 0.6,
    color,
    side: BackSide
  })}
/>

<Mesh
  geometry={new SphereGeometry(10000, 20, 20)}
  material={new MeshBasicMaterial({
    map: tex,
    color,
    side: BackSide
  })}
/>