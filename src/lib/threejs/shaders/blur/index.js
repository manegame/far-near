import vertexShader from "./vertex.vert?raw";
import fragmentShader from "./fragment.frag?raw";

const Noise = {
  uniforms: {
    tDiffuse: { value: null },
    u_scale: { value: 0.05 }
  },
  vertexShader,
  fragmentShader
}

export { Noise }