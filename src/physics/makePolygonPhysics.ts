import { Vector2 } from 'three'
import { deconstructConcavePath } from '~/utils/physics'
import {
  BodyDef,
  BodyType,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

import { createPhysicBox } from './bodyHelpers'
import { makeBitMask } from './maskBits'

const __origin = new Vector2()
export default function makePolygonPhysics(
  world: World,
  verts: Vector2[],
  type: BodyType = BodyType.staticBody,
  position = __origin,
  deconstructConcavePathMethod = deconstructConcavePath
) {
  const bodyDef = new BodyDef()
  bodyDef.type = type
  const body = world.CreateBody(bodyDef)
  body.SetPositionXY(position.x, position.y)
  verts.forEach((v) =>
    createPhysicBox(world, v.x + position.x, v.y + position.y, 0.002, 0.002)
  )
  const subVerts2 = deconstructConcavePathMethod(verts)
  for (const subVerts of subVerts2) {
    if (subVerts.length < 3) {
      continue
    }
    const fixtureDef = new FixtureDef()
    const shape = new PolygonShape()
    shape.SetAsArray(subVerts)
    fixtureDef.shape = shape
    fixtureDef.filter.categoryBits = makeBitMask(['environment'])
    body.CreateFixture(fixtureDef)
  }
  return body
}
