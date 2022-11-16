import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { CardinalStrings, makeGround } from '../../../src/meshes/factoryGround'
import NamedBitsInNumber from '../../../src/helpers/utils/NamedBitsInNumber'
import { Object3D } from 'three'

export default class TestModel2Scene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const bits = new NamedBitsInNumber(0, CardinalStrings)
    // bits.enableBit('nw')
    // bits.enableBit('n')
    // bits.enableBit('ne')
    bits.enableBit('w')
    bits.enableBit('c')
    bits.enableBit('e')
    // bits.enableBit('sw')
    // bits.enableBit('s')
    // bits.enableBit('se')
    const pivot = new Object3D()
    const meshProto = makeGround(getMeshMaterial('ground'), bits)

    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        const mesh = meshProto.clone()
        mesh.position.x = ix * 32
        mesh.position.z = iy * 32
        pivot.add(mesh)
      }
    }
    pivot.position.y = 0.2
    pivot.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(pivot)
    UpdateManager.register({
      update(dt: number) {
        pivot.rotation.y += dt
      }
    })
    pivot.scale.multiplyScalar(0.01)
  }
}
