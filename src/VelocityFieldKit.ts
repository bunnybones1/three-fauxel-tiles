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
import noiseFragmentShader from './noise.frag.glsl'
import NoiseKit from './NoiseKit'
import RTDoubleBufferKit from './RTDoubleBufferKit'
import { getSharedRectangleGeometry } from '../test/utils/geometry'
export default class VelocityFieldKit extends RTDoubleBufferKit {
  private _initVelocitiesNoiseKit: NoiseKit
  initd = false
  constructor(
    edgeSize3d: number,
    pointGeo: BufferGeometry,
    positionsTextureUniform: Uniform
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
          uVelocitiesTexture: this.inputTextureUniform
        },
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending
      })
    )
    const phaseUniform = new Uniform(0)
    const opacityUniform = new Uniform(0.015)
    const uniforms = { uPhase: phaseUniform, uOpacity: opacityUniform }
    const plane2 = new Mesh(
      getSharedRectangleGeometry(),
      new ShaderMaterial({
        vertexShader: fullClipVertexShader,
        fragmentShader: noiseFragmentShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending
      })
    )
    this.scene.add(plane2)
    this.scene.add(points)
    // this.plane.material.visible = false
    // plane2.material.visible = false
    this.plane.renderOrder = -2
    plane2.renderOrder = -1
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
