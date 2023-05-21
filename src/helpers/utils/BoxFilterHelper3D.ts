import IHelper3D from './IHelper3D'

export default class BoxFilterHelper3D implements IHelper3D {
  constructor(
    private _helper: IHelper3D,
    private _minX = -16,
    private _maxX = 16,
    private _minY = _minX,
    private _maxY = _maxX
  ) {
    //
  }
  getValue(x: number, y: number) {
    if (x < this._minX || x > this._maxX || y < this._minY || y > this._maxY) {
      return 0
    } else {
      return this._helper.getValue(x, y)
    }
  }
}