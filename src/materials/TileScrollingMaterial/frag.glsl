precision lowp float;

uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec4 sampleMap = texture2D(uTexture, vUv);
  gl_FragColor = sampleMap;
}