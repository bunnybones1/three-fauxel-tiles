import { Mesh, SphereBufferGeometry } from 'three'
import { makeScoopMesh } from '~/helpers/utils/scoopMesh'
import { materialLibrary } from '~/materials/library'

import KeyButtonMesh from './ProceduralKeyboardMesh/KeyButtonMesh'

let universalCharRenderOrder = 13

export default class CharacterMesh extends KeyButtonMesh {
  constructor(w: number, h: number, label = '') {
    super(w, h, w, label, 0.01)
    const geo = new SphereBufferGeometry(0.045, 16, 8)
    const posArr = geo.attributes.position.array as number[]
    for (let i = 1; i < posArr.length; i += 3) {
      if (posArr[i] < 0) {
        posArr[i] = 0
      }
    }
    const undersideMesh = new Mesh(
      geo,
      materialLibrary.keyboardPlasticKeyUnderside
    )
    undersideMesh.receiveShadow = true
    undersideMesh.renderOrder = universalCharRenderOrder
    universalCharRenderOrder += 2
    undersideMesh.position.y = -h * 0.5 - 0.0001
    undersideMesh.rotation.y = (Math.PI * 2) / 32
    this.add(undersideMesh)
    makeScoopMesh(undersideMesh)

    this.castShadow = true
    this.receiveShadow = true
  }
}
