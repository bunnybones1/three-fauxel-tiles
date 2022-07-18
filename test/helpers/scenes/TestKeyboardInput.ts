import { WebGLRenderer } from 'three'
import getKeyboardInput from '~/input/getKeyboardInput'

import TestLightingScene from './TestLighting'

export default class TestKeyboardInputScene extends TestLightingScene {
  constructor() {
    super(false)
    getKeyboardInput().addListener((key, isDown: boolean) => {
      console.log(key, isDown)
    })
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
