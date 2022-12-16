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
  float texelHeight = texelRoughnessMetalnessHeight.b * 2.0;
  float lightDepth = lightHeight - texelHeight;
  float lightTileSize = lightSize / PIXELS_PER_TILE;
  vec3 virtualPosition = vec3((gl_PointCoord) + vec2(0.0, (texelHeight - lightHeight) / lightSize * PIXELS_PER_TILE), texelHeight);
  vec3 relLightPos = virtualPosition - vec3(0.5, 0.5, lightHeight);
  // relLightPos.z *= 0.25;
  // relLightPos.y += texelHeight;
  // vec3 relLightPos = vec3(gl_PointCoord - 0.5, -lightDepth);
  vec3 lightDir = -relLightPos.rbg;
  lightDir.y *= 0.25;
  lightDir = normalize(lightDir);
  vec4 texelNormals = texture2D(uTextureNormalsMapCache, texelUv);

  float roughness = 2.0 / texelRoughnessMetalnessHeight.r;
  float metalness = texelRoughnessMetalnessHeight.g;
  vec3 surfaceNormal = texelNormals.rgb * 2.0 - 1.0;
  // float dotP = dot(surfaceNormal, lightDir);
  float dotP = dot(surfaceNormal, lightDir) * (1.0 + metalness * 0.4);
  dotP = mix(1.0 - 0.5 * (1.0-dotP), dotP, roughness);
  float distance = max(0.0, 1.0 - length(relLightPos)/(lightTileSize * 0.5));
  float lightStrength = max(0.0, dotP) * distance * distance;


  float floorYOffset = -texelHeight * RELATIVE_TILE_SIZE;
  // texelHeight += RELATIVE_TILE_PIXEL_SIZE;
  float startingCastHeight = (texelHeight + RELATIVE_TILE_PIXEL_SIZE) * 0.5;
  float workingTexelHeight = startingCastHeight;
  float mixShadow = 1.0;
  vec2 flooredUv = texelUv + vec2(0, floorYOffset);
  // vec3 relLightPos2 = vec3(relLightPos.x, relLightPos.z, -relLightPos.y);
  // relLightPos2.y -= lightHeight;
  // relLightPos2.z -= lightHeight;
  // float newHeightBBB = texture2D(uTextureDepthTopDownMapCache, flooredUv).b * 2.0;
  vec2 lightVec2TopDown = vec2(-relLightPos.x, relLightPos.y);
  vec2 lightVec2Diagonal = vec2(-relLightPos.x, relLightPos.y - relLightPos.z / (lightTileSize));
  // vec2 lightVec2TopDown = vec2(relLightPos.x, relLightPos.y - lightHeight);
  // vec2 lightVec2 = vec2(relLightPos.x, relLightPos.z - relLightPos.y);
  #ifdef USE_SHADOWS
    for(float i = 0.0; i < 0.5; i += SHADOW_STEP_SIZE) {
      vec2 lightVec2TopDownStep = lightVec2TopDown * i;
      vec2 lightVec2DiagonalStep = lightVec2Diagonal * i;
      float newTopDownHeight = texture2D(uTextureDepthTopDownMapCache, flooredUv + lightVec2TopDownStep).b;
      float newDiagonalHeight = texture2D(uTextureRoughnessMetalnessHeightMapCache, texelUv + lightVec2DiagonalStep).b;
      workingTexelHeight = startingCastHeight - relLightPos.z * i;

      mixShadow = min(mixShadow, max(step(newTopDownHeight, workingTexelHeight), step(newDiagonalHeight, workingTexelHeight)));
      // mixShadow = min(mixShadow, step(newTopDownHeight, workingTexelHeight));
      // mixShadow = min(mixShadow, step(newDiagonalHeight, workingTexelHeight));
    }
  #endif

  vec3 lightColorHit = vColor * lightStrength * mixShadow;

	gl_FragColor = vec4(mix(lightColorHit, lightColorHit * texelColor.rgb, vec3(metalness)), 1.0);
  float mask = max(0.0, 1.0-length((gl_PointCoord - 0.5) * 2.0));
  float invMask = 1.0 - mask;
  gl_FragColor.rgb *= 1.0 - (invMask * invMask);

  // gl_FragColor = texelNormals;
  // gl_FragColor = vec4(mixShadow, distance, lightDepth, 1.0);
  // gl_FragColor = vec4(lightStrength, lightStrength, lightStrength, 1.0);
  // gl_FragColor = vec4(lightDir * 0.5 + 0.5, 1.0);
  // gl_FragColor = vec4(vec3(virtualPosition.g), 1.0);
  // gl_FragColor = vec4(vec3(1.0) - abs(relLightPos) * 10.0 + 0.5, 1.0);
  // gl_FragColor.g = step(fract(gl_FragColor.g * 10.0), 0.2);
  // gl_FragColor = vec4(vec3(abs(relLightPos.b)), 1.0);
  // gl_FragColor = vec4(0.2, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  // gl_FragColor.rgb = vec3(lightStrength);
  // gl_FragColor.rgb = vec3(newHeightBBB);
  // gl_FragColor.rgb += vec3(mixShadow * 0.5);

  // gl_FragColor.rgb = vec3(texture2D(uTextureDepthTopDownMapCache, flooredUv).b * 2.0);
	// for(float i = 0.0; i < 0.5; i += 1.0/32.0) {
  //   gl_FragColor.rgb = max(gl_FragColor.rgb, vec3(texture2D(uTextureDepthTopDownMapCache, flooredUv + lightVec2TopDown * i * RELATIVE_TILE_SIZE).b * 2.0));
  // }
  
}