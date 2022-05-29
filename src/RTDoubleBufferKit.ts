import { IUniform, Uniform, WebGLRenderTarget } from 'three'

import RTKit from './RTKit'

export default class RTDoubleBufferKit extends RTKit {
  inputTextureUniform: Uniform
  rt2: WebGLRenderTarget

  constructor(
    rtKit: RTKit,
    vertexShader: string,
    fragmentShader: string,
    uniforms: {
      [uniform: string]: IUniform<any>
    }
  ) {
    super(rtKit.edgeSize, vertexShader, fragmentShader, uniforms)
    this.inputTextureUniform = new Uniform(rtKit.outputTextureUniform.value)
    this.rt2 = rtKit.rt
  }

  linkInput(name: string, uniform: Uniform) {
    this.plane.material.uniforms[name] = uniform
  }
  swap() {
    this.outputRt = this.outputRt === this.rt ? this.rt2 : this.rt
    this.inputTextureUniform.value = (
      this.outputRt === this.rt ? this.rt2 : this.rt
    ).texture
    this.outputTextureUniform.value = this.outputRt.texture
  }
}
