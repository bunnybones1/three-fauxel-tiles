import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Sphere,
  WebGLRenderer
} from 'three'

import fragmentShader from './point.frag.glsl'
import vertexShader from './point.vert.glsl'
import MotionKit from './MotionKit'
import VelocityFieldKit from './VelocityFieldKit'

export default class Atoms {
  visuals: Points
  motionKit: MotionKit
  velocityKit: VelocityFieldKit
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

    const motionKit = new MotionKit(edgeSize, geo)
    const velocityKit = new VelocityFieldKit(
      64,
      geo,
      motionKit.outputTextureUniform
    )
    motionKit.linkInput('uVelocitiesTexture', velocityKit.outputTextureUniform)

    const pointsMat = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uMap: motionKit.outputTextureUniform
      },
      blending: AdditiveBlending,
      depthTest: false
    })
    const visuals = new Points(geo, pointsMat)

    // visuals.add(velocityKit.getTestPlane())

    this.motionKit = motionKit
    this.velocityKit = velocityKit
    this.visuals = visuals
  }
  update(renderer: WebGLRenderer, dt: number) {
    this.motionKit.render(renderer, dt)
    this.velocityKit.render(renderer, dt)
    this.visuals.rotation.y += dt * 0.2
    //
  }
}
