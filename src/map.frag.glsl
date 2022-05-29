uniform sampler2D uMap;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D(uMap, vUv);
    gl_FragColor.rgb = gl_FragColor.rgb * 0.5 + 0.5;
}