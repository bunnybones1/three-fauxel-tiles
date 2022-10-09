import { Clock, Color, Vector3 } from 'three'

import BaseTestScene from './helpers/scenes/BaseTestScene'
import renderer from './renderer'
import { testClasses } from './tests'
import { timeFractUniform, timeUniform } from './uniforms'
import { cameraShaker } from './utils/cameraShaker'
import { recorderCanvas, recordFrame } from './utils/canvasRecorder'
import { getUrlParam } from './utils/location'
import { nextFrameUpdate } from './utils/onNextFrame'
import UpdateManager from './utils/UpdateManager'

document.addEventListener('gesturestart', (e) => e.preventDefault()) // disable zooming on mobile

const clock = new Clock()
renderer.setClearColor(new Color(0x344556), 1.0)
cameraShaker.camera.position.set(0, 0.5, 0.5)
cameraShaker.camera.lookAt(new Vector3())

let TestClass: new () => BaseTestScene = BaseTestScene
const testParam = getUrlParam('test') || 'pixelText'
if (testClasses.hasOwnProperty(testParam)) {
  TestClass = testClasses[testParam]
}

setTimeout(() => {
  const test: BaseTestScene = new TestClass()

  if (recorderCanvas) {
    let lastTime = 0
    recordFrame((time) => {
      const dt = (time - lastTime) * 0.001
      lastTime = time
      nextFrameUpdate()
      UpdateManager.update(dt)
      timeUniform.value += dt
      timeFractUniform.value = (timeFractUniform.value + dt) % 1

      test.update(dt)
      test.render(renderer, dt)
    })

    // Start loop
  } else {
    const nthFrame: number = parseInt(getUrlParam('nthFrame') || '1')
    let frameCounter = 0
    let renderDt = 0
    const loop = () => {
      frameCounter++
      const dt = clock.getDelta()
      renderDt += dt

      nextFrameUpdate()
      UpdateManager.update(dt)
      timeUniform.value += dt
      timeFractUniform.value = (timeFractUniform.value + dt) % 1

      test.update(dt)
      if (frameCounter % nthFrame !== 0) {
        requestAnimationFrame(loop)
        return
      }
      test.render(renderer, renderDt)
      renderDt = 0

      requestAnimationFrame(loop)
    }

    // Start loop
    requestAnimationFrame(loop)
  }
}, 1000)
