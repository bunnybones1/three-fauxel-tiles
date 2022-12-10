import {
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer
} from 'three'
import lib from '@lib/index'
import { rand } from '../../utils/math'
import { detRandGraphics } from '../../utils/random'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'

import BaseTest2DScene from './BaseTest2DScene'

export default class TestCachedScrollingJitTileShaderScene extends BaseTest2DScene {
  arrowKeysDirection = getQuickKeyboardDirectionVector()
  testRoom: Scene
  testCamera: OrthographicCamera
  textureCachingScroller: lib.TextureCachingScroller
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    const textureCachingScroller = new lib.TextureCachingScroller(
      (renderer) => {
        renderer.render(this.testRoom, this.testCamera)
      }
    )

    const previewCachedRaw = new Mesh(
      geo,
      new lib.materials.BasicTextureMaterial({
        texture: textureCachingScroller.cacheRenderTarget.texture
      })
    )
    const testRoom = new Scene()
    const testCamera = new OrthographicCamera(-0.5, 0.5, -0.5, 0.5, -0.5, 0.5)
    testRoom.add(testCamera)
    const ballGeo = new lib.geometry.FibonacciSphereGeometry(0.1, 60)
    const ballMat = lib.getMaterial('drywall')
    for (let i = 0; i < 2000; i++) {
      const ball = new Mesh(ballGeo, ballMat)
      ball.position.set(detRandGraphics(-5, 5), detRandGraphics(-5, 5), 0)
      ball.scale.multiplyScalar(rand(0.4, 0.8))
      testRoom.add(ball)
    }
    const ambient = new HemisphereLight(
      new Color(0.4, 0.6, 0.9),
      new Color(0.6, 0.25, 0)
    )
    testRoom.add(ambient)
    const light = new DirectionalLight(new Color(1, 0.9, 0.7), 1)
    light.position.set(-0.25, 1, 0.25).normalize()
    testRoom.add(light)

    this.testRoom = testRoom
    this.testCamera = testCamera

    this.scene.add(previewCachedRaw)

    const previewCachedCorrected = new Mesh(
      geo,
      new lib.materials.BasicTextureMaterial({
        uvST: textureCachingScroller.uvST,
        texture: textureCachingScroller.cacheRenderTarget.texture
      })
    )
    previewCachedCorrected.position.x = 1
    this.scene.add(previewCachedCorrected)

    this.textureCachingScroller = textureCachingScroller
  }
  update(dt: number) {
    const scrollOffset = this.textureCachingScroller.scrollOffset
    const cacheResolution = this.textureCachingScroller.cacheResolution
    const arrowKeys = this.arrowKeysDirection
    scrollOffset.x += arrowKeys.x * dt * cacheResolution.x
    scrollOffset.y -= arrowKeys.y * dt * cacheResolution.y
    // this.testCamera.updateProjectionMatrix()
    super.update(dt)
  }

  render(renderer: WebGLRenderer, dt: number) {
    const scrollOffset = this.textureCachingScroller.scrollOffset
    const cacheResolution = this.textureCachingScroller.cacheResolution
    this.testCamera.position.x = scrollOffset.x / cacheResolution.x
    this.testCamera.position.y = -scrollOffset.y / cacheResolution.y
    // this.testCamera.left = scrollOffset.x/ cacheResolution.x - 0.5
    // this.testCamera.right = scrollOffset.x/ cacheResolution.x + 0.5
    this.textureCachingScroller.render(renderer, dt)
    super.render(renderer, dt)
  }
}
