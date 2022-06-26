import { Color, PerspectiveCamera, WebGLRenderer } from 'three'
import lib from '@lib/index'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import { BaseTestScene } from './BaseTestScene'

function url(name: string, ext: string) {
  return `books/${name}.${ext}`
}

export default class TestPointRenderingScene extends BaseTestScene {
  atoms: any
  constructor() {
    super()
    this.camera.position.set(0, 0.4, 0.4)

    this.camera.lookAt(0, 0, 0)
    // this.camera.updateProjectionMatrix()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    const init = async () => {
      const atoms = new lib.Atoms()
      const atomsVis = atoms.visuals
      this.scene.add(atomsVis)
      atomsVis.scale.set(0.1, 0.1, 0.1)
      this.atoms = atoms
    }
    init()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this.atoms.update(renderer, dt)
    super.render(renderer, dt)
  }
}
