import { ShaderMaterial, DoubleSide } from 'three'
import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

export default class TransparencyMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader
    })

    this.side = DoubleSide
    this.transparent = true

    this.uniforms = {
      ...options.uniforms
    }
  }
}