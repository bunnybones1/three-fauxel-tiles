import { WebGLRenderer } from 'three'
import { getSimulator } from '~/helpers/physics/simulator'
import { Box2DPreviewMesh } from '~/meshes/Box2DPreviewMesh'
import Simulator from '~/physics/Simulator'
import BasicBalls from '~/physics/tests/BasicBalls'
import { nowInSeconds } from '~/utils/performance'

import { BaseTestScene } from './BaseTestScene'

export default class TestPhysicsScene extends BaseTestScene {
  protected b2Preview: Box2DPreviewMesh
  protected sim: Simulator
  constructor(walls = true) {
    super()
    this.sim = getSimulator(nowInSeconds, new BasicBalls(walls))
    const b2World = this.sim.world

    setInterval(() => console.log(this.sim.logPerformance()), 2000)
    const b2Preview = new Box2DPreviewMesh(b2World)
    this.scene.add(b2Preview)

    this.b2Preview = b2Preview
  }
  update(dt: number) {
    super.update(dt)
    this.sim.update(dt)
    this.b2Preview.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
