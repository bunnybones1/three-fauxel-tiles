precision highp float;

uniform sampler2D fontTexture;
uniform sampler2D layoutTexture;
uniform vec3 color;
uniform vec3 strokeColor;
uniform vec2 fontSizeInChars;

varying vec2 vUv;
varying vec2 vUvCharCols;

void main() {
  // do two overlaid columns at once, by packing them in to XY and ZW
  // this allows us to sample twice to get "crowding" of characters
  vec4 layoutTexel = texture2D(layoutTexture, vec2(vUv.x, 1.0-vUv.y));
  vec2 fontCharIndices = layoutTexel.xz * vec2(255.0001);  //index from 0-255
  vec4 layoutCharUv = fract(vUvCharCols).xyxy;
  layoutCharUv.xz = fract(layoutCharUv.xz - layoutTexel.yw);

  vec2 tA = mod(fontCharIndices, fontSizeInChars.x);
  vec2 tB = vec2(fontSizeInChars.y - 1.0) - floor(fontCharIndices / fontSizeInChars.x);
  vec4 packedAB = vec4(tA.x, tB.x, tA.y, tB.y);
  vec4 fontCharIndexUv = (layoutCharUv + packedAB) / fontSizeInChars.xyxy;
  vec4 texel = texture2D(fontTexture, fontCharIndexUv.xy);
  vec4 texel2 = texture2D(fontTexture, fontCharIndexUv.zw);

  // vec4 final = texel;
  // vec4 final = texel2;
  vec4 final = max(texel, texel2);
  if ( final.a < 0.5 ) discard;

  vec3 finalColor = mix(strokeColor, color, final.r);
  
  gl_FragColor = vec4(finalColor.rgb, 1.0);
}