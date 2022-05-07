uniform vec2 alignment;
#ifdef USE_SCREENSPACE
  uniform float prescale;
  uniform vec4 clipSpacePosition;
  uniform vec2 pixelSizeInClipSpace;
#else
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
#endif

attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
varying vec2 vUvCharCols;
uniform vec2 layoutSizeInChars;

void main() {
  vUv = uv;
  vUvCharCols = uv * layoutSizeInChars;

  #ifdef USE_SCREENSPACE
    vec2 finalOffset = (position.xy - alignment) * pixelSizeInClipSpace * prescale * layoutSizeInChars;
    #ifdef CONSTANT_SIZE_ON_SCREEN
     finalOffset *= clipSpacePosition.w;
    #endif
    gl_Position = clipSpacePosition;
    gl_Position.xy += finalOffset;
  #else
    vec3 pos = position;
    pos.xy -= alignment;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  #endif
}