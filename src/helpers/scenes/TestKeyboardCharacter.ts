import { WebGLRenderer } from 'three'
import { debugPolygonPhysics } from '~/meshes/Box2DPreviewMesh'

import { BaseTestScene } from './BaseTestScene'
import TestKeyboardInputScene from './TestKeyboardInput'
import TestPhysicsScene from './TestPhysics'

export default class TestKeyboardCharacterScene extends BaseTestScene {
  private scenes: BaseTestScene[]
  constructor() {
    super()
    const keyboardScene = new TestKeyboardInputScene()
    const physicsScene = new TestPhysicsScene()
    this.scenes = [keyboardScene, physicsScene]
    this.scenes[1].autoClear = false
    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true
  }
  update(dt: number) {
    for (const scene of this.scenes) {
      scene.update(dt)
    }
  }
  render(renderer: WebGLRenderer, dt: number) {
    for (const scene of this.scenes) {
      scene.render(renderer, dt)
    }
  }
}
