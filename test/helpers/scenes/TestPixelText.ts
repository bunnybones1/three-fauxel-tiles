import { PerspectiveCamera, WebGLRenderer } from 'three'
import PixelTextMesh from 'three-pixel-font'
import { loadText } from '~/loaders/assetLoader'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import BaseTestScene from './BaseTestScene'

function url(name: string, ext: string) {
  return `books/${name}.${ext}`
}

export default class TestPixelTextScene extends BaseTestScene {
  constructor() {
    super()
    this.camera.position.set(0, 0, 0.5)
    this.camera.lookAt(0, 0, 0)
    // this.camera.updateProjectionMatrix()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    // const s = 1

    // const hello = new PixelTextMesh(' ABC \n 010 \n ntz \n "#% \n { } \n0ANan')
    // // const hello = new PixelTextMesh('This is the beginning!\nHello World!\nHello World!\nHello World!\nHello World!')
    // hello.scale.multiplyScalar(s)
    // this.scene.add(hello)

    const init = async () => {
      let bookText = 'Hello world.'
      bookText = await loadText(url('augustine-confessions-276', 'txt'))
      // bookText = '1.0\n1.0.3\n1.0.31\n1.0.3 1\n1 .0.3 1\n-.-.E.E-E'
      // bookText = '© Tomasz Dysinski. Here & now.'
      const book = new PixelTextMesh.PixelTextMesh(
        bookText,
        undefined,
        undefined,
        (w, h) => {
          book.scale.x = 0.01 * w
          book.scale.y = 0.01 * h
        }
      )
      book.position.set(-0.125, 0, 0)
      this.scene.add(book)
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
