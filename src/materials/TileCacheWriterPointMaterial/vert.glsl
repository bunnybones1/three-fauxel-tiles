precision highp float;

uniform vec2 uViewRes;
#ifdef USE_XYZ
    attribute vec3 xyz;
    #define COORD xyz.xy
    uniform float zSlideScale;
    varying float vZ;
#else 
    attribute vec2 xy;
    #define COORD xy
#endif
uniform float z;
attribute float id;

varying vec2 vUv;

#ifdef DISCARD_BY_MAP_DEPTH_CACHE 
    varying vec2 vInverseUv;
    uniform vec4 uMapDepthCacheUvST;
#endif

void main() {
    gl_Position = vec4(((COORD + 0.5) * PIXELS_PER_TILE) / uViewRes * 2.0 - 1.0, z, 1.0);
    #ifdef DEPTH_SORT_BY_Y 
        gl_Position.z += COORD.y * 0.05;
    #endif
    #ifdef USE_XYZ
        float z = xyz.z * PIXELS_PER_TILE / uViewRes.y * 2.0 * zSlideScale;
        gl_Position.y += z;
        gl_Position.z -= z;
        vZ = xyz.z * 0.5;
    #endif
    gl_PointSize = PIXELS_PER_TILE;
    vUv = vec2(mod(id, TILES_PER_CACHE_EDGE) / TILES_PER_CACHE_EDGE, floor(id / TILES_PER_CACHE_EDGE) / TILES_PER_CACHE_EDGE);
    #ifdef DISCARD_BY_MAP_DEPTH_CACHE 
        vInverseUv = gl_Position.xy * 0.5 - 0.5 - (vec2(PIXELS_PER_TILE * 0.5) / uViewRes);
        vInverseUv = vInverseUv * uMapDepthCacheUvST.xy + uMapDepthCacheUvST.zw;
    #endif
}