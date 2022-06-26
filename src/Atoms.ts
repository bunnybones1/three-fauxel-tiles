import {
  BufferAttribute,
  BufferGeometry,
  NearestFilter,
  Points,
  ShaderMaterial,
  Sphere,
  TextureLoader,
  Uniform,
  WebGLRenderer
} from 'three'

import fragmentShader from './point.frag.glsl'
import vertexShader from './point.vert.glsl'
import MotionKit from './MotionKit'
import VelocityFieldKit from './VelocityFieldKit'
import DensityFieldKit from './DensityFieldKit'
import { getTempTexture } from '../test/utils/threeUtils'

export default class Atoms {
  visuals: Points
  motionKit: MotionKit
  velocityKit: VelocityFieldKit
  densityKit: DensityFieldKit
  constructor(edgeSize = 8) {
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
      16,
      geo,
      motionKit.outputTextureUniform
    )
    motionKit.linkInput('uVelocitiesTexture', velocityKit.outputTextureUniform)

    const densityKit = new DensityFieldKit(
      16,
      geo,
      motionKit.outputTextureUniform
    )
    motionKit.linkInput('uDensitiesTexture', densityKit.outputTextureUniform)

    const pointsMat = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uMap: motionKit.outputTextureUniform,
        uParticleTexture: new Uniform(getTempTexture())
      },
      // blending: AdditiveBlending,
      depthWrite: true,
      depthTest: true
    })
    const loader = new TextureLoader()
    loader.load('sphere-sprite.png', (t)=> {
      t.flipY = false
      t.magFilter = NearestFilter
      t.minFilter = NearestFilter
      pointsMat.uniforms.uParticleTexture = new Uniform(t)
    })
    const visuals = new Points(geo, pointsMat)

    // visuals.add(velocityKit.getTestPlane())
    visuals.add(densityKit.getTestPlane())

    this.motionKit = motionKit
    this.velocityKit = velocityKit
    this.densityKit = densityKit
    this.visuals = visuals
  }
  update(renderer: WebGLRenderer, dt: number) {
    this.motionKit.render(renderer, dt)
    this.velocityKit.render(renderer, dt)
    this.densityKit.render(renderer, dt)
    // this.visuals.rotation.y += dt * 0.2
    //
  }
}
