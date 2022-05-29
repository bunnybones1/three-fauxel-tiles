import {
  AdditiveBlending,
  IUniform,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderTarget
} from 'three'

import basicFragmentShader from './map.frag.glsl'
import basicVertexShader from './fullclip.vert.glsl'
import { getBasicRenderTarget } from './renderTargetUtils'

export default class RTKit {
  outputTextureUniform: Uniform
  plane: Mesh<PlaneGeometry, ShaderMaterial>
  rt: WebGLRenderTarget
  outputRt: WebGLRenderTarget
  getTestPlane() {
    return new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: basicVertexShader,
        fragmentShader: basicFragmentShader,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        uniforms: { uMap: this.outputTextureUniform }
      })
    )
  }

  scene: Scene
  camera: OrthographicCamera
  constructor(
    public edgeSize: number,
    vertexShader: string,
    fragmentShader: string,
    protected _uniforms: {
      [uniform: string]: IUniform<any>
    }
  ) {
    const rt = getBasicRenderTarget(edgeSize)
    this.outputTextureUniform = new Uniform(rt.texture)

    const scene = new Scene()

    const plane = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: this._uniforms,
        depthTest: false,
        depthWrite: false
      })
    )
    scene.add(plane)
    const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
    scene.add(camera)

    this.plane = plane
    this.scene = scene
    this.camera = camera
    this.rt = rt
    this.outputRt = rt
  }
}
