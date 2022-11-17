<script lang="ts">
	import {
    useTexture,
    Mesh
  } from '@threlte/core'
	import { Debug, World, AutoColliders } from '@threlte/rapier'
	import {
    BoxGeometry,
    MeshStandardMaterial,
    PlaneGeometry,
    TextureLoader,
    RepeatWrapping
  } from 'three'

  const tex = useTexture('/terrains/one.png')

  console.log(tex)
  console.log('ground')
</script>

<Debug />

<AutoColliders shape={'convexHull'} position={{ y: -0.5 }}>
	<Mesh
		receiveShadow
		geometry={new BoxGeometry(10, 1, 10)}
		material={new MeshStandardMaterial()}
	/>
</AutoColliders>