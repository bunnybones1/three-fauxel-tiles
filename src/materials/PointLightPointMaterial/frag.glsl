precision highp float;


uniform sampler2D uTextureColorsMapCache;
uniform sampler2D uTextureNormalsMapCache;
uniform sampler2D uTextureDepthTopDownMapCache;
uniform sampler2D uTextureRoughnessMetalnessHeightMapCache;
varying vec2 vInverseUv;
varying vec2 vSizeHeight;
varying vec3 vColor;

void main() {
  // vec2 uvTile = floor(uTileMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;
  vec2 flippedCoord = gl_PointCoord;
  float lightSize = vSizeHeight.x;
  float lightHeight = vSizeHeight.y;
  flippedCoord.y = 1.0 - flippedCoord.y;
  vec2 texelUv = vInverseUv + PIXEL_VIEW_RATIO * lightSize * flippedCoord;
  vec4 texelColor = texture2D(uTextureColorsMapCache, texelUv);
  vec4 texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeightMapCache, texelUv);
  float lightDepth = lightHeight - texelRoughnessMetalnessHeight.b;
  vec3 relLightPos = vec3((gl_PointCoord - 0.5) * lightSize / PIXELS_PER_TILE, -lightDepth);
  relLightPos.y += texelRoughnessMetalnessHeight.b;
  // vec3 relLightPos = vec3(gl_PointCoord - 0.5, -lightDepth);
  vec3 lightDir = normalize(-relLightPos).rbg;
  vec4 texelNormals = texture2D(uTextureNormalsMapCache, texelUv);

  float roughness = 2.0 / texelRoughnessMetalnessHeight.r;
  float metalness = texelRoughnessMetalnessHeight.g;
  vec3 surfaceNormal = texelNormals.rgb * 2.0 - 1.0;
  // float dotP = dot(surfaceNormal, lightDir);
  float dotP = dot(surfaceNormal, lightDir) * (1.0 + metalness * 0.4);
  dotP = mix(1.0 - 0.5 * (1.0-dotP), dotP, roughness);
  float distance = max(0.0, 1.0 - length(relLightPos)/(lightSize / PIXELS_PER_TILE * 0.5));
  float lightStrength = max(0.0, dotP) * distance * distance;


  float texelHeight = texelRoughnessMetalnessHeight.b;
  float floorYOffset = -texelHeight * RELATIVE_TILE_SIZE;
  texelHeight += RELATIVE_PIXEL_SIZE;
  float mixShadow = 1.0;
  vec2 flooredUv = texelUv + vec2(0, floorYOffset);
  vec3 relLightPos2 = vec3(relLightPos.x, relLightPos.z, -relLightPos.y);
	for(float i = RELATIVE_PIXEL_SIZE; i < RELATIVE_TILE_SIZE; i += RELATIVE_PIXEL_SIZE) {
    float newHeight = texture2D(uTextureDepthTopDownMapCache, flooredUv - (vec2(i) * relLightPos2.xz)).b;
    float newHeight2 = texture2D(uTextureRoughnessMetalnessHeightMapCache, texelUv + (vec2(0.0, i) + vec2(i) * -relLightPos2.xz)).b;
    mixShadow = min(mixShadow, max(step(newHeight, texelHeight), step(newHeight2, texelHeight)));
    // mixShadow = min(mixShadow, step(newHeight2, texelHeight));
    texelHeight += RELATIVE_TILE_PIXEL_SIZE;
	}

  vec3 lightColorHit = vColor * lightStrength * mixShadow;

	gl_FragColor = vec4(mix(lightColorHit, lightColorHit * texelColor.rgb, vec3(metalness)), 1.0);

  // gl_FragColor = texelNormals;
  // gl_FragColor = vec4(lightStrength, lightStrength, lightStrength, 1.0);
  // gl_FragColor = vec4(lightDir * 0.5 + 0.5, 1.0);
  // gl_FragColor = vec4(0.2, 0.0, 0.0, 1.0);
}