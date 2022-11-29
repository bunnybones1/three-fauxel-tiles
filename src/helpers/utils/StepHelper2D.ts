import IHelper2D from './IHelper2D'

export default class StepHelper2D implements IHelper2D {
  constructor(private _helper: IHelper2D, private _thresh = 0) {
    //
  }
  getValue(x: number, y: number) {
    return this._helper.getValue(x, y) > this._thresh ? 1 : 0
  }
}
