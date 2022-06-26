import {
  WebGLRenderer,
} from 'three'

import fragmentShader from './velocity.frag.glsl'
import vertexShader from './fullclip.vert.glsl'
import NoiseKit from './NoiseKit'
import RTDoubleBufferKit from './RTDoubleBufferKit'
export default class VelocityKit extends RTDoubleBufferKit {
  private _initVelocitiesNoiseKit: NoiseKit
  initd = false
  constructor(edgeSize: number) {
    const initVelocityNoiseKit = new NoiseKit(edgeSize, 0.01)
    super(initVelocityNoiseKit, vertexShader, fragmentShader, {})
    this.linkInput('uVelocitiesTexture', this.inputTextureUniform)
    this._initVelocitiesNoiseKit = initVelocityNoiseKit
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
