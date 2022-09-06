import { ShaderMaterial } from 'three'
import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

export default class BlackHoleMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      ...options
    })

    this.uniforms = {
      ...options.uniforms
    }
  }
}