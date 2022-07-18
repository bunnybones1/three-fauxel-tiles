precision highp float;

uniform vec4 uUvST;
#ifndef CLIPSPACE_MODE
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
#endif
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
    #ifdef CLIPSPACE_MODE
        gl_Position = vec4( position, 1.0 );
    #else
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    #endif
    vUv = uv * uUvST.xy + uUvST.zw;
}