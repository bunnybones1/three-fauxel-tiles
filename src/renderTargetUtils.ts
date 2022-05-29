import {
  FloatType,
  LinearEncoding,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget
} from 'three'

export function getBasicRenderTarget(edgeSize: number) {
  return new WebGLRenderTarget(edgeSize, edgeSize, {
    format: RGBAFormat,
    type: FloatType,
    magFilter: NearestFilter,
    minFilter: NearestFilter,
    depthBuffer: false,
    encoding: LinearEncoding
  })
}
