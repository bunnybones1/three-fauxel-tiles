import IHelper3D from './IHelper3D'

export default class UserWrite3D implements IHelper3D {
  private _memory = new Map<string, number>()
  getValue(x: number, y: number, z: number) {
    const key = `${x}:${y}:${z}`
    if (!this._memory.has(key)) {
      return -1
    }
    return this._memory.get(key)!
  }
  setValue(x: number, y: number, z: number, value: number) {
    const key = `${x}:${y}:${z}`
    this._memory.set(key, value)
  }
  invalidate(x: number, y: number, z: number) {
    const key = `${x}:${y}:${z}`
    if (this._memory.has(key)) {
      this._memory.delete(key)
    }
  }
}
