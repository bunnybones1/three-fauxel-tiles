import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { CardinalStrings, makeGround } from '../../../src/meshes/factoryGround'
import NamedBitsInNumber from '../../../src/helpers/utils/NamedBitsInNumber'

export default class TestModel2Scene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const bits = new NamedBitsInNumber(0, CardinalStrings)
    bits.enableBit('n')
    bits.enableBit('ne')
    bits.enableBit('e')
    bits.enableBit('s')
    bits.enableBit('sw')
    bits.enableBit('w')
    const mesh = makeGround(getMeshMaterial('ground'), bits)

    mesh.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(mesh)
    UpdateManager.register({
      update(dt: number) {
        const time = performance.now() * 0.002
        const pingPong = time % 1
        const iCurrent =
          ~~(pingPong * mesh.children.length) % mesh.children.length
        for (let i = 0; i < mesh.children.length; i++) {
          const m = mesh.children[i]
          m.visible = i === iCurrent
        }
        mesh.rotation.z += dt
      }
    })
    mesh.scale.multiplyScalar(0.01)
  }
}
