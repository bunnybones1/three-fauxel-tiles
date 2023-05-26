import IHelper3D from './IHelper3D'

export default class BoxFilterHelper3D implements IHelper3D {
  constructor(
    private _helper: IHelper3D,
    private _minX = -16,
    private _maxX = 16,
    private _minY = _minX,
    private _maxY = _maxX,
    private _minZ = _minX,
    private _maxZ = _maxX
  ) {
    //
  }
  getValue(x: number, y: number, z: number) {
    if (
      x < this._minX ||
      x > this._maxX ||
      y < this._minY ||
      y > this._maxY ||
      z < this._minZ ||
      z > this._maxZ
    ) {
      return 0
    } else {
      return this._helper.getValue(x, y, z)
    }
  }
}
