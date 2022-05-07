uniform sampler2D uMap;
varying vec3 vColor;
void main() {
    vec4 pos = texture2D(uMap, position.xy);
    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz * 2.0 - 1.0, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vColor = position.xyz;

    gl_PointSize = 4.0 / -mvPosition.z;
}