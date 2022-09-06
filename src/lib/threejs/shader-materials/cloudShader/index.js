import { ShaderMaterial, DoubleSide } from 'three'
import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

export default class CloudMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader
    })

    this.side = DoubleSide

    this.uniforms = {
      ...options.uniforms
    }
  }
}