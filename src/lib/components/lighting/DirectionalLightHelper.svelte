<script>
  import { DirectionalLightHelper, DirectionalLight } from "three"
  import { useThrelte } from "@threlte/core"

  const {
    scene
  } = useThrelte()

  const light = scene.children.find(c => {
    return c instanceof DirectionalLight
  })
  const helper = new DirectionalLightHelper(light, 3)
  scene.add(helper)
</script>