import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { Object3D } from 'three'
import { makeTreePineStumpMature } from '../../../src/meshes/factoryTreePine'

export default class TestModel5Scene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const pivot = new Object3D()
    const mesh = makeTreePineStumpMature(
      getMeshMaterial('bark'),
      getMeshMaterial('wood')
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
        pivot.rotation.y += dt * 0.75
      }
    })
    pivot.scale.multiplyScalar(0.01)
  }
}
