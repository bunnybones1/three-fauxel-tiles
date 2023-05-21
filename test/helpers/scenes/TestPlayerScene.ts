import { Color, Vector3, WebGLRenderer } from 'three'

import lib from '@lib/index'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'
import BaseTest2DScene from './BaseTest2DScene'

import { listenToProperty } from '../../utils/propertyListeners'
import { getQuickKeyboardDirectionElevation } from '../elevationKeyboardInputHelper'
export default class TestPlayerScene extends BaseTest2DScene {
  arrowKeysDirection = getQuickKeyboardDirectionVector()
  elevationDirection = getQuickKeyboardDirectionElevation()
  color: Color
  playerCoord: Vector3
  constructor() {
    super()

    //geo.setIndex([0, 1, 2, 0, 2, 3])
    const color = new Color(1, 1, 0.4)
    this.color = color

    const testPlane = new lib.PegboardMesh()
    testPlane.scale.multiplyScalar(1 / 2000)
    testPlane.position.x -= 0.1
    this.scene.add(testPlane)
    testPlane.updateMatrixWorld()
    testPlane.translateY(-0.06)

    this.playerCoord = testPlane.playerCoord
  }
  update(dt: number) {
    const arrowKeys = this.arrowKeysDirection
    // this.playerCoord.x += arrowKeys.x * dt * 10
    // this.playerCoord.y -= arrowKeys.y * dt * 10
    this.playerCoord.x += (arrowKeys.x + arrowKeys.y) * dt * 10
    this.playerCoord.y += (arrowKeys.x - arrowKeys.y) * dt * 10
    this.playerCoord.z -= this.elevationDirection.val * dt * 10
    super.update(dt)
  }

  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
