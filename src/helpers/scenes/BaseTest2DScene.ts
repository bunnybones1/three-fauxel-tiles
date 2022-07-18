import { OrthographicCamera, Vector3 } from 'three'
import device from '~/device'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'

import { BaseTestScene } from './BaseTestScene'

export default class BaseTest2DScene extends BaseTestScene {
  camera: OrthographicCamera
  protected _transform: Vector3
  constructor() {
    super()
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
    const transform = getMouseBoundViewTransform('viewTransformTestBase2DScene')
    this._transform = transform
  }
  update(dt: number) {
    const { x, y, z } = this._transform
    const a = device.aspect
    this.camera.left = -x * z - z * a
    this.camera.right = -x * z + z * a
    this.camera.top = -y * z + z
    this.camera.bottom = -y * z - z
    this.camera.updateProjectionMatrix()
    super.update(dt)
  }
}
