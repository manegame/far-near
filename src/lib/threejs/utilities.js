import { Matrix4 } from "three" 

export function getSizes () {
  return {
    w: window.innerWidth * window.devicePixelRatio,
    h: window.innerHeight * window.devicePixelRatio
  }
}

export function createShearMatrix (direction, factor = 1) {
  // shear matrix
  // In three dimensions six possible shearing directions exist:

  // o shear X by Y
  // o shear X by Z
  // o shear Y by X
  // o shear Y by Z
  // o shear Z by X
  // o shear Z by Y
  //        | 1    Syx  Szx  0 |
  //        |                  |
  //        | Sxy  1    Szy  0 |
  //    M = |                  |
  //        | Sxz  Syz  1    0 |
  //        |                  |
  //        | 0    0    0    1 |
  //        |                  |
  // 
  // Set the right matrices based on input, the result will be one or 0,
  // Using the Unary Operator !
  // https://developer.mozilla.org/en-US/docs/web/javascript/reference/operators#.2B_%28Unary_Plus%29
  let Syx = (+ (direction === 'yx') * factor),
      Szx = (+ (direction === 'zx') * factor),
      Sxy = (+ (direction === 'xy') * factor),
      Szy = (+ (direction === 'zy') * factor),
      Sxz = (+ (direction === 'xz') * factor),
      Syz = (+ (direction === 'yz') * factor)

  const matrix = new Matrix4()
  matrix.set(1,   Syx,  Szx,  0,
            Sxy,     1,  Szy,  0,
            Sxz,   Syz,   1,   0,
            0,     0,   0,   1  );

  return matrix
}
