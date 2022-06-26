uniform sampler2D uVelocitiesTexture;
uniform sampler2D uPositionsTexture;
varying vec2 vUv;
void main() {
    vec3 pos = texture2D(uPositionsTexture, vUv).xyz;
    vec3 vel = texture2D(uVelocitiesTexture, vUv).xyz;
    vec3 newPos = pos + vel;
    newPos = clamp(mod(newPos + 1.0, 2.0) - 1.0, -1.0, 1.0); //wrap around from -1.0 to 1.0
    gl_FragColor = vec4(newPos, 1.0);
}