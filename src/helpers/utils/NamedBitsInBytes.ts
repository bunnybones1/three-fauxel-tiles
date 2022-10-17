function i2hex(i) {
  return ('0' + i.toString(16)).slice(-2)
}

const __masks8: number[] = []
for (let i = 0; i < 8; i++) {
  __masks8[i] = 1 << i
}

export default class NamedBitsInBytes<T extends readonly string[]> {
  constructor(public bytes: Uint8Array, private _names: T) {}
  enableBit(name: T[number]) {
    const i = this._names.indexOf(name)
    const ib = ~~(i / 8)
    const i8 = i % 8
    this.bytes[ib] |= __masks8[i8]
  }
  disableBit(name: T[number]) {
    const i = this._names.indexOf(name)
    const ib = ~~(i / 8)
    const i8 = i % 8
    this.bytes[ib] &= ~__masks8[i8]
  }
  flipBit(name: T[number]) {
    const i = this._names.indexOf(name)
    const ib = ~~(i / 8)
    const i8 = i % 8
    this.bytes[ib] ^= __masks8[i8]
  }
  toString() {
    return this.bytes.reduce((memo, i) => memo + i2hex(i), '')
  }
}
