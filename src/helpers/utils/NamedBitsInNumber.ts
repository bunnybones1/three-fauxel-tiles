const __masks32: number[] = []
for (let i = 0; i < 32; i++) {
  __masks32[i] = 1 << i
}

export default class NamedBitsInNumber<T extends readonly string[]> {
  constructor(public value: number, private _names: T) {}
  enableBit(name: T[number]) {
    this.value |= __masks32[this._names.indexOf(name)]
  }
  disableBit(name: T[number]) {
    this.value &= ~__masks32[this._names.indexOf(name)]
  }
  flipBit(name: T[number]) {
    this.value ^= __masks32[this._names.indexOf(name)]
  }
  has(name: T[number]) {
    return (this.value & __masks32[this._names.indexOf(name)]) !== 0
  }
  hasFast(mask: number) {
    return (this.value & mask) !== 0
  }
  hasAnyFast(masks: number[]) {
    return masks.reduce((v, i) => v || (this.value & i) !== 0, false)
  }
  makeFastMask(name: T[number]) {
    return __masks32[this._names.indexOf(name)]
  }
  makeFastMultiMask(names: T[number][]) {
    return names.reduce(
      (val, name) => val + __masks32[this._names.indexOf(name)],
      0
    )
  }
  toString() {
    return this.value.toString(16)
  }
  clone() {
    return new NamedBitsInNumber(this.value, this._names)
  }
}
