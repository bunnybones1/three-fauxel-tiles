uniform sampler2D uParticleTexture;
varying vec3 vColor;
void main() {
	vec4 texel = texture2D(uParticleTexture, gl_PointCoord);
	if(texel.a < 0.5) {
		discard;
	}
	// gl_FragColor = vec4(vColor, 1.0) * texel;
	gl_FragColor = texel;
}