import IHelper3D from './IHelper3D'

export default class AverageStarKernal3D implements IHelper3D {
  constructor(private _helper: IHelper3D, private _distance = 1) {
    //
  }
  getValue(x: number, y: number, z: number) {
    const d = this._distance
    let value = this._helper.getValue(x, y, z)
    value += this._helper.getValue(x + d, y, z)
    value += this._helper.getValue(x - d, y, z)
    value += this._helper.getValue(x, y + d, z)
    value += this._helper.getValue(x, y - d, z)
    value += this._helper.getValue(x, y, z + d)
    value += this._helper.getValue(x, y, z - d)
    return value / 7
  }
  setValue(x: number, y: number, z: number, value: number) {
    //
  }
  invalidate(x: number, y: number, z: number) {
    //
  }
}
