import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'

let __tempTexture: DataTexture | undefined
export function getTempTexture() {
  if (!__tempTexture) {
    const s = 4
    const total = s * s * 4
    const data = new Uint8Array(total)
    for (let i = 0; i < total; i++) {
      data[i] = 0
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat, UnsignedByteType)
  }
  return __tempTexture!
}
