import IHelper3D from './IHelper3D'

export default class AdditiveGroupHelper3D implements IHelper3D {
  private layers: IHelper3D[]
  constructor(private _layers: IHelper3D[]) {
    //
  }
  getValue(x: number, y: number) {
    let val = 0
    for (const noise of this._layers) {
      val += noise.getValue(x, y, z)
    }
    return val
  }
}
