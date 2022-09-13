import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js'
import * as THREE from 'three'

/**
 * Generate heightmap
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
// generate the heightmap using ImprovedNoise addon
export function generateHeight(width, height, seed = Math.PI / 4) {
  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const size = width * height,
    data = new Uint8Array(size)
    const perlin = new ImprovedNoise(),
    z = Math.random() * 100

  // The highest quality is, the less there is different volumes. example : if quality = 3, terrain look like a lot of little pic while if quality = 100, the terrain look like dune
  let quality = 20

  // j < 'maximum height value', change this to get higher or lower volumes
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width)
        data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 2)
    }

    quality *= 2;
  }

  return data
}

export function generateTexture(data, width, height) {
  console.log(width, height)
  let context, image, imageData, shade

  const vector3 = new THREE.Vector3(0, 0, 0)

  //sun intensity
  const sun = new THREE.Vector3(1, 1, 1)
  sun.normalize()

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  context = canvas.getContext("2d")
  context.fillStyle = "#000"
  context.fillRect(0, 0, width, height)

  image = context.getImageData(0, 0, canvas.width, canvas.height)
  imageData = image.data

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2]
    vector3.y = 2
    vector3.z = data[j - width * 2] - data[j + width * 2]
    vector3.normalize()

    shade = vector3.dot(sun)

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007)
    imageData[i + 1] = (96 + shade * 128) * (0.5 + data[j] * 0.007)
    imageData[i + 2] = (96 + shade * 128) * (0.5 + data[j] * 0.007)
  }

  context.putImageData(image, 0, 0)

  // To multiply the scale of terrain, change the "*1" value

  const canvasScaled = document.createElement("canvas")
  canvasScaled.width = width * 1
  canvasScaled.height = height * 1

  context = canvasScaled.getContext("2d")
  context.scale(4, 4)
  context.drawImage(canvas, 0, 0)

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height)
  imageData = image.data

  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(Math.random() * 5)

    // R G & B values
    imageData[i] += v
    imageData[i + 1] += v
    imageData[i + 2] += v
  }
  context.putImageData(image, 0, 0)

  return canvasScaled
}
