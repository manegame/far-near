export const multiCameraSetup = (cameras, renderer, scene, views) => {
  if (cameras.length > 0) {
    for (let i = 0; i < cameras.length; i++) {
      makeView(cameras[i], renderer, scene, 0xfffff, views[i])
    }
  }
}

export const makeView = (camera, renderer, scene, background, { left, bottom, width, height }) => {
  left = Math.floor(window.innerWidth * left)
  bottom = Math.floor(window.innerHeight * bottom)
  width = Math.floor(window.innerWidth * width)
  height = Math.floor(window.innerHeight * height)

  renderer.setViewport(left, bottom, width, height)
  renderer.setScissor(left, bottom, width, height)
  renderer.setScissorTest(true)
  renderer.setClearColor(background)
  renderer.render(scene, camera)
  camera.updateProjectionMatrix()
}