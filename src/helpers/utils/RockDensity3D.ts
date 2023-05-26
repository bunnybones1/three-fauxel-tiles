import { unlerp, clamp } from '../../utils/math'
import IHelper3D from './IHelper3D'
import NoiseHelper3D from './NoiseHelper3D'
import Memoize3D from './Memoize3D'

export default class RockDensity3D implements IHelper3D {
  private _noiseHelper: IHelper3D
  constructor() {
    this._noiseHelper = new Memoize3D(new NoiseHelper3D(0.075))
  }
  getValue(x: number, y: number, z: number) {
    const sample = Math.abs(
      this._noiseHelper.getValue(x - z * 0.5, y, z) * 2 - 1
    )
    const sample2 = Math.abs(
      this._noiseHelper.getValue(x + z * 0.5, y + 9000, z + 1920) * 2 - 1
    )
    const minSample = Math.min(sample, sample2)
    // const density = sample
    // const gradient = clamp(unlerp(0, 10, z), 0, 1)
    const gradient = clamp(unlerp(0, 12, z), -0.1, 4)
    const density = minSample - gradient
    return density
  }
  invalidate(x: number, y: number, z: number) {
    // this._noiseHelper.invalidate(x, y, z)
  }
  setValue(x: number, y: number, z: number, value: number) {
    //
  }
}
