import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { Object3D } from 'three'
import { wheelBarrowMaterialNames } from '../wheelBarrowMaterialNames'
import { makeWheelBarrow } from '../../../src/meshes/factoryWheelBarrow'

export default class TestModel6Scene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const pivot = new Object3D()
    const extra = 4
    const t = 4 * extra
    for (let i = 0; i < t; i++) {
      const mesh = makeWheelBarrow(
        getMeshMaterial(wheelBarrowMaterialNames.wood),
        getMeshMaterial(wheelBarrowMaterialNames.wood2),
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
