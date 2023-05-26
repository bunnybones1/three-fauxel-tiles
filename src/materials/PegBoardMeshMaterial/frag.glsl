precision highp float;
uniform vec4 color;
uniform sampler2D texture;
varying vec3 vColor;
varying vec2 vUv;

void main() {
    vec4 texel = texture2D(texture, vUv);
    if(texel.a < 0.5) {
        discard;
    }
	gl_FragColor = color;
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, texel.rgb, texel.a);
    gl_FragColor.rgb = texel.rgb;
    gl_FragColor.rgb *= vColor;
}