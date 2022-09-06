uniform vec2 u_resolution;
uniform vec2 u_mouse;
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

mat2 rotate (float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

mat2 scale (vec2 _scale) {
  return mat2(_scale.x, 0.0, 0.0, _scale.y);
}

mat2 shearX (float shearAmount) {
    return mat2(
      1., shearAmount,
      0., 1.
    );
}

// Makes a black hole appear from the left and come through towards the right, pushing away everything in its path.
vec3 blackHole (vec2 st, vec3 finalOut, float speed) {
  float mouseRatio = u_mouse.x / u_resolution.x;

  // (Make tictac)
  // st *= scale(vec2(.8, 1.2));
  st *= shearX(.5);
  // st *= rotate(sin(u_time));
  st *= 4.;
  st.x *= u_resolution.x / u_resolution.y;

  
  // black hole
  // (original code)
  vec2 bh = vec2(
    // -4. + (mouseRatio * 8.),
    -4.+mod(u_time,12.),
    1.
  );
  float distToHole = distance(st, bh);
  vec2 awayVec = normalize(st - bh);

  // Magix
  st -= awayVec/distToHole*.6;
  float bubbleSize = 6.;
  vec3 space = finalOut * clamp(0., .8, pow(bubbleSize * distToHole, 2.) / 25.);
  st -= 1.;

  space = space*space*space;
  vec3 col = space * 2.;

  return col;
}


void main()	{
    vec2 positionNormalized = gl_FragCoord.xy / u_resolution.xy - .5;
    
    positionNormalized += .2*sin(vec2(.002*u_time, -.065*u_time+0.1));  

    // spherical coordinate with radius 1
    vec4 angles = .2 * vec4(positionNormalized.xy, positionNormalized.xy);

    float timeSine = sin(u_time);

    angles *= .5 * vec4(
      .07 * timeSine-2.,
      -.41 * timeSine+.13,
      .19 * timeSine,
      -.21*timeSine
    )
    + 55. * sin(vec4(
      .02 * timeSine -2.,
      -.031 * timeSine+.13,
      .039 * timeSine+.17,
      -.05*timeSine
    ));

    // to cartesian color space
    vec3 outCol = vec3(sin(angles.x) * cos(angles.y), sin(angles.y)*cos(angles.x), cos(angles.y));
    vec3 outCol2 = vec3(sin(angles.z)*cos(angles.w), sin(angles.w)*cos(angles.z), cos(angles.w));

    mat3 palette = 1./255. * mat3(
        255., 55., 41.,
        139., 183., 234.,
        59., 160., 241.
    );

    vec3 o = .2 * (outCol + outCol * palette);
    vec3 o2 = .2 * (outCol2 + outCol2 * palette);

    vec3 finalOut = 
      o * (.22 + .37*sin(.32*u_time)) +
      o2 * (.34 + .26*cos(.123*u_time)) +
      .3 +
      .2 * sin(vec3(-.1 * u_time, -.11 * u_time + .3, -.021*u_time-.2))
      * length(outCol2 - outCol);
    
    finalOut = finalOut * palette;

    finalOut = .9 * finalOut + finalOut.yxx * sin(angles.wxz) * length(outCol2-outCol) * palette;

    // Add some black hole into it
    // finalOut = blackHole(positionNormalized, finalOut, .5);

    gl_FragColor = vec4(finalOut, 1.0);
}
