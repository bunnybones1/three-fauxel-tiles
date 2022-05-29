uniform sampler2D uFieldVelocitiesTexture;
varying vec2 vUv;

const float xyStep = 1.0/63.7;
const float zStep = 1.0/32.0;

vec2 offset(vec3 pos, vec3 offset) {
    pos += offset;
    pos = mod(pos + 1.0, 2.0) - 1.0; //wrap around from -1.0 to 1.0

    vec3 uvw2 = pos * 0.5 + 0.5;
    float z2 = floor(uvw2.z * 64.0);
    float zy2 = floor(z2 / 8.0);
    float zx2 = fract(z2/ 8.0) * 8.0;
    vec2 uv = (uvw2.xy + vec2(zx2, zy2)) / 8.0;
    return uv;
}

void main() {

    vec2 xy = fract(vUv * 8.0);
    vec2 zv = vUv - xy / 8.0;
    float z = (zv.y * 8.0 + zv.x) / 8.0;
    vec3 uvw = vec3(xy, z);
    vec3 pos = uvw * 2.0 - 1.0;

    vec2 uv1 = offset(pos, vec3(0.0, 0.0, zStep));
    vec2 uv2 = offset(pos, vec3(0.0, 0.0, -zStep));
    vec2 uv3 = offset(pos, vec3(0.0, xyStep, 0.0));
    vec2 uv4 = offset(pos, vec3(0.0, -xyStep, 0.0));
    vec2 uv5 = offset(pos, vec3(xyStep, 0.0, 0.0));
    vec2 uv6 = offset(pos, vec3(-xyStep, 0.0, 0.0));



    // gl_FragColor = vec4(pos, 1.0);
    // float zy = floor(z / 8.0);
    // float zx = fract(z/ 8.0) * 8.0;
    // vec2  vec2(zx, zy) = uv * 8.0 - uvw.xy;
    // vec2 uv = (uvw.xy + vec2(zx, zy)) / 8.0;

    // gl_FragColor = texture2D(uFieldVelocitiesTexture, vUv);

    vec3 texel = texture2D(uFieldVelocitiesTexture, vUv).xyz * 44.0;
    
    texel += texture2D(uFieldVelocitiesTexture, uv1).xyz;
    texel += texture2D(uFieldVelocitiesTexture, uv2).xyz;
    texel += texture2D(uFieldVelocitiesTexture, uv3).xyz;
    texel += texture2D(uFieldVelocitiesTexture, uv4).xyz;
    texel += texture2D(uFieldVelocitiesTexture, uv5).xyz;
    texel += texture2D(uFieldVelocitiesTexture, uv6).xyz;
    gl_FragColor = vec4(texel * 0.02, 1.0);
}