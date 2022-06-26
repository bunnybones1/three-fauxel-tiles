uniform sampler2D uVelocitiesTexture;
varying vec2 vUv;
void main() {
    vec3 vel = texture2D(uVelocitiesTexture, vUv).xyz;
    gl_FragColor = vec4(vel * 0.99, 0.1);
    // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}