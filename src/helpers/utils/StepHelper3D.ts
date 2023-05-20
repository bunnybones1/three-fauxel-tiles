import IHelper3D from './IHelper3D'

export default class StepHelper3D implements IHelper3D {
  constructor(private _helper: IHelper3D, private _thresh = 0) {
    //
  }
  getValue(x: number, y: number, z: number) {
    return this._helper.getValue(x, y, z) > this._thresh ? 1 : 0
  }
}
