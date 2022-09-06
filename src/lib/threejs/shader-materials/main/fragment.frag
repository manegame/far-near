uniform vec2 u_resolution;
uniform float u_time;

float vignette (vec2 st, float intensity, float extend) {
  float vig = st.x * st.y * intensity; // multiply with sth for intensity
    
  vig = pow(vig, extend); // change pow for modifying the extend of the  vignette

  return vig;
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}

// Value noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float makeSomeNoise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}


void main()	{
    vec2 positionNormalized = gl_FragCoord.xy / u_resolution.xy - .5;
    
    positionNormalized += .2*sin(vec2(.002*u_time, -.065*u_time+0.1));  

    // spherical coordinate with radius 1
    vec4 angles = .2 * vec4(positionNormalized.xy, positionNormalized.xy);

    angles *= .5*vec4(.07*sin(u_time)-2., -.41*sin(u_time)+.13, .19*sin(u_time), -.21*sin(u_time))
          +50.*sin(vec4(.02*sin(u_time)-2., -.031*sin(u_time)+.13, .039*sin(u_time)+.27, -.05*sin(u_time))); 

    // to cartesian color space
    vec3 outCol = vec3(sin(angles.x) * cos(angles.y), sin(angles.y)*cos(angles.x), cos(angles.y));
    vec3 outCol2 = vec3(sin(angles.z)*cos(angles.w), sin(angles.w)*cos(angles.z), cos(angles.w));

    mat3 palette = 1./255.*mat3(
        255., 55., 41.,
        139., 183., 234.,
        59., 160., 241.);

    vec3 o = .5 * (outCol + outCol * palette);
    vec3 o2 = .5 * (outCol2 + outCol2 * palette);

    vec3 finalOut = o * (.22 + .37*sin(.32*u_time)) + o2 * (.34 + .26*cos(.123*u_time)) + .3 + .2*sin(vec3(-.1*u_time, -.11*u_time+.3, -.021*u_time-.2))*length(outCol2-outCol);
    
    finalOut = finalOut * palette;

    finalOut = .9 * finalOut + finalOut.yzx * sin(angles.wxz) * length(outCol2-outCol) * palette;

    // float noise = makeSomeNoise(positionNormalized);

    // finalOut *= fract(noise);

    gl_FragColor = vec4(finalOut, 1.0);
}
