import {
  BufferGeometry,
  Points,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import fragmentShader2 from './velocityField.frag.glsl'
import vertexShader2 from './velocityField.vert.glsl'
import fadeFragmentShader from './fade.frag.glsl'
import fadeVertexShader from './fullclip.vert.glsl'
import NoiseKit from './NoiseKit'
import RTDoubleBufferKit from './RTDoubleBufferKit'
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
    super(initPositionNoiseKit, fadeVertexShader, fadeFragmentShader, {})
    this.linkInput('uFieldVelocitiesTexture', this.inputTextureUniform)
    this._initVelocitiesNoiseKit = initPositionNoiseKit

    const points = new Points(
      pointGeo,
      new ShaderMaterial({
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        uniforms: {
          uPositionsTexture: positionsTextureUniform,
          uVelocitiesTexture: this.inputTextureUniform
        },
        depthTest: false,
        depthWrite: false,
        transparent: true
      })
    )
    this.scene.add(points)
    // this.plane.material.visible = false
    this.plane.renderOrder = -1
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
