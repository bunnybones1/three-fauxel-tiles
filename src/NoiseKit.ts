import {
  AdditiveBlending,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RGBFormat,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import fragmentShader from './noise.frag.glsl'
import vertexShader from './fullclip.vert.glsl'
export default class NoiseKit {
  getTestPlane() {
    return new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: { uPhase: this._phaseUniform },
        blending: AdditiveBlending,
        depthTest: false
      })
    )
  }
  rt: WebGLRenderTarget
  scene: Scene
  dirty = true
  camera: OrthographicCamera
  _phaseUniform: Uniform
  constructor(edgeSize: number) {
    const rt = new WebGLRenderTarget(edgeSize, edgeSize, {
      format: RGBFormat,
      type: FloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      depthBuffer: false
    })
    const scene = new Scene()

    const phaseUniform = new Uniform(0)
    const p = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: { uPhase: phaseUniform }
      })
    )
    scene.add(p)
    const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
    scene.add(camera)

    this.rt = rt
    this.scene = scene
    this.camera = camera
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
    this.phase += dt * 0.001
    if (this.dirty) {
      this.dirty = false
      renderer.setRenderTarget(this.rt)
      renderer.render(this.scene, this.camera)
      renderer.setRenderTarget(null)
    }
  }
}
