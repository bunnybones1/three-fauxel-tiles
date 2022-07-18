import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'
import { createPhysicBox } from '~/physics/bodyHelpers'

import { startControllableCharacters } from './TestCharacterControl'
import TestPhysicsScene from './TestPhysics'
import { runTextPhysicsTest } from './TestTextPhysics'

export default class TestCharacterControlOnTextScene extends TestPhysicsScene {
  private _postUpdate: (dt: number) => void
  constructor() {
    super()

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.sim.world, i - 5, -0.3, 0.5, 0.1)
    }

    this._postUpdate = startControllableCharacters(
      this.sim.world,
      this.b2Preview
    )
    runTextPhysicsTest(this.scene, this.sim.world)
  }

  update(dt: number) {
    super.update(dt) //does actual physics
    this._postUpdate(dt)
  }
}
