import {
  FloatType,
  LinearEncoding,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget
} from 'three'

export function getBasicRenderTarget(edgeSize: number, depth = false) {
  return new WebGLRenderTarget(edgeSize, edgeSize, {
    format: RGBAFormat,
    type: FloatType,
    magFilter: NearestFilter,
    minFilter: NearestFilter,
    depthBuffer: depth,
    encoding: LinearEncoding
  })
}
