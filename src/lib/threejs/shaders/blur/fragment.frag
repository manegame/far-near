uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float blurSize;

varying vec2 v_uv;

vec4 blur(sampler2D tex){
  const float PI2=6.28318530718;// Pi*2
  
  // BLUR SETTINGS {{{
    const float directions=16.;// BLUR DIRECTIONS (Default 16.0 - More is better but slower)
    const float quality=3.;// BLUR QUALITY (Default 3.0 - More is better but slower)
  // BLUR SETTINGS }}}
  
  vec2 radius=blurSize/resolution;
  
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv=gl_FragCoord.xy/resolution;
  // Pixel colour
  vec4 color=texture2D(tex,uv);
  
  // Blur calculations
  int count=1;
  for(float theta=0.;theta<PI2;theta+=PI2/directions)
  {
    vec2 dir=vec2(cos(theta),sin(theta))*radius;
    for(float i=1./quality;i<=1.;i+=1./quality)
    {
      color+=texture2D(tex,uv+dir*i);
      count++;
    }
  }
  
  color/=float(count);
  
  return color;
}

void main(void)
{
  gl_FragColor=blur(tDiffuse);
}