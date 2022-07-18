import { Vector2 } from 'three'
import { makeWobblyCircleShapePath } from '~/factories/shapePaths'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import { createPhysicBox } from '~/physics/bodyHelpers'
import makePolygonPhysics from '~/physics/makePolygonPhysics'
import PhysicsCharacter from '~/physics/PhysicsCharacter'
import {
  deconstructConcavePath2,
  deconstructConcavePath3
} from '~/utils/physics'
import { BodyType } from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

export default class TestConcaveBodiesScene extends TestPhysicsScene {
  protected postUpdates: Array<(dt: number) => void> = []
  private firstCharacter: PhysicsCharacter | undefined
  constructor() {
    super()

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.sim.world, i - 5, -0.3, 0.5, 0.1)
    }

    const wobblyCircleVerts = makeWobblyCircleShapePath(0.1, 0.25, 40, 6)
    makePolygonPhysics(
      this.sim.world,
      wobblyCircleVerts,
      BodyType.staticBody,
      new Vector2(-0.5, 0),
      deconstructConcavePath2
    )

    const testShape = makeWobblyCircleShapePath(0.2, 0.125, 12, 3, 0.25)
    const pos = new Vector2(-1, 0)
    makePolygonPhysics(
      this.sim.world,
      testShape,
      BodyType.staticBody,
      pos,
      deconstructConcavePath3
    )
  }

  update(dt: number) {
    if (this.firstCharacter) {
      this.b2Preview.offset.Copy(this.firstCharacter.avatarBody.GetPosition())
    }
    super.update(dt) //does actual physics
    for (const pu of this.postUpdates) {
      pu(dt)
    }
  }
}
