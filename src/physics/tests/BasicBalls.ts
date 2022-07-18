import { createPhysicBox, createPhysicsCircle } from '~/physics/bodyHelpers'
import { detRandPhysics } from '~/utils/random'
import { Body, Vec2, World } from '~/vendor/Box2D/Box2D'

import IPhysicsTest from './IPhysicsTest'

export default class BasicBalls implements IPhysicsTest {
  circleBodies: Body[] = []
  constructor(private _walls = true) {
    //
  }
  init(world: World) {
    for (let i = 0; i < 60; i++) {
      const circleBody = createPhysicsCircle(
        world,
        detRandPhysics(-1, 1),
        1.5 + detRandPhysics(-0.2, 0.2),
        0.05,
        true
      )
      this.circleBodies.push(circleBody)
    }
    if (this._walls) {
      createPhysicBox(world, 0, -0.3, 1, 0.1)
      createPhysicBox(world, 0.2, 0.3, 1, 0.1)
      const ramp = createPhysicBox(world, 0.8, 0, 1, 0.1)
      ramp.SetAngle(Math.PI * 0.25)
      const ramp2 = createPhysicBox(world, -0.8, 0, 1, 0.1)
      ramp2.SetAngle(Math.PI * -0.25)
    }
  }
  report() {
    return [
      'simulated ' + this.circleBodies.length + ' balls and a few boxes.',
      'random check: ' + this.circleBodies[0].GetPosition().x
    ].join('\n')
  }
  update(dt: number) {
    for (const circleBody of this.circleBodies) {
      const p = circleBody.GetPosition()
      if (p.y < -1) {
        circleBody.SetLinearVelocity(new Vec2(0.0, 0.0))
        circleBody.SetPositionXY(
          detRandPhysics(-1, 1),
          1.5 + detRandPhysics(-0.2, 0.2)
        )
      }
    }
  }
}
