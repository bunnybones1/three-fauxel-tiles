import IHelper2D from './IHelper2D'

export default class InvertHelper2D implements IHelper2D {
  constructor(private _helper: IHelper2D) {
    //
  }
  getValue(x: number, y: number) {
    return 1 - this._helper.getValue(x, y)
  }
}
