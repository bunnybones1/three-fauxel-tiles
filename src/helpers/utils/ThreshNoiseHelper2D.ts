import NoiseHelper2D from './NoiseHelper2D'

export default class ThreshNoiseHelper2D {
  static simple(
    scale: number,
    offsetX: number,
    offsetY: number,
    thresh: number,
    seed?: number,
    strength?: number
  ) {
    return new ThreshNoiseHelper2D(
      new NoiseHelper2D(scale, offsetX, offsetY, seed, strength),
      thresh
    )
  }
  private _noiseLayers: NoiseHelper2D[]
  constructor(
    noiseLayers: NoiseHelper2D[] | NoiseHelper2D,
    private _defaultThresh = 0
  ) {
    this._noiseLayers =
      noiseLayers instanceof NoiseHelper2D ? [noiseLayers] : noiseLayers
  }
  getValue(x: number, y: number) {
    let val = 0
    for (const noise of this._noiseLayers) {
      val += noise.getValue(x, y)
    }
    return val
  }
  getTreshold(x: number, y: number, thresh: number = this._defaultThresh) {
    return this.getValue(x, y) > thresh ? 1 : 0
  }
}
