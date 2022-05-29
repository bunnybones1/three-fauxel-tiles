import {
  BufferGeometry,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import fragmentShader from './motion.frag.glsl'
import vertexShader from './fullclip.vert.glsl'
import NoiseKit from './NoiseKit'
import RTDoubleBufferKit from './RTDoubleBufferKit'
export default class MotionKit extends RTDoubleBufferKit {
  private _initPositionsNoiseKit: NoiseKit
  initd = false
  constructor(edgeSize: number, pointGeo: BufferGeometry) {
    const initPositionNoiseKit = new NoiseKit(edgeSize)
    super(initPositionNoiseKit, vertexShader, fragmentShader, {})
    this.linkInput('uPositionsTexture', this.inputTextureUniform)
    this._initPositionsNoiseKit = initPositionNoiseKit
  }
  render(renderer: WebGLRenderer, dt: number) {
    if (!this.initd) {
      this.initd = true
      this.swap()
      this._initPositionsNoiseKit.render(renderer, dt)
    }
    this.swap()
    renderer.setRenderTarget(this.outputRt)
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }
}
