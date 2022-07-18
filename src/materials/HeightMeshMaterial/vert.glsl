precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
varying float vHeight;

void main() {
    vec4 pos = vec4( position, 1.0 );
    vec4 mPosition = modelMatrix * pos;
    vec4 mvPosition = modelViewMatrix * pos;
    gl_Position = projectionMatrix * mvPosition;
    vHeight = mPosition.y / 32.0;
}