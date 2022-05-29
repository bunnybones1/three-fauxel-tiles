uniform sampler2D uMap;
varying vec3 vColor;
void main() {
    vec4 pos = texture2D(uMap, position.xy);
    vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float density = 1.0-clamp(0.0, 1.0, abs(mvPosition.z + 0.15) * 2.0);
    // density = 1.0 - pow(1.0-density, 3.0);
    vColor = position.xyz * density * density;

    gl_PointSize =  min(32.0, 2.0 / density / -mvPosition.z);
}