import { Mesh, PlaneGeometry, Vector3, WebGLRenderer } from 'three'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial'
import { loadPixelatedTexture } from '~/utils/threeUtils'

import { BaseTestScene } from './BaseTestScene'

export default class TestTileMapScene extends BaseTestScene {
  protected _transform: Vector3
  constructor() {
    super()

    const scene = this.scene
    const transform = getMouseBoundViewTransform()
    async function initMapRenderer() {
      const mapTex = await loadPixelatedTexture('game/tilemaps/test.png')
      const tileTex = await loadPixelatedTexture('game/tilesets/test.png')

      const material = new BasicFullScreenMaterial({
        mapTex,
        tileTex,
        transform
      })

      const mapPreview = new Mesh(new PlaneGeometry(2, 2, 1, 1), material)
      scene.add(mapPreview)
    }
    initMapRenderer()
    this._transform = transform
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
