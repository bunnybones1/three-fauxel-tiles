import {
  LinearEncoding,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneBufferGeometry,
  RepeatWrapping,
  Scene,
  Texture,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { SimplexNoiseMaterial } from '../materials/SimplexNoiseMaterial'

export default class NoiseTextureMaker {
  texture: Texture
  private _renderTarget: WebGLRenderTarget
  private _scene: Scene
  private _camera: OrthographicCamera
  constructor(res = 256) {
    const geo = new PlaneBufferGeometry(2, 2)
    const uvST = new Vector4(1, 1, 0, 0)
    const mesh = new Mesh(
      geo,
      new SimplexNoiseMaterial({
        uvST
      })
    )
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, -1, 1, -1, 1)
    const renderTarget = new WebGLRenderTarget(res, res, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      encoding: LinearEncoding,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      generateMipmaps: false
    })
    scene.add(camera)
    scene.add(mesh)
    this._renderTarget = renderTarget
    this.texture = renderTarget.texture
    this._scene = scene
    this._camera = camera
  }
  render(renderer: WebGLRenderer) {
    renderer.setRenderTarget(this._renderTarget)
    renderer.render(this._scene, this._camera)
    renderer.setRenderTarget(null)
  }
}
