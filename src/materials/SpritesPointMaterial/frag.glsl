precision lowp float;

uniform sampler2D uSpriteTex;

#ifdef USE_PALETTE
  uniform sampler2D uPaletteTex;
#endif

varying vec2 vFrame;
varying float vId;

void main() {
  vec4 sampleMap = texture2D(uSpriteTex, (gl_PointCoord + vFrame) / vec2(8.0));
  if(sampleMap.w < 0.5) {
    discard;
  }
  // vec2 uvTile = floor(sampleMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;
  // vec3 sampleTile = texture2D(uTileTex, uvTile).rgb;
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor = sampleMap;

  #ifdef USE_PALETTE
    gl_FragColor = texture2D(uPaletteTex, vec2(sampleMap.b, vId));
  #endif
}