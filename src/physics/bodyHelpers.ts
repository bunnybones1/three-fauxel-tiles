import {
  BodyDef,
  BodyType,
  CircleShape,
  FixtureDef,
  PolygonShape,
  World
} from '~/vendor/Box2D/Box2D'

import { makeBitMask, PBits } from './maskBits'

export function createPhysicBox(
  world: World,
  x: number,
  y: number,
  width: number,
  height: number,
  bodyType: BodyType = BodyType.staticBody,
  friction = 0.1,
  density = 1,
  isSensor = false
) {
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  bodyDef.fixedRotation = false
  bodyDef.type = bodyType
  const boxBody = world.CreateBody(bodyDef)
  boxBody.SetPositionXY(x, y)
  fixtureDef.friction = friction
  fixtureDef.restitution = 0.7
  fixtureDef.density = density
  fixtureDef.isSensor = isSensor
  if (bodyType === BodyType.staticBody) {
    fixtureDef.filter.categoryBits = makeBitMask(['environment'])
  }
  const templateRect = new PolygonShape().SetAsBox(width * 0.5, height * 0.5)
  fixtureDef.shape = templateRect
  boxBody.CreateFixture(fixtureDef)
  return boxBody
}
export function createPhysicsCircle(
  world: World,
  x: number,
  y: number,
  radius: number,
  ballsSelfCollide = false
) {
  const circle = new CircleShape(radius)
  const bodyDef = new BodyDef()
  const fixtureDef = new FixtureDef()
  fixtureDef.shape = circle
  fixtureDef.density = 1
  fixtureDef.friction = 0.2
  fixtureDef.restitution = 0.7
  bodyDef.type = BodyType.dynamicBody
  fixtureDef.filter.categoryBits = makeBitMask(['enemy'])
  const maskArr: PBits[] = ['environment', 'hero', 'heroWeapon']
  if (ballsSelfCollide) {
    maskArr.push('enemy')
  }
  fixtureDef.filter.maskBits = makeBitMask(maskArr)
  const circleBody = world.CreateBody(bodyDef)
  circleBody.SetPositionXY(x, y)
  circleBody.CreateFixture(fixtureDef)
  return circleBody
}
