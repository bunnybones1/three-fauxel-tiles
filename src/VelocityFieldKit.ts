import {
  AdditiveBlending,
  BufferGeometry,
  Mesh,
  Points,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import fragmentShader from './velocityField.frag.glsl'
import vertexShader from './velocityField.vert.glsl'
import fadeFragmentShader from './fade.frag.glsl'
import fullClipVertexShader from './fullclip.vert.glsl'
import NoiseKit from './NoiseKit'
import RTDoubleBufferKit from './RTDoubleBufferKit'
import { getSharedRectangleGeometry } from '../test/utils/geometry'
export default class VelocityFieldKit extends RTDoubleBufferKit {
  private _initVelocitiesNoiseKit: NoiseKit
  initd = false
  constructor(
    edgeSize3d: number,
    pointGeo: BufferGeometry,
    positionsTextureUniform: Uniform,
    velocitiesTextureUniform: Uniform
  ) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3))
    const initPositionNoiseKit = new NoiseKit(edgeSize2d)
    super(initPositionNoiseKit, fullClipVertexShader, fadeFragmentShader, {})
    this.linkInput('uFieldVelocitiesTexture', this.inputTextureUniform)
    this._initVelocitiesNoiseKit = initPositionNoiseKit

    const points = new Points(
      pointGeo,
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uPositionsTexture: positionsTextureUniform,
          uVelocitiesTexture: velocitiesTextureUniform
        },
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending
      })
    )
    this.scene.add(points)
    this.plane.renderOrder = -2
  }
  render(renderer: WebGLRenderer, dt: number) {
    if (!this.initd) {
      this.initd = true
      this.swap()
      this._initVelocitiesNoiseKit.render(renderer, dt)
    }
    this.swap()
    renderer.setRenderTarget(this.outputRt)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }
}
