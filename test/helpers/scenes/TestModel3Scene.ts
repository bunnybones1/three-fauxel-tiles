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
    const extra = 2
    const t = 4 * extra
    for (let i = 0; i < t; i++) {
      const mesh = makeSheep(
        getMeshMaterial('fleeceWhite'),
        getMeshMaterial('fleeceBlack'),
        getMeshMaterial('sheepNose'),
        getMeshMaterial('shinyBlack'),
        i / t
      )
      pivot.add(mesh)
    }

    pivot.rotation.y = Math.PI
    pivot.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(pivot)
    UpdateManager.register({
      update(dt: number) {
        const frameId =
          Math.floor(performance.now() * 0.005 * extra) % pivot.children.length
        for (let i = 0; i < pivot.children.length; i++) {
          pivot.children[i].visible = i === frameId
        }
        pivot.rotation.y += dt * 0.75
      }
    })
    pivot.scale.multiplyScalar(0.01)
  }
}
