import { Vector2 } from 'three'
import ICharacterController from '~/controllers/ICharacterController'
import { removeFromArray } from '~/utils/arrayUtils'
import { taskTimer } from '~/utils/taskTimer'
import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Filter,
  Fixture,
  FixtureDef,
  RayCastInput,
  RayCastOutput,
  World
} from '~/vendor/Box2D/Box2D'

import AvatarContactListener from './AvatarContactListener'
import { createPhysicBox } from './bodyHelpers'
import { makeBitMask } from './maskBits'

const __rcOut = new RayCastOutput()
const __rcIn = new RayCastInput()
const __tempVec2 = { x: 0, y: 0 }
const __defaultSize = new Vector2(0.1, 0.1)
const __weaponXOffset = 0.05
export default class PhysicsCharacter {
  private _avatarBody: Body
  private _frontDirection: -1 | 1 = 1
  get avatarBody() {
    return this._avatarBody
  }
  private _weaponBody: Body
  private _onSolidGrounds: Fixture[]
  private _velocity = { x: 0, y: 0 }
  constructor(
    private _b2World: World,
    contactListener: AvatarContactListener,
    private _controller: ICharacterController,
    public size = __defaultSize
  ) {
    const onSolidGrounds: Fixture[] = []
    _controller.jumpCheck = () => onSolidGrounds.length > 0

    const avatarBody = createPhysicBox(
      _b2World,
      0,
      0,
      size.x,
      size.y,
      BodyType.kinematicBody,
      0,
      1,
      true
    )
    const filter = new Filter()
    filter.categoryBits = makeBitMask(['hero'])
    filter.maskBits = makeBitMask(['environment', 'enemyWeapon'])

    avatarBody.GetFixtureList()!.SetFilterData(filter)
    const weaponBody = createPhysicBox(
      _b2World,
      0,
      0,
      size.x,
      size.y * 0.2,
      BodyType.kinematicBody,
      0,
      1,
      true
    )

    const avFixt = avatarBody.GetFixtureList()!
    contactListener.listenForSensorBeginContact(avFixt, (fixt) => {
      if (fixt.GetBody().GetType() === BodyType.staticBody) {
        onSolidGrounds.push(fixt)
      }
    })
    contactListener.listenForSensorEndContact(avFixt, (fixt) => {
      if (fixt.GetBody().GetType() === BodyType.staticBody) {
        removeFromArray(onSolidGrounds, fixt)
      }
    })

    //quick way to check which button you pressed
    // for (let i = 0; i < controller.buttonsCount; i++) {
    // 	function p(j:number) {
    // 		controller.listenToButton(j, val => {
    // 			console.log(j, val)
    // 		})
    // 	}
    // 	p(i)
    // }
    this._avatarBody = avatarBody
    this._weaponBody = weaponBody
    this._onSolidGrounds = onSolidGrounds
  }
  postPhysicsUpdate(dt: number) {
    const bp = this._avatarBody.GetPosition()
    this._velocity.x =
      this._controller.intent.x * (this._controller.running ? 2 : 1) +
      this._b2World.m_gravity.x * dt
    this._velocity.y += this._b2World.m_gravity.y * dt
    if (this._onSolidGrounds.length > 0 && this._velocity.y < 0) {
      __rcIn.p1.Set(bp.x, bp.y + 0.1)
      __rcIn.p2.Set(bp.x, bp.y - 0.2)
      __rcIn.maxFraction = 1
      for (const fixt of this._onSolidGrounds) {
        if (fixt.RayCast(__rcOut, __rcIn, 0)) {
          this._velocity.y = 0
          this._avatarBody.SetPositionXY(
            bp.x,
            bp.y + 0.1 - __rcOut.fraction * 0.2
          )
        }
      }
    }
    if (this._controller.requestJump) {
      this._velocity.y = 2.5
      this._controller.requestJump = false
    }
    if (bp.y < -1) {
      this._avatarBody.SetPositionXY(bp.x, 0)
      this._velocity.y = 0
    }

    //console.log(this._controller.intent.x)

    if (this._controller.intent.x < 0) {
      this._frontDirection = -1
    } else if (this._controller.intent.x > 0) {
      this._frontDirection = 1
    }

    const weaponPos = this._avatarBody.GetPosition().Clone()
    weaponPos.SelfAddXY(__weaponXOffset * this._frontDirection, 0)
    this._weaponBody.SetPosition(weaponPos)

    //this._weaponBody.SetPosition(this._avatarBody.GetPosition())

    this._weaponBody.SetAngle(this._controller.aimAngle)
    this._avatarBody.SetLinearVelocity(this._velocity)
    this._weaponBody.SetLinearVelocity(this._velocity)

    //aim to fire
    if (this._controller.aim.x !== 0 || this._controller.aim.y !== 0) {
      const bodyDef = new BodyDef()
      bodyDef.position.Copy(this._weaponBody.GetPosition())
      bodyDef.type = BodyType.dynamicBody
      bodyDef.bullet = true
      const bullet = this._b2World.CreateBody(bodyDef)
      const fixtureDef = new FixtureDef()
      fixtureDef.filter.categoryBits = makeBitMask(['heroWeapon'])
      fixtureDef.filter.maskBits = makeBitMask(['environment', 'enemy'])
      fixtureDef.shape = new CircleShape(0.01)
      fixtureDef.restitution = 0.0001
      fixtureDef.density = 0.1
      __tempVec2.x = this._controller.aim.x * 10
      __tempVec2.y = this._controller.aim.y * 10
      bullet.SetLinearVelocity(__tempVec2)
      bullet.CreateFixture(fixtureDef)
      taskTimer.add(() => this._b2World.DestroyBody(bullet), 0.5)
    }
  }
}
