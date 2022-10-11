import { makeNoise2D } from 'fast-simplex-noise'
import { sfc32 } from '~/utils/random'

export default class NoiseHelper2D {
  private _noise: (x: number, y: number) => number
  constructor(
    private _scale: number,
    private _offsetX = 0,
    private _offsetY = 0,
    seed = 0,
    private _strength = 1
  ) {
    const randGenerator = sfc32(100 + seed, 200 + seed, 300 + seed, 444 + seed)
    this._noise = makeNoise2D(randGenerator)
  }
  getValue(x: number, y: number) {
    return this._noise(
      x * this._scale + this._offsetX,
      y * this._scale + this._offsetY
    ) * this._strength
  }
}
