precision highp float;

uniform sampler2D uTextureColor;
uniform sampler2D uTextureNormals;
uniform sampler2D uTextureEmissive;
uniform sampler2D uTextureRoughnessMetalnessHeight;
uniform sampler2D uTextureTopDownHeight;
uniform sampler2D uTexturePointLights;
uniform vec3 uColorLightAmbient;
uniform vec3 uColorDarkAmbient;
uniform vec3 uColorSun;
uniform vec3 uSunDirection;
uniform vec3 uSunDirectionForWater;
uniform vec3 uSunShadowDirection;
uniform sampler2D uTextureFog;
uniform vec2 uFogScroll;
varying vec2 vUv;

#ifdef USE_WATER
  uniform float uWaterHeight;
  varying vec2 vUvWater;
#endif

void main() {
  // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  vec4 texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeight, vUv);
  #ifdef USE_WATER
    vec2 waterUvs = vUvWater * 2.0 + vec2(0.0, uWaterHeight * -0.125);
    vec4 waterData = (texture2D(uTextureFog, waterUvs + uFogScroll) + texture2D(uTextureFog, waterUvs - uFogScroll) - vec4(1.0));
    float originalHeight = texelRoughnessMetalnessHeight.b * 2.0;
    float waterDepth = max(0.0, uWaterHeight - originalHeight);
    vec2 uv = vUv + (waterData.rg) * waterDepth * 0.03;
    texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeight, uv);
    float distortedWaterDepth = max(0.0, uWaterHeight - texelRoughnessMetalnessHeight.b * 2.0);
    float waterMask = smoothstep(uWaterHeight, uWaterHeight - 0.1, originalHeight) * mix(0.5, 1.0, distortedWaterDepth);
  #else 
    vec2 uv = vUv;  
    float originalHeight = texelRoughnessMetalnessHeight.b * 2.0;
  #endif

  vec4 texelColor = texture2D(uTextureColor, uv);
  #ifdef USE_WATER
    texelColor.rgb *= mix(vec3(1.0), vec3(-0.2, 0.3, 0.8), waterMask); //water color blue
  #endif
  vec4 texelNormals = texture2D(uTextureNormals, uv);
  vec4 texelEmissive = texture2D(uTextureEmissive, uv);

  // vec4 texelTopDownHeight = texture2D(uTextureTopDownHeight, uv);
  float roughness = 2.0 / texelRoughnessMetalnessHeight.r;
  float metalness = texelRoughnessMetalnessHeight.g;
  vec3 surfaceNormal = texelNormals.rgb * 2.0 - 1.0;
  float dotP = dot(surfaceNormal, uSunDirection) * (1.0 + metalness * 0.4);
  #ifdef USE_WATER
    float dotPWater = dot(waterData.rgb, uSunDirectionForWater);
    float waterRoughness = 2.0 / 0.3;
    dotPWater = mix(1.0 - 0.5 * (1.0-dotPWater), dotPWater, waterRoughness);
    float sunLightWaterStrength = pow(max(0.0, dotPWater), waterRoughness) * 1.75;
  #endif


  dotP = mix(1.0 - 0.5 * (1.0-dotP), dotP, roughness);
  // float invRMHb = 1.0 - texelRoughnessMetalnessHeight.b * 2.0;
  // float texelHeight = 1.0 - invRMHb * invRMHb;
  float texelHeight = texelRoughnessMetalnessHeight.b * 2.0;
  float ambientLight = texelNormals.g + texelHeight * 0.5;
  float sunLightStrength = pow(max(0.0, dotP), roughness);

  float floorYOffset = -texelHeight * RELATIVE_TILE_SIZE;
  texelHeight += RELATIVE_TILE_PIXEL_SIZE;
  float mixShadow = 1.0;
  vec2 flooredUv = uv + vec2(0, floorYOffset);
	for(float i = RELATIVE_PIXEL_SIZE; i < RELATIVE_TILE_SIZE * 2.0; i += RELATIVE_PIXEL_SIZE) {
    float newHeight = texture2D(uTextureTopDownHeight, flooredUv - (vec2(i) * uSunShadowDirection.xz)).b * 2.0;
    float newHeight2 = texture2D(uTextureRoughnessMetalnessHeight, uv + (vec2(0.0, i) + vec2(i) * -uSunShadowDirection.xz)).b * 2.0;
    mixShadow = min(mixShadow, max(step(newHeight, texelHeight), step(newHeight2, texelHeight)));
    // mixShadow = min(mixShadow, step(newHeight2, texelHeight));
    texelHeight += RELATIVE_TILE_PIXEL_SIZE;
	}
  #ifdef USE_MIST
    float mistMask = max(0.0, 0.3 - texelRoughnessMetalnessHeight.b * 2.0) * max(texture2D(uTextureFog, uv + uFogScroll).b, texture2D(uTextureFog, uv + uFogScroll * 2.0).b);
    sunLightStrength *= mixShadow * (1.0-mistMask);
  #else
    sunLightStrength *= mixShadow;
  #endif
	// gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec3 sunLightColorHit = uColorSun * sunLightStrength;
  #ifdef USE_WATER
    sunLightColorHit *= mix(1.0, 0.5, waterMask);
  #endif
	gl_FragColor = vec4( texelColor.rgb * mix(uColorDarkAmbient, uColorLightAmbient, ambientLight), 1.0);

	gl_FragColor.rgb += mix(sunLightColorHit, sunLightColorHit * texelColor.rgb, vec3(metalness));
  gl_FragColor.rgb += texelEmissive.rgb;
  gl_FragColor.rgb = min(vec3(1.0), gl_FragColor.rgb);

  // gl_FragColor.rgb = sunLightColorHit * texelColor.rgb;
  #ifdef USE_WATER
    gl_FragColor.rgb += vec3(sunLightWaterStrength) * waterMask * uColorSun; //sun on water highlights
  #endif


  vec4 texelPointLights = texture2D(uTexturePointLights, uv);
  gl_FragColor.rgb += texelPointLights.rgb;

  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5454));

  //outlines
  vec2 pixelH = vec2(RELATIVE_PIXEL_SIZE, 0.0);
  vec2 pixelV = vec2(0.0, RELATIVE_PIXEL_SIZE);
  uv = vUv;
  float heightL = texture2D(uTextureRoughnessMetalnessHeight, uv - pixelH).b;
  float heightR = texture2D(uTextureRoughnessMetalnessHeight, uv + pixelH).b;
  float heightU = texture2D(uTextureRoughnessMetalnessHeight, uv + pixelV).b;
  float heightD = texture2D(uTextureRoughnessMetalnessHeight, uv - pixelV).b;
  float highestNeighbour = max(max(heightL, heightR), max(heightU, heightD)) * 2.0;
  float outline = smoothstep((highestNeighbour - 0.2),(highestNeighbour - 0.05), originalHeight);

  #ifdef USE_MIST
    gl_FragColor.rgb += (vec3(1.0) - gl_FragColor.rgb) * mistMask * vec3(0.5);
  #endif
  #ifdef USE_WATER
    gl_FragColor.rgb *= mix(vec3(0.4, 0.3, 0.1), vec3(1.0), vec3(mix(1.0, outline, smoothstep(waterDepth-0.1, waterDepth, highestNeighbour)))); //outline
  #else
    gl_FragColor.rgb *= mix(vec3(0.4, 0.3, 0.1), vec3(1.0), outline); //outline
  #endif
  // gl_FragColor.rgb = vec3(texelColor.a);
  // gl_FragColor.rgb = vec3(sin(floorYOffset * 1000.0) * 0.5 + 0.5);
	// gl_FragColor = texelColor * texelNormals;
  // gl_FragColor.rgb = vec3(outline);
  // gl_FragColor = texelPointLights;
  // gl_FragColor = texelEmissive;
  // gl_FragColor = texelNormals;
}