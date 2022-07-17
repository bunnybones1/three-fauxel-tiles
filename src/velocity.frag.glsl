uniform sampler2D uPositionsTexture;
uniform sampler2D uVelocitiesTexture;
uniform sampler2D uFieldVelocitiesTexture;
uniform sampler2D uOccupationTexture;
uniform sampler2D uDensityTexture;
varying vec2 vUv;
void main() {
    vec3 pos = texture2D(uPositionsTexture, vUv).xyz;
    vec3 vel = texture2D(uVelocitiesTexture, vUv).xyz;
    vec3 uvw = pos * 0.5 + 0.5;
    float z = floor(uvw.z * 16.0);
    float zy = floor(z / 4.0);
    float zx = fract(z / 4.0) * 4.0;
    vec2 uv = (uvw.xy + vec2(zx, zy)) / 4.0;
    // vec3 vel = vec3(0.0);
    vec3 fieldVel = texture2D(uFieldVelocitiesTexture, uv).xyz;
    fieldVel += vec3(0.0, 0.0, -0.025); //gravity
    vec2 occupyingId = texture2D(uOccupationTexture, uv).xy;
    if(occupyingId.x != 0.0 && occupyingId.y != 0.0 && abs(occupyingId.x - vUv.x) > 0.005 && abs(occupyingId.y - vUv.y) > 0.005) {
        vec3 pos2 = texture2D(uPositionsTexture, occupyingId).xyz;
        vec3 vel2 = texture2D(uVelocitiesTexture, occupyingId).xyz;
        fieldVel += normalize(pos - pos2) / 32.0;
        float density = texture2D(uPositionsTexture, uv).x - 0.1;
        vec3 rand = normalize(fract(abs(pos) * 245.67) - 0.5);
        fieldVel += rand * density * 0.25;

        float speed = length(fieldVel);
        vec3 dir = normalize(fieldVel);
        float newSpeed = min(0.1, speed);
        fieldVel = dir * newSpeed;
        vel += (vel2 - vel) * 0.7;
        // fieldVel *= -0.9;
    } else if(pos.z < -0.5) {
        vel *= -0.9;
        vel.z += 0.005;
    }
    vec3 newVel = mix(vel, fieldVel, 0.04);
    // vec3 newVel = vel * 0.9;
    // newVel = clamp(mod(newVel + 1.0, 2.0) - 1.0, -1.0, 1.0); //wrap around from -1.0 to 1.0
    gl_FragColor = vec4(newVel, 1.0);
}