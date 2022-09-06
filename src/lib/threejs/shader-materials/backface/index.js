import { ShaderMaterial, BackSide } from "three";
import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

export default class BackFaceMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      side: BackSide
    });
  }
}
