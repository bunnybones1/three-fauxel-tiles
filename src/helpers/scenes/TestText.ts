import { PerspectiveCamera, WebGLRenderer } from 'three'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import { BaseTestScene } from './BaseTestScene'

export default class TestTextScene extends BaseTestScene {
  constructor() {
    super()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    const s = 10

    const hello = new TextMesh('Hello World!')
    hello.scale.multiplyScalar(s)
    this.scene.add(hello)

    const title = new TextMesh('ANY KEY', textSettings.title)
    title.scale.multiplyScalar(s)
    this.scene.add(title)

    const keys = new TextMesh('Q W E R T Y', textSettings.keyLabel)
    keys.scale.multiplyScalar(s)
    keys.position.y = -0.4
    this.scene.add(keys)

    const keys2 = new TextMesh('← ↑ → ↓ ⇧', textSettings.keyLabel)
    keys2.scale.multiplyScalar(s)
    keys2.position.y = -0.5
    this.scene.add(keys2)

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
