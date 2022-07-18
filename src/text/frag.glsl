#ifdef GL_OES_standard_derivatives
  #extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

#ifdef USE_ALPHATEST
uniform float alphaTest;
#endif

uniform sampler2D msdf;
uniform vec2 msdfSize;
//uniform vec3 color;
uniform float opacity;

#ifdef USE_STROKE
uniform float strokeWidth;
uniform float strokeBias;
uniform vec3 strokeColor;
#endif

varying vec2 vUv;
varying vec3 vColor;
varying float vWeight;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

#ifdef USE_SHADOW
const vec2 shadowVector = vec2(-0.00025, 0.0005);
const float shadowSoftness = 0.5;
const float shadowShrink = 0.2;
const float shadowOpacity = 0.5;
#endif

const float contrastMultiplier = 80.0;

void main() {
  vec3 color = vColor;

  vec3 texel = texture2D(msdf, vUv + vec2(0.0, -0.5/512.0)).rgb;
  float unsignedDistance = median(texel.r, texel.g, texel.b);

  float signedDistance = unsignedDistance - (1.0 - 0.5 * vWeight);

  if ( unsignedDistance == 0.0 ) discard;
  float contrast = (abs(dFdx(vUv.x)) + abs(dFdy(vUv.y))) * contrastMultiplier;

  #ifdef USE_STROKE
    float distanceOpacity = signedDistance + (strokeWidth * strokeBias);
    float sigDistSrokeInner = signedDistance - (strokeWidth * (1.0 - strokeBias));
    float colorMix = 1.0 - smoothstep(0.0, 1.0, sigDistSrokeInner / contrast + 0.5);
    vec3 finalColor = mix(color, strokeColor, colorMix);
  #else
    float distanceOpacity = signedDistance;
    vec3 finalColor = color;
  #endif
  
  float alpha = smoothstep(0.0, 1.0, distanceOpacity / contrast + 0.5);
  
  #ifdef USE_SHADOW
    //compute shadows
    //shadow color is the same as stroke color for now
    texel = texture2D(msdf, vUv + shadowVector).rgb;
    unsignedDistance = median(texel.r, texel.g, texel.b);
    float shadow = clamp(((unsignedDistance - shadowShrink) / shadowSoftness + shadowShrink), 0.0, 1.0) * shadowOpacity;
    alpha = max(alpha, shadow);
  #else 
    #ifdef USE_ALPHATEST
      if ( alpha < alphaTest ) discard;
    #endif
  #endif
  gl_FragColor = vec4(finalColor, alpha * opacity);
}