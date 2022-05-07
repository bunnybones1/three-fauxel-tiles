import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Sphere,
  Uniform,
  WebGLRenderer
} from 'three'

import fragmentShader from './point.frag.glsl'
import vertexShader from './point.vert.glsl'
import NoiseKit from './NoiseKit'

export default class Atoms {
  visuals: Points
  noiseKit: NoiseKit
  constructor(edgeSize = 256) {
    const geo = new BufferGeometry()
    const total = edgeSize * edgeSize
    const bufferArr = new Float32Array(total * 3)
    for (let iy = 0; iy < edgeSize; iy++) {
      for (let ix = 0; ix < edgeSize; ix++) {
        const i3 = (ix + iy * edgeSize) * 3
        bufferArr[i3] = (ix + 0.5) / edgeSize
        bufferArr[i3 + 1] = (iy + 0.5) / edgeSize
        bufferArr[i3 + 2] = (i3 * 0.001) % 1
      }
    }
    geo.setAttribute('position', new BufferAttribute(bufferArr, 3))
    geo.boundingSphere = new Sphere(undefined, 1)

    const noiseKit = new NoiseKit(edgeSize)

    const mat2 = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uMap: new Uniform(noiseKit.rt.texture)
      },
      blending: AdditiveBlending,
      depthTest: false
    })
    const visuals = new Points(geo, mat2)

    // visuals.add(noiseKit.getTestPlane())

    this.noiseKit = noiseKit
    this.visuals = visuals
  }
  update(renderer: WebGLRenderer, dt: number) {
    this.noiseKit.render(renderer, dt)
    //
  }
}
