import IHelper3D from './IHelper3D'

export default class AverageBoxKernal3D implements IHelper3D {
  constructor(private _helper: IHelper3D, private _distance = 1) {
    //
  }
  getValue(x: number, y: number, z: number) {
    const d = this._distance
    const h = this._helper
    let value = 0

    value += h.getValue(x - d, y - d, z - d)
    value += h.getValue(x - d, y - d, z)
    value += h.getValue(x - d, y - d, z + d)

    value += h.getValue(x - d, y, z - d)
    value += h.getValue(x - d, y, z)
    value += h.getValue(x - d, y, z + d)

    value += h.getValue(x - d, y + d, z - d)
    value += h.getValue(x - d, y + d, z)
    value += h.getValue(x - d, y + d, z + d)

    //

    value += h.getValue(x, y - d, z - d)
    value += h.getValue(x, y - d, z)
    value += h.getValue(x, y - d, z + d)

    value += h.getValue(x, y, z - d)
    value += h.getValue(x, y, z)
    value += h.getValue(x, y, z + d)

    value += h.getValue(x, y + d, z - d)
    value += h.getValue(x, y + d, z)
    value += h.getValue(x, y + d, z + d)

    //

    value += h.getValue(x + d, y - d, z - d)
    value += h.getValue(x + d, y - d, z)
    value += h.getValue(x + d, y - d, z + d)

    value += h.getValue(x + d, y, z - d)
    value += h.getValue(x + d, y, z)
    value += h.getValue(x + d, y, z + d)

    value += h.getValue(x + d, y + d, z - d)
    value += h.getValue(x + d, y + d, z)
    value += h.getValue(x + d, y + d, z + d)
    return value / 27
  }

  invalidate(x: number, y: number, z: number) {
    const d = this._distance
    const h = this._helper

    h.invalidate(x - d, y - d, z - d)
    h.invalidate(x - d, y - d, z)
    h.invalidate(x - d, y - d, z + d)

    h.invalidate(x - d, y, z - d)
    h.invalidate(x - d, y, z)
    h.invalidate(x - d, y, z + d)

    h.invalidate(x - d, y + d, z - d)
    h.invalidate(x - d, y + d, z)
    h.invalidate(x - d, y + d, z + d)

    //

    h.invalidate(x, y - d, z - d)
    h.invalidate(x, y - d, z)
    h.invalidate(x, y - d, z + d)

    h.invalidate(x, y, z - d)
    h.invalidate(x, y, z)
    h.invalidate(x, y, z + d)

    h.invalidate(x, y + d, z - d)
    h.invalidate(x, y + d, z)
    h.invalidate(x, y + d, z + d)

    //

    h.invalidate(x + d, y - d, z - d)
    h.invalidate(x + d, y - d, z)
    h.invalidate(x + d, y - d, z + d)

    h.invalidate(x + d, y, z - d)
    h.invalidate(x + d, y, z)
    h.invalidate(x + d, y, z + d)

    h.invalidate(x + d, y + d, z - d)
    h.invalidate(x + d, y + d, z)
    h.invalidate(x + d, y + d, z + d)
  }
  setValue(x: number, y: number, z: number, value: number) {
    //
  }
}
