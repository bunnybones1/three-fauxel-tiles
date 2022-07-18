import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { __pixelSizeMeters } from '~/settings/physics'
import { fontFaces } from '~/text/FontFace'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'
import { textToPhysicsBodies } from '~/utils/physics'
import { Body, World } from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

export default class TestTextPhysicsScene extends TestPhysicsScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    const testCode = runTextPhysicsTest(this.scene, this.sim.world)

    setTimeout(() => {
      testCode.settings.fontFace = fontFaces.GothicA1Black
    }, 2000)

    const init = async () => {
      //
    }
    init()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}

export function runTextPhysicsTest(scene: Scene, b2World: World) {
  let lastKnownTextBodies: Body[] | undefined

  const s = 10

  const testCode = new TextMesh(
    [
      '/**',
      '* For the brave souls who get this far: You are the chosen ones,',
      '* the valiant knights of programming who toil away, without rest,',
      '* fixing our most awful code. To you, true saviors, kings of men,',
      '* I say this: never gonna give you up, never gonna let you down,',
      '* never gonna run around and desert you. Never gonna make you cry,',
      '* never gonna say goodbye. Never gonna tell a lie and hurt you.',
      '*/'
    ].join('\n'),
    textSettings.code,
    undefined,
    undefined
  )
  testCode.scale.multiplyScalar(s)
  testCode.position.z -= 6
  testCode.position.x -= 2
  scene.add(testCode)

  testCode.onMeasurementsUpdated = () => {
    if (lastKnownTextBodies) {
      for (const body of lastKnownTextBodies) {
        b2World.DestroyBody(body)
      }
      lastKnownTextBodies = undefined
    }
    lastKnownTextBodies = textToPhysicsBodies(testCode, b2World)
  }
  return testCode
}
