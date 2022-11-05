import { Object3D } from 'three'
import { MaterialPassType } from '../../helpers/materials/materialLib'
import TileMaker from './TileMaker'
import { ceilPowerOfTwo } from 'three/src/math/MathUtils'

export default class DoubleCachedTileMaker extends TileMaker {
  protected _precacher: TileMaker
  constructor(
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    passes: MaterialPassType[] = ['beauty'],
    indexedMeshMakers: (() => Object3D)[]
  ) {
    super(pixelsPerTile, pixelsPerCacheEdge, passes, indexedMeshMakers)
    this._precacher = new TileMaker(
      pixelsPerTile,
      ceilPowerOfTwo(Math.sqrt(indexedMeshMakers.length)),
      passes,
      indexedMeshMakers
    )
  }
  getTileId(tileDescription: Uint8Array) {
    const uniqueVisuals = new Set()
    for (let j = 0; j < this._indexedMeshes.length; j++) {
      const jb = ~~(j / 8)
      const j8 = j % 8
      const shouldShow = !!(tileDescription[jb] & (1 << j8))
      if (shouldShow) {
        uniqueVisuals.add(j)
      }
    }
    // console.log('unique visual elements:', Array.from(uniqueVisuals).length)

    //prep precacher
    return super.getTileId(tileDescription)
  }
}
