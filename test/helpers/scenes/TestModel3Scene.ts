import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { Object3D } from 'three'
import { makeSheep } from '../../../src/meshes/factorySheep'

export default class TestModel3Scene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const pivot = new Object3D()
    const mesh = makeSheep(
      getMeshMaterial('fleeceWhite'),
      getMeshMaterial('fleeceBlack'),
      getMeshMaterial('sheepNose'),
      getMeshMaterial('shinyBlack')
    )

    pivot.add(mesh)
    pivot.rotation.y = Math.PI
    pivot.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(pivot)
    UpdateManager.register({
      update(dt: number) {
        pivot.rotation.y += dt * 0.2
      }
    })
    pivot.scale.multiplyScalar(0.01)
  }
}
