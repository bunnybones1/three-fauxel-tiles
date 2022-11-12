import NoiseHelper2D from './NoiseHelper2D'
import StephHelper2D from './StepHelper2D'

export function simpleThreshNoise(
  scale: number,
  offsetX: number,
  offsetY: number,
  thresh: number,
  seed?: number,
  strength?: number
) {
  return new StephHelper2D(
    new NoiseHelper2D(scale, offsetX, offsetY, seed, strength),
    thresh
  )
}
