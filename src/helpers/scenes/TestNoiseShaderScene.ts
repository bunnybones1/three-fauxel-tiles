import { Mesh, PlaneBufferGeometry, Vector4 } from 'three'
import { SimplexNoiseMaterial } from '~/materials/SimplexNoiseMaterial'

import BaseTest2DScene from './BaseTest2DScene'

export default class TestNoiseShaderScene extends BaseTest2DScene {
  uvST: Vector4
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    const uvST = new Vector4(1, 1, 0, 0)
    this.uvST = uvST
    const test = new Mesh(
      geo,
      new SimplexNoiseMaterial({
        uvST
      })
    )
    this.scene.add(test)
  }
}
