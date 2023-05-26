import IHelper3D from './IHelper3D'
import RockDensity3D from './RockDensity3D'
import UserWrite3D from './UserWrite3D'
import { wrapInMemoizedAverageBoxKernels } from './helper3DFactory'
import { TILES } from './tilesEnum'

export default class LandscapeTileIndexRaw3D implements IHelper3D {
  private _rockDensityHelper: IHelper3D
  private _dirtHelper: IHelper3D
  private _userTiles: UserWrite3D
  constructor() {
    this._rockDensityHelper = new RockDensity3D()
    this._dirtHelper = wrapInMemoizedAverageBoxKernels(
      this._rockDensityHelper,
      [1, 3]
    )
    this._userTiles = new UserWrite3D()
  }

  getValue(x: number, y: number, z: number) {
    const userVal = this._userTiles.getValue(x, y, z)
    if (userVal !== -1) {
      return userVal
    }
    const rockDensity = this._rockDensityHelper.getValue(x, y, z)
    const rockDensityAbove = this._rockDensityHelper.getValue(x, y, z + 1)
    const dirtDensity = this._dirtHelper.getValue(x, y, z)

    if (rockDensity === 0) return TILES.EMPTY
    if (rockDensity > 0.5) {
      if (rockDensityAbove > 0.5 || z < 20) {
        return TILES.STONE
      } else {
        return TILES.SNOW
      }
    } else if (dirtDensity > 0.05) {
      return TILES.DIRT
    }
    if (z < 7) {
      return TILES.WATER
    }
    return TILES.EMPTY
  }
  invalidate(x: number, y: number, z: number) {
    // this._rockDensityHelper.invalidate(x, y, z)
    // this._rockDensityHelper.invalidate(x, y, z+1)
    // this._dirtHelper.invalidate(x, y, z)
  }
  setValue(x: number, y: number, z: number, value: number) {
    this._userTiles.setValue(x, y, z, value)
  }
}
