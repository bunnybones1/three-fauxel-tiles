import { clamp } from 'three/src/math/MathUtils'
import IHelper3D from './IHelper3D'

export default class ClampHelper3D implements IHelper3D {
  constructor(private _layer: IHelper3D, private _min = -1, private _max = 1) {
    //
  }
  getValue(x: number, y: number) {
    return clamp(this._layer.getValue(x, y), this._min, this._max)
  }
}
