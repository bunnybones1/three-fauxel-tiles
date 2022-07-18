precision lowp float;

attribute vec3 xyFrame;
attribute float id;
uniform float uAspectRatio;
uniform vec3 uTransform;

varying vec2 vFrame;
varying float vId;

void main() {
    vec2 xy = ((xyFrame.xy / vec2(uAspectRatio, 1.0)) / uTransform.z + uTransform.xy);
    vFrame = vec2(mod(xyFrame.z, 8.0), floor(xyFrame.z / 8.0));
    vId = id;
    gl_Position = vec4(xy.x, xy.y, xy.y, 1.0);
    gl_PointSize = 16.0/ uTransform.z;
}