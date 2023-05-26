import AverageBoxKernal3D from './AverageBoxKernel3D'
import AverageStarKernal3D from './AverageStarKernel3D'
import IHelper3D from './IHelper3D'
import Memoize3D from './Memoize3D'
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

export function wrapInMemoizedAverageStarKernels(
  core: IHelper3D,
  distances: number[]
) {
  let cursor = core
  for (let i = 0; i < distances.length; i++) {
    cursor = new Memoize3D(new AverageStarKernal3D(cursor, distances[i]))
  }
  return cursor
}

export function wrapInMemoizedAverageBoxKernels(
  core: IHelper3D,
  distances: number[]
) {
  let cursor = core
  for (let i = 0; i < distances.length; i++) {
    cursor = new Memoize3D(new AverageBoxKernal3D(cursor, distances[i]))
  }
  return cursor
}
