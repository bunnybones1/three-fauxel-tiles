import { Uniform, WebGLRenderer } from 'three'

import fragmentShader from './noise.frag.glsl'
import vertexShader from './fullclip.vert.glsl'
import RTKit from './RTKit'
export default class NoiseKit extends RTKit {
  dirty = true
  _phaseUniform: Uniform
  constructor(edgeSize: number, initialOpacity = 1) {
    const phaseUniform = new Uniform(0)
    const opacityUniform = new Uniform(initialOpacity)
    const uniforms = { uPhase: phaseUniform, uOpacity: opacityUniform }
    super(edgeSize, vertexShader, fragmentShader, uniforms)

    this._phaseUniform = phaseUniform
  }
  public get phase() {
    return this._phaseUniform.value
  }
  public set phase(value: number) {
    this._phaseUniform.value = value
    this.dirty = true
  }
  render(renderer: WebGLRenderer, dt: number) {
    this.phase += dt * 0.1
    if (this.dirty) {
      this.dirty = false
      renderer.setRenderTarget(this.rt)
      renderer.render(this.scene, this.camera)
      renderer.setRenderTarget(null)
    }
  }
}
