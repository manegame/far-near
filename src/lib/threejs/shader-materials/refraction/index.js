import { ShaderMaterial } from "three";
import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

export default class RefractionMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader
    });

    this.uniforms = {
      envMap: { value: options.envMap },
      resolution: { value: options.resolution }
    };
  }
}
