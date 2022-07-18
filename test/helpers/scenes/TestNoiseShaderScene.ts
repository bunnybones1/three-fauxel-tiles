import { Mesh, PlaneBufferGeometry, Vector4 } from 'three'
import BaseTest2DScene from './BaseTest2DScene'
import lib from '@lib/index'

export default class TestNoiseShaderScene extends BaseTest2DScene {
  uvST: Vector4
  constructor() {
    super()

    const geo = new PlaneBufferGeometry(1, 1)
    const uvST = new Vector4(1, 1, 0, 0)
    this.uvST = uvST
    const test = new Mesh(
      geo,
      new lib.materials.SimplexNoiseMaterial({
        uvST
      })
    )
    this.scene.add(test)
  }
}
