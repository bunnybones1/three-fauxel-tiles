import { unlerp, clamp } from '../../utils/math'
import IHelper3D from './IHelper3D'
import NoiseHelper3D from './NoiseHelper3D'
import Memoize3D from './Memoize3D'

export default class LandscapeDensity3D implements IHelper3D {
  private _noiseHelper: IHelper3D
  constructor() {
    this._noiseHelper = new Memoize3D(new NoiseHelper3D(0.1))
  }
  getValue(x: number, y: number, z: number) {
    const sample = this._noiseHelper.getValue(x, y, z)
    const density = clamp(sample + unlerp(8, 0, z) + 0.8, 0, 1)
    return density
  }
}
