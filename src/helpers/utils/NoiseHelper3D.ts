import { makeNoise3D } from 'fast-simplex-noise'
import { sfc32 } from '../../utils/random'
import IHelper3D from './IHelper3D'

export default class NoiseHelper3D implements IHelper3D {
  private _noise: (x: number, y: number, z: number) => number
  constructor(
    private _scale: number,
    private _offsetX = 0,
    private _offsetY = 0,
    private _offsetZ = 0,
    seed = 0,
    private _strength = 1,
    private _offset = 0
  ) {
    const randGenerator = sfc32(100 + seed, 200 + seed, 300 + seed, 444 + seed)
    this._noise = makeNoise3D(randGenerator)
  }
  getValue(x: number, y: number, z: number) {
    return (
      this._noise(
        x * this._scale + this._offsetX,
        y * this._scale + this._offsetY,
        z * this._scale + this._offsetZ
      ) *
        this._strength +
      this._offset
    )
  }
  invalidate(x: number, y: number, z: number) {
    //
  }
  setValue(x: number, y: number, z: number, value: number) {
    //
  }
}
