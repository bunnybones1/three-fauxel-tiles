import NoiseHelper3D from './NoiseHelper3D'
import StephHelper3D from './StepHelper3D'

export function simpleThreshNoise(
  scale: number,
  offsetX: number,
  offsetY: number,
  offsetZ: number,
  thresh: number,
  seed?: number,
  strength?: number
) {
  return new StephHelper3D(
    new NoiseHelper3D(scale, offsetX, offsetY, offsetZ, seed, strength),
    thresh
  )
}
