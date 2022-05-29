uniform sampler2D uFieldVelocitiesTexture;
varying vec2 vUv;
void main() {

    // vec3 uvw = pos * 0.5 + 0.5;
    // float z = floor(uvw.z * 64.0);
    // float zy = floor(z / 8.0);
    // float zx = fract(z/ 8.0) * 8.0;
    // vec2 uv = (uvw.xy + vec2(zx, zy)) / 8.0;

    gl_FragColor = texture2D(uFieldVelocitiesTexture, vUv);

    // vec3 texel = texture2D(uFieldVelocitiesTexture, vUv).xyz * 46.0;
    
    // texel += texture2D(uFieldVelocitiesTexture, vUv + vec2(0.0, 0.002)).xyz;
    // texel += texture2D(uFieldVelocitiesTexture, vUv + vec2(0.002, 0.0)).xyz;
    // texel += texture2D(uFieldVelocitiesTexture, vUv + vec2(-0.002, 0.0)).xyz;
    // texel += texture2D(uFieldVelocitiesTexture, vUv + vec2(0.0, -0.002)).xyz;
    // gl_FragColor = vec4(texel * 0.02, 1.0);
}