import { getMeshMaterial } from '../../../src/helpers/materials/materialLib'
import TestLightingScene from './TestLighting'
import UpdateManager from '../../utils/UpdateManager'
import renderer from '../../renderer'
import { Object3D } from 'three'
import { makeWater } from '../../../src/meshes/factoryWater'

export default class TestModelScene extends TestLightingScene {
  constructor() {
    super(false)
    renderer.shadowMap.enabled = true

    const mesh = new Object3D()
    const total = 32
    const variations: number[] = []
    for (let i = 0; i < total; i++) {
      variations.push(i / total)
    }
    variations
      .map((v) => makeWater(getMeshMaterial('water'), 0.125, v))
      .forEach((m) => mesh.add(m))

    mesh.traverse((n) => {
      n.castShadow = true
      n.receiveShadow = true
    })
    this.scene.add(mesh)
    UpdateManager.register({
      update(dt: number) {
        const time = performance.now() * 0.002
        const pingPong = time % 1
        // const pingPong = Math.abs((time % 2) - 1)
        const iCurrent =
          ~~(pingPong * mesh.children.length) % mesh.children.length
        for (let i = 0; i < mesh.children.length; i++) {
          const m = mesh.children[i]
          m.visible = i === iCurrent
        }
        mesh.rotation.y += dt
      }
    })
    mesh.scale.multiplyScalar(0.01)
  }
}
