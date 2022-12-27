precision lowp float;

attribute vec4 xyzFrame;
attribute float id;
uniform float uAspectRatio;
uniform vec3 uTransform;

varying vec2 vFrame;
varying float vId;

void main() {
    vec2 xy = ((xyzFrame.xy / vec2(uAspectRatio, 1.0)) / uTransform.z + uTransform.xy);
    vFrame = vec2(mod(xyzFrame.w, 8.0), floor(xyzFrame.w / 8.0));
    vId = id;
    float z = xyzFrame.z;
    gl_Position = vec4(xy.x, xy.y, z, 1.0);
    gl_PointSize = 16.0/ uTransform.z;
}