import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute
} from 'three'
import { rand } from '~/utils/math'

export default class SpritesPointGeometry extends BufferGeometry {
  xyFrameAttr: Float32BufferAttribute
  idAttr: Float32BufferAttribute
  constructor(total: number) {
    super()
    const partsPerItem = 3
    const xyFrameArray = new Float32Array(total * partsPerItem)
    for (let i = 0; i < total; i++) {
      const i3 = i * 3
      xyFrameArray[i3] = rand(0, 1)
      xyFrameArray[i3 + 1] = rand(0, 1)
      xyFrameArray[i3 + 2] = ~~rand(0, 64)
    }

    const xyFrameAttr = new Float32BufferAttribute(
      xyFrameArray,
      partsPerItem,
      false
    )
    this.xyFrameAttr = xyFrameAttr
    this.setAttribute('xyFrame', xyFrameAttr)

    const idArray = new Float32Array(total)

    for (let i = 0; i < total; i++) {
      idArray[i] = rand(0, 1)
    }
    const idAttr = new Float32BufferAttribute(idArray, 1, false)
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
