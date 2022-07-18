precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 uModelNormalMatrix;
// uniform mat3 normalMatrix;
attribute vec3 normal;
attribute vec3 position;
varying vec4 vColor;

void main() {
    vec4 pos = vec4( position, 1.0 );
    vec3 mNormal = normalize(uModelNormalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * pos;
    gl_Position = projectionMatrix * mvPosition;
    vColor = vec4(mNormal * 0.5 + 0.5, 1.0);
}