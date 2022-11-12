import { clamp } from 'three/src/math/MathUtils'
import IHelper2D from './IHelper2D'

export default class ClampHelper2D implements IHelper2D {
  constructor(private _layer: IHelper2D, private _min = -1, private _max = 1) {
    //
  }
  getValue(x: number, y: number) {
    return clamp(this._layer.getValue(x, y), this._min, this._max)
  }
}
