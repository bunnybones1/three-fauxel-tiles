import IHelper3D from './IHelper3D'

export default class InvertHelper3D implements IHelper3D {
  constructor(private _helper: IHelper3D) {
    //
  }
  getValue(x: number, y: number) {
    return 1 - this._helper.getValue(x, y, z)
  }
}
