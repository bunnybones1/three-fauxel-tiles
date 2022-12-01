precision highp float;

uniform vec2 uViewRes;
attribute vec4 xyzSize;
attribute vec3 color;
uniform float z;
varying vec2 vSizeHeight;
varying vec3 vColor;

varying vec2 vInverseUv;

void main() {
  gl_Position = vec4(((xyzSize.xy + 0.5 + vec2(0.0, xyzSize.z)) * PIXELS_PER_TILE) / uViewRes * 2.0 - 1.0, z, 1.0);
  gl_PointSize = xyzSize.w;
  vInverseUv = gl_Position.xy * 0.5 - 0.5 - (vec2(xyzSize.w * 0.5) / uViewRes);
  vSizeHeight = xyzSize.wz;
  vColor = color;
}