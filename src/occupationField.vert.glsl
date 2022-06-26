uniform sampler2D uPositionsTexture;
uniform float uTimeFract;
varying vec2 vId;
void main() {
    vId = position.xy;
    vec3 pos = texture2D(uPositionsTexture, vId).xyz;
    vec3 uvw = pos * 0.5 + 0.5;
    float z = floor(uvw.z * 16.0);
    float zy = floor(z / 4.0);
    float zx = fract(z/ 4.0) * 4.0;
    vec2 uv = (uvw.xy + vec2(zx, zy)) / 4.0;
    
    // vUv = uv;
	// gl_Position = vec4(position.xy, 0.0, 1.0);
	// gl_Position = vec4(pos.xy * 0.98, 0.0, 1.0);
	gl_Position = vec4(uv * 2.0 - 1.0, fract(uTimeFract + (vId.x * 25.12 + vId.y * 165.3)), 1.0);
	// gl_Position = vec4(uv, 0.0, 1.0);
    gl_PointSize = 1.0;
}