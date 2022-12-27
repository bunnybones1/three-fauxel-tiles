precision highp float;

uniform vec3 uColor;
uniform sampler2D uTileTex;

varying vec2 vUv;

#ifdef DISCARD_BY_MAP_DEPTH_CACHE
  #ifdef ALTERNATE_DEPTH_TILE
    uniform sampler2D uAlternateDepthTileTex;
  #endif
  uniform sampler2D uMapDepthCacheTexture;
  varying vec2 vInverseUv;
#endif

#ifdef USE_XYZ
  varying float vZ;
  uniform float zColorScale;
#endif 


void main() {
  // vec2 uvTile = floor(uTileMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;
  vec2 flippedCoord = gl_PointCoord;
  flippedCoord.y = 1.0 - flippedCoord.y;
  vec2 uv = vUv + flippedCoord / TILES_PER_CACHE_EDGE;
  #ifdef DISCARD_BY_MAP_DEPTH_CACHE
    #ifdef ALTERNATE_DEPTH_TILE
      vec4 depthTileSample = texture2D(uAlternateDepthTileTex, uv);
      if(depthTileSample.a < 0.1) {
        discard;
      }
    #endif
    vec4 bgTexel = texture2D(uMapDepthCacheTexture, vInverseUv + TILE_VIEW_RATIO * flippedCoord);
    #ifdef USE_XYZ
      depthTileSample.b += vZ;
    #endif
    if(depthTileSample.b < bgTexel.b) {
      discard;
    }
  #endif

  vec4 tileTexel = texture2D(uTileTex, uv);
  if(tileTexel.a < 0.1) {
    discard;
  }
  #ifdef USE_XYZ
    tileTexel.b += vZ * zColorScale;
  #endif
  
  gl_FragColor = tileTexel;
}