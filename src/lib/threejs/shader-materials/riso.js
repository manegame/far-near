import * as THREE from 'three'
import noise from "glsl-noise/simplex/2d.glsl?raw"

const fragmentShader = `
${noise}

uniform vec3 uColor;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uNoiseScale;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;

vec3 light_reflection(vec3 lightColor) {
  // AMBIENT is just the light's color
  vec3 ambient = lightColor;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // DIFFUSE  calculations
  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  vec3 diffuse = lightColor * max(dot(vSurfaceToLight, vNormal), 0.0);

  // Combine 
  return (ambient + diffuse);
}

void main(void) {
  vec3 light_value = light_reflection(uLightColor);
  light_value *= uLightIntensity;

  // grain
  vec2 uv = gl_FragCoord.xy;
  uv /= uNoiseScale;

  vec3 colorNoise = vec3(snoise(uv) * 0.5 + 0.5);
  colorNoise *= pow(light_value.r, 5.0);

  gl_FragColor.r = max(colorNoise.r, uColor.r);
  gl_FragColor.g = max(colorNoise.g, uColor.g);
  gl_FragColor.b = max(colorNoise.b, uColor.b);
  gl_FragColor.a = 1.0;
}  
`

export default {
  name: 'Riso',
  uniforms: {
    uColor: { value: new THREE.Color(0x111) },
    uLightPos: {
      value: new THREE.Vector3(30, 12, 3) // position of spotlight
    },
    uLightColor: {
      value: new THREE.Color(0xffffff) // default light color
    },
    uLightIntensity: {
      value: 0.7 // light intensity
    },
    uNoiseScale: {
      value: 3.0
    }
  },
  vertexShader: `
    uniform vec3 uLightPos;

    varying vec3 vNormal;
    varying vec3 vSurfaceToLight;
    
    void main(void) {
      vNormal = normalMatrix * normal;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      // General calculations needed for diffuse lighting
      // Calculate a vector from the fragment location to the light source
      vec3 surfaceToLightDirection = vec3( modelViewMatrix * vec4(position, 1.0));
      vec3 worldLightPos = vec3( viewMatrix * vec4(uLightPos, 1.0));
      vSurfaceToLight = normalize(worldLightPos - surfaceToLightDirection);
    }  
  `,
  fragmentShader
}