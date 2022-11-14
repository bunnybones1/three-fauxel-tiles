precision highp float;
uniform vec4 color;
#ifdef USE_VERTEX_COLOR
    varying vec3 vColor;
#endif

void main() {
	gl_FragColor = color;
    #ifdef USE_VERTEX_COLOR
        gl_FragColor.rgb *= vColor;
    #endif
}