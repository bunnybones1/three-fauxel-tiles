precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 smoothOffset;
attribute vec2 position;
attribute vec2 uv;
attribute vec2 tileIndex;

attribute float color;
varying vec3 vColor;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position + smoothOffset, 0.0, 1.0 );
    vUv = uv + tileIndex;
    vColor = vec3(color);
}