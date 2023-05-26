import { Color, Vector3, WebGLRenderer } from 'three'

import lib from '@lib/index'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'
import BaseTest2DScene from './BaseTest2DScene'

import { getQuickKeyboardDirectionElevation } from '../elevationKeyboardInputHelper'

const blockLib = [
  //   -1,
  lib.TILES.DIRT,
  -1,
  //   lib.TILES.EMPTY,
  //   -1,
  lib.TILES.STONE,
  -1,
  lib.TILES.EMPTY
]
export default class TestPlayerScene extends BaseTest2DScene {
  arrowKeysDirection = getQuickKeyboardDirectionVector()
  elevationDirection = getQuickKeyboardDirectionElevation()
  color: Color
  playerCoord: Vector3
  landscape: any
  private _frames: number
  testPlane: any
  constructor() {
    super()

    //geo.setIndex([0, 1, 2, 0, 2, 3])
    const color = new Color(1, 1, 0.4)
    this.color = color

    const landscape = new lib.Memoize3D(new lib.LandscapeTileIndex3D())

    const testPlane = new lib.PegboardMesh((x, y, z) =>
      landscape.getValue(x, y, z)
    )
    testPlane.scale.multiplyScalar(1 / 2000)
    testPlane.position.x -= 0.1
    this.scene.add(testPlane)
    testPlane.updateMatrixWorld()
    testPlane.translateY(-0.06)

    this.testPlane = testPlane

    this.landscape = landscape
    this.playerCoord = testPlane.playerCoord
    this._frames = 0

    const gameLoop = () => {
      const p = new Vector3()
      const h = this.landscape

      const blockCursor = ~~(performance.now() * 0.001) % blockLib.length
      const blockId = blockLib[blockCursor]
      const angle = performance.now() * 0.002
      const ox = Math.sin(angle) * 6
      const oy = Math.cos(angle) * 6
      const oz = Math.cos(angle * 0.3) * 3
      if (blockId !== -1) {
        for (let i = 0; i < 140; i++) {
          p.randomDirection()
          p.multiplyScalar(1 - Math.pow(Math.random(), 3))
          p.multiplyScalar(1)
          p.add(this.playerCoord)
          const x = Math.round(p.x + 50 + ox)
          const y = Math.round(p.y - 50 + oy)
          const z = Math.round(p.z + 48 + oz)

          h.invalidate(x - 1, y - 1, z - 1)
          h.invalidate(x - 1, y - 1, z)
          h.invalidate(x - 1, y - 1, z + 1)
          h.invalidate(x - 1, y, z - 1)
          h.invalidate(x - 1, y, z)
          h.invalidate(x - 1, y, z + 1)
          h.invalidate(x - 1, y + 1, z - 1)
          h.invalidate(x - 1, y + 1, z)
          h.invalidate(x - 1, y + 1, z + 1)

          h.invalidate(x, y - 1, z - 1)
          h.invalidate(x, y - 1, z)
          h.invalidate(x, y - 1, z + 1)
          h.invalidate(x, y, z - 1)
          h.invalidate(x, y, z)
          h.invalidate(x, y, z + 1)
          h.invalidate(x, y + 1, z - 1)
          h.invalidate(x, y + 1, z)
          h.invalidate(x, y + 1, z + 1)

          h.invalidate(x + 1, y - 1, z - 1)
          h.invalidate(x + 1, y - 1, z)
          h.invalidate(x + 1, y - 1, z + 1)
          h.invalidate(x + 1, y, z - 1)
          h.invalidate(x + 1, y, z)
          h.invalidate(x + 1, y, z + 1)
          h.invalidate(x + 1, y + 1, z - 1)
          h.invalidate(x + 1, y + 1, z)
          h.invalidate(x + 1, y + 1, z + 1)
          h.setValue(x, y, z, blockId)
        }
      }
      testPlane.update()
      //   requestAnimationFrame(gameloop)
    }
    // requestAnimationFrame(gameloop)
    setInterval(gameLoop, 16)
  }
  update(dt: number) {
    this._frames++
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
