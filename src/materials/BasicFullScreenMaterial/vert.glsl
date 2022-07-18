precision lowp float;

attribute vec3 position;
uniform float uAspectRatio;
uniform vec3 uTransform;
varying vec2 vUv;

void main() {
    gl_Position = vec4(position, 1.0);
    vUv = (position.xy - uTransform.xy) * vec2(uAspectRatio, 1.0) * uTransform.z;
}