precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;

#ifdef USE_VERTEX_COLOR
    attribute vec3 color;
    varying vec3 vColor;
#endif

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
 
    #ifdef USE_VERTEX_COLOR
        vColor = color;
    #endif
}