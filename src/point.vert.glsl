uniform sampler2D uMap;
varying vec3 vColor;
void main() {
    vec4 pos = texture2D(uMap, position.xy);
    vec4 mvPosition = modelViewMatrix * vec4(pos.xzy, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // density = 1.0 - pow(1.0-density, 3.0);
    vColor = position.xyz;

    gl_PointSize =  32.0 / -mvPosition.z;
}