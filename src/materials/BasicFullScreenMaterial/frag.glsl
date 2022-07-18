precision lowp float;

uniform sampler2D uTileTex;
uniform sampler2D uMapTex;
uniform vec2 uMapSize;

varying vec2 vUv;

void main() {
  #ifdef USE_TWO_LAYERS
  vec4 sampleMapTop = texture2D(uMapTex, vUv);
  vec2 uvTileTop = floor(sampleMapTop.zw * RESOLUTION) / RESOLUTION + fract(vUv * uMapSize) / RESOLUTION;
  vec4 sampleTileTop = texture2D(uTileTex, uvTileTop);
  gl_FragColor = sampleTileTop;
  if(sampleTileTop.a<0.5) {
  #endif
    vec4 sampleMapBottom = texture2D(uMapTex, vUv+vec2(0.0, 1.0/uMapSize.y));
    vec2 uvTileBottom = floor(sampleMapBottom.xy * RESOLUTION) / RESOLUTION + fract(vUv * uMapSize) / RESOLUTION;
    vec4 sampleTileBottom = texture2D(uTileTex, uvTileBottom);
    gl_FragColor = sampleTileBottom;
  #ifdef USE_TWO_LAYERS
  }
  #endif
}
