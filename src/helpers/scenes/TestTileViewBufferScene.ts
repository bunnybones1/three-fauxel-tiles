import {
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Vector3,
  WebGLRenderer
} from 'three'
import device from '~/device'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import CachingTileScroller from '~/rendering/tiles/CachingTileScroller'

import { BaseTestScene } from './BaseTestScene'

export default class TestTileViewBufferScene extends BaseTestScene {
  protected _transform: Vector3
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    // const uvArray = geo.getAttribute('uv').array
    // for (let i = 0; i < uvArray.length; i++) {
    //     const i2 = i * 2
    //     uvArray[i2] *= 320
    //     uvArray[i2+1] *= 240
    // }
    const cachingTileScroller = new CachingTileScroller()
    const test = new Mesh(geo, cachingTileScroller.material)
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
    device.onChange(() => {
      // cachingTileScroller
    })
    // test.position.y = -1
    // this.camera.position.set(0, 10, 10)
    this.scene.add(test)
    // this.camera.lookAt(test.position)

    const transform = getMouseBoundViewTransform()
    this._transform = transform
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
