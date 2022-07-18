import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer
} from 'three'

import lib from '@lib/index'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'
import BaseTest2DScene from './BaseTest2DScene'

export default class TestCachedScrollingNoiseViewShaderScene extends BaseTest2DScene {
  arrowKeysDirection = getQuickKeyboardDirectionVector()
  textureCachingRoom: Scene
  textureCachingCamera: OrthographicCamera
  color: Color
  textureCachingScroller: lib.TextureCachingScroller
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    const color = new Color(1, 1, 0.4)
    this.color = color
    const textureCachingScroller = new lib.TextureCachingScroller(
      (renderer) => {
        color.setHSL(Math.random(), 0.8, 0.95)
        renderer.render(this.textureCachingRoom, this.textureCachingCamera)
      }
    )
    const previewSource = new Mesh(
      geo,
      new lib.materials.SimplexNoiseMaterial({
        color,
        uvST: textureCachingScroller.uvST
      })
    )
    this.scene.add(previewSource)

    const previewCachedRaw = new Mesh(
      geo,
      new lib.materials.BasicTextureMaterial({
        texture: textureCachingScroller.cacheRenderTarget.texture
      })
    )
    const textureCachingRoom = new Scene()
    const textureCachingCamera = new OrthographicCamera(
      -0.5,
      0.5,
      0.5,
      -0.5,
      -0.5,
      0.5
    )
    const noiseSource = previewSource.clone()
    textureCachingRoom.add(textureCachingCamera)
    textureCachingRoom.add(noiseSource)

    this.textureCachingRoom = textureCachingRoom
    this.textureCachingCamera = textureCachingCamera

    previewSource.position.x = -1
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
    super.update(dt)
  }

  render(renderer: WebGLRenderer, dt: number) {
    this.textureCachingScroller.render(renderer, dt)
    super.render(renderer, dt)
  }
}
