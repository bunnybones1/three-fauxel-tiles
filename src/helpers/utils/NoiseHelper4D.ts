import { makeNoise2D, makeNoise4D } from 'fast-simplex-noise'
import { sfc32 } from '../../utils/random'
import IHelper4D from './IHelper4D'

export default class NoiseHelper4D implements IHelper4D {
  private _noise: (x: number, y: number, z: number, w: number) => number
  constructor(
    private _scale: number,
    seed = 0,
    private _strength = 1,
    private _offset = 0
  ) {
    const randGenerator = sfc32(100 + seed, 200 + seed, 300 + seed, 444 + seed)
    this._noise = makeNoise4D(randGenerator)
  }
  getValue(x: number, y: number, z: number, w: number) {
    return (
      this._noise(
        x * this._scale,
        y * this._scale,
        z * this._scale,
        w * this._scale
      ) *
        this._strength +
      this._offset
    )
  }
}
