import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute
} from 'three'
import { rand } from '../utils/math'

export default class SpritesPointGeometry extends BufferGeometry {
  xyzAttr: Float32BufferAttribute
  idAttr: Float32BufferAttribute
  constructor(total: number) {
    super()
    const partsPerItem = 4
    const xyzArray = new Float32Array(total * partsPerItem)
    for (let i = 0; i < total; i++) {
      const i3 = i * 3
      xyzArray[i3] = rand(0, 1)
      xyzArray[i3 + 1] = rand(0, 1)
      xyzArray[i3 + 2] = 0
    }

    const xyzAttr = new Float32BufferAttribute(xyzArray, partsPerItem, false)
    this.xyzAttr = xyzAttr
    this.setAttribute('xyz', xyzAttr)

    const idArray = new Uint16Array(total)

    for (let i = 0; i < total; i++) {
      idArray[i] = rand(0, 1)
    }
    const idAttr = new Uint16BufferAttribute(idArray, 1, false)
    this.idAttr = idAttr
    this.setAttribute('id', idAttr)

    const indices = new Uint16Array(total)
    for (let i = 0; i < total; i++) {
      indices[i] = i
    }
    const indexBufferAttr = new Uint16BufferAttribute(indices, 1, false)
    this.setIndex(indexBufferAttr)
  }
}
