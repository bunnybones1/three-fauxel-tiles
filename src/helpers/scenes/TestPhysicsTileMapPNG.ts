import { Mesh, PlaneGeometry, Vector2, Vector3, WebGLRenderer } from 'three'
import { getAlphaEncodedBlocksFromTileMap } from '~/helpers/utils/getAlphaEncodedBlocksFromTileMap'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial'
import { makeBitMask } from '~/physics/maskBits'
import {
  //   deconstructConcavePath,
  //   deconstructConcavePath2,
  deconstructConcavePath3
} from '~/utils/physics'
import {
  getCanvasOfImageTexture,
  loadPixelatedTexture
} from '~/utils/threeUtils'
import {
  BodyDef,
  BodyType,
  FixtureDef,
  PolygonShape,
  Vec2
} from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

export default class TestPhysicsTileMapPNGScene extends TestPhysicsScene {
  protected _transform: Vector3
  constructor() {
    super(false)

    const b2World = this.sim.world
    const scene = this.scene
    const transform = getMouseBoundViewTransform()
    async function initMapRenderer() {
      const mapTex = await loadPixelatedTexture('game/tilemaps/test2.png')
      const tileTex = await loadPixelatedTexture('game/tilesets/test.png')

      const material = new BasicFullScreenMaterial({
        mapTex,
        tileTex,
        transform
      })

      const mapPreview = new Mesh(new PlaneGeometry(2, 2, 1, 1), material)
      scene.add(mapPreview)

      const mapPixelData = getCanvasOfImageTexture(mapTex)
      const cols = mapTex.image.width
      const rows = mapTex.image.height
      const mapPixelDataArray = mapPixelData.getImageData(0, 0, cols, rows).data
      const allTileBlocks = getAlphaEncodedBlocksFromTileMap(tileTex)

      const allFixtures = new Map<number, FixtureDef[]>()
      allTileBlocks.forEach((firstVerts, k) => {
        const fixtureDefs: FixtureDef[] = []
        for (const firstVert of firstVerts) {
          const verts: Vec2[] = [firstVert.vert]
          let cursor = firstVert.next
          while (cursor !== firstVert) {
            verts.push(cursor.vert)
            cursor = cursor.next
          }
          if (verts.length > 4) {
            const subVerts2 = deconstructConcavePath3(
              verts.map((v) => new Vector2(v.x, v.y).multiplyScalar(1 / 32 / 8))
            )
            for (const subVerts of subVerts2) {
              if (subVerts.length < 3) {
                continue
              }
              const fixtureDef = new FixtureDef()
              const shape = new PolygonShape()
              shape.SetAsArray(subVerts)
              fixtureDef.shape = shape
              fixtureDef.filter.categoryBits = makeBitMask(['environment'])
              fixtureDefs.push(fixtureDef)
            }
          } else {
            const fixtureDef = new FixtureDef()
            const shape = new PolygonShape()
            shape.SetAsArray(verts.map((v) => v.Clone().SelfMul(1 / 32 / 8)))
            fixtureDef.shape = shape
            fixtureDef.filter.categoryBits = makeBitMask(['environment'])
            fixtureDefs.push(fixtureDef)
          }
        }
        allFixtures.set(k, fixtureDefs)
      })

      const bodyDef = new BodyDef()
      bodyDef.type = BodyType.staticBody
      const count = 0
      for (let iRow = 0; iRow < rows; iRow++) {
        for (let iCol = 0; iCol < cols; iCol++) {
          const i = iRow * cols + iCol
          const i4 = i * 4
          console.log(
            mapPixelDataArray[i4] / 32,
            mapPixelDataArray[i4 + 1] / 32
          )
          const tileX = mapPixelDataArray[i4] / 32
          const tileY = 7 - mapPixelDataArray[i4 + 1] / 32
          const index = tileX + tileY * 8
          if (allFixtures.has(index) && count < 100) {
            // console.log(`${index} at ${iCol},${iRow}`)
            // count++
            const fixtureDefs = allFixtures.get(index)!
            const body = b2World.CreateBody(bodyDef)
            for (const fixture of fixtureDefs) {
              body.CreateFixture(fixture)
            }
            body.SetPositionXY(iCol / 8 - 1, (16 - iRow) / 8 - 0.75)
          }
        }
      }
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
