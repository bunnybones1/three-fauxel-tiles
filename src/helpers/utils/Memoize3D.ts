import IHelper3D from './IHelper3D'

export default class Memoize3D implements IHelper3D {
  private _memory = new Map<string, number>()
  constructor(private _helper: IHelper3D) {
    //
  }
  getValue(x: number, y: number, z: number) {
    const key = `${x}:${y}:${z}`
    if (!this._memory.has(key)) {
      const sample = this._helper.getValue(x, y, z)
      this._memory.set(key, sample)
    }
    return this._memory.get(key)!
  }
  invalidate(x: number, y: number, z: number) {
    const key = `${x}:${y}:${z}`
    if (this._memory.has(key)) {
      this._memory.delete(key)
      this._helper.invalidate(x, y, z)
    }
  }
  setValue(x: number, y: number, z: number, value: number) {
    this.invalidate(x, y, z)
    this._helper.setValue(x, y, z, value)
  }
}
