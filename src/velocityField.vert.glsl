uniform sampler2D uPositionsTexture;
varying vec2 vUv;
void main() {
    vec3 pos = texture2D(uPositionsTexture, position.xy).xyz;
    vec3 uvw = pos * 0.5 + 0.5;
    float z = floor(uvw.z * 64.0);
    float zy = floor(z / 8.0);
    float zx = fract(z/ 8.0) * 8.0;
    vec2 uv = (uvw.xy + vec2(zx, zy)) / 8.0;
    
    vUv = uv;
    // vUv = uv;
	// gl_Position = vec4(position.xy, 0.0, 1.0);
	// gl_Position = vec4(pos.xy * 0.98, 0.0, 1.0);
	gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
	// gl_Position = vec4(uv, 0.0, 1.0);
    gl_PointSize = 1.0;
}