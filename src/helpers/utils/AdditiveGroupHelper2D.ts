import IHelper2D from './IHelper2D'

export default class AdditiveGroupHelper2D implements IHelper2D {
  private layers: IHelper2D[]
  constructor(private _layers: IHelper2D[]) {
    //
  }
  getValue(x: number, y: number) {
    let val = 0
    for (const noise of this._layers) {
      val += noise.getValue(x, y)
    }
    return val
  }
}
