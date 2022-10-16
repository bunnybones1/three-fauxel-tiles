import { makeTreeMaple } from '../../../src/meshes/factoryTreeMaple'
import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'

export default class TestModelScene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const tree = makeTreeMaple(
      getMeshMaterial('barkMaple'),
      getMeshMaterial('leafMaple')
    )
    tree.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(tree)
    UpdateManager.register({
      update(dt: number) {
        tree.rotation.y += dt
      }
    })
    tree.scale.multiplyScalar(0.01)
  }
}
