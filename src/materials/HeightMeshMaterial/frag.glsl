precision highp float;
uniform vec4 color;
varying float vHeight;


void main() {
	gl_FragColor = color;
	gl_FragColor.HEIGHT_CHANNEL = vHeight * 0.5;
}