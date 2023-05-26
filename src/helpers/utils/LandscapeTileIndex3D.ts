/* eslint-disable no-fallthrough */
import IHelper3D from './IHelper3D'
import { TILES } from './tilesEnum'
import LandscapeTileIndexIntermediate3D from './LandscapeTileIndexIntermediate3D'
import Memoize3D from './Memoize3D'

export default class LandscapeTileIndex3D implements IHelper3D {
  private _tileHelper: IHelper3D
  constructor() {
    this._tileHelper = new Memoize3D(new LandscapeTileIndexIntermediate3D())
  }
  getValue(x: number, y: number, z: number) {
    const h = this._tileHelper
    const tile = h.getValue(x, y, z)
    switch (tile) {
      case TILES.STONE:
        const wcc1r = h.getValue(x - 1, y, z)
        const ecc1r = h.getValue(x + 1, y, z)
        const cnc1r = h.getValue(x, y + 1, z)
        const csc1r = h.getValue(x, y - 1, z)
        const ccu1r = h.getValue(x, y, z + 1)
        const ccd1r = h.getValue(x, y, z - 1)
        const wcc1b = wcc1r >= TILES.STONEBIG_WSU && wcc1r <= TILES.STONEBIG_CNU
        const ecc1b = ecc1r >= TILES.STONEBIG_WSU && ecc1r <= TILES.STONEBIG_CNU
        const cnc1b = cnc1r >= TILES.STONEBIG_WSU && cnc1r <= TILES.STONEBIG_CNU
        const csc1b = csc1r >= TILES.STONEBIG_WSU && csc1r <= TILES.STONEBIG_CNU
        const ccu1b = ccu1r >= TILES.STONEBIG_WSU && ccu1r <= TILES.STONEBIG_CNU
        const ccd1b = ccd1r >= TILES.STONEBIG_WSU && ccd1r <= TILES.STONEBIG_CNU
        const wcc1s = wcc1r === TILES.STONE
        const ecc1s = ecc1r === TILES.STONE
        const cnc1s = cnc1r === TILES.STONE
        const csc1s = csc1r === TILES.STONE
        const ccu1s = ccu1r === TILES.STONE
        const ccd1s = ccd1r === TILES.STONE
        if (wcc1s && ecc1s) {
          return TILES.STONEROD_EW_C
        } else if (cnc1s && csc1s) {
          return TILES.STONEROD_NS_C
        } else if (ccu1s && ccd1s) {
          return TILES.STONEROD_UD_C
        } else if (wcc1b) {
          return TILES.STONEROD_EW_NUB
        } else if (cnc1b) {
          return TILES.STONEROD_NS_NUB
        } else if (ccd1b) {
          return TILES.STONEROD_UD_NUB
        } else if (wcc1s) {
          return TILES.STONEROD_EW_E
        } else if (ecc1b || ecc1s) {
          return TILES.STONEROD_EW_W
        } else if (cnc1s) {
          return TILES.STONEROD_NS_S
        } else if (csc1b || csc1s) {
          return TILES.STONEROD_NS_N
        } else if (ccd1s) {
          return TILES.STONEROD_UD_U
        } else if (ccu1b || ccu1s) {
          return TILES.STONEROD_UD_D
        }
        return TILES.STONEROD_UD_NUB

      case TILES.EMPTY:
        const v = h.getValue(x, y, z - 1)
        if (
          v !== TILES.EMPTY &&
          v !== TILES.WATER &&
          v !== TILES.DIRTBIG_ENU &&
          v !== TILES.DIRTBIG_ECU &&
          v !== TILES.DIRTBIG_ESU &&
          v !== TILES.DIRTBIG_CSU &&
          v !== TILES.DIRTBIG_WSU &&
          v !== TILES.DIRTBIG_WCU &&
          v !== TILES.DIRTBIG_WNU &&
          v !== TILES.DIRTBIG_CNU &&
          v !== TILES.GRASSYDIRTBIG_ENU &&
          v !== TILES.GRASSYDIRTBIG_ECU &&
          v !== TILES.GRASSYDIRTBIG_ESU &&
          v !== TILES.GRASSYDIRTBIG_CSU &&
          v !== TILES.GRASSYDIRTBIG_WSU &&
          v !== TILES.GRASSYDIRTBIG_WCU &&
          v !== TILES.GRASSYDIRTBIG_WNU &&
          v !== TILES.GRASSYDIRTBIG_CNU &&
          (x * 113 + y * 45 + z * 17) % 19 === 0
        ) {
          switch (Math.abs(x + y) % 3) {
            case 0:
              return TILES.BALL
            case 1:
              return TILES.GRAVEHEADSTONE
            default:
              return TILES.SHRUBDRIED
          }
        }
      default:
        return tile
    }
  }
  invalidate(x: number, y: number, z: number) {
    const h = this._tileHelper
    h.invalidate(x, y, z)
    h.invalidate(x - 1, y, z)
    h.invalidate(x + 1, y, z)
    h.invalidate(x, y + 1, z)
    h.invalidate(x, y - 1, z)
    h.invalidate(x, y, z + 1)
    h.invalidate(x, y, z - 1)
  }
  setValue(x: number, y: number, z: number, value: number) {
    this._tileHelper.setValue(x, y, z, value)
  }
}
