<script>
  import { CameraHelper, Camera } from "three"
  import { useParent, useThrelte } from "@threlte/core"

  const {
    scene
  } = useThrelte()

  const camera = useParent()

  const helper = new CameraHelper(camera)
  scene.add(helper)
</script>