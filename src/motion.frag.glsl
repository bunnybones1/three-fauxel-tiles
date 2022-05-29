uniform sampler2D uVelocitiesTexture;
uniform sampler2D uPositionsTexture;
varying vec3 vColor;
varying vec2 vUv;
void main() {
    vec3 pos = texture2D(uPositionsTexture, vUv).xyz;
    vec3 uvw = pos * 0.5 + 0.5;
    float z = floor(uvw.z * 64.0);
    float zy = floor(z / 8.0);
    float zx = fract(z/ 8.0) * 8.0;
    vec2 uv = (uvw.xy + vec2(zx, zy)) / 8.0;
    vec3 vel = texture2D(uVelocitiesTexture, uv).xyz;
    vec3 newPos = pos + vel * vec3(0.02);
    newPos = mod(newPos + 1.0, 2.0) - 1.0; //wrap around from -1.0 to 1.0
    vec3 normalized = normalize(newPos);
    gl_FragColor = vec4(mix(newPos, normalized, 0.0), 1.0);
}