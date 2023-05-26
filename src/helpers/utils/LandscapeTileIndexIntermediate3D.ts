/* eslint-disable no-fallthrough */
import IHelper3D from './IHelper3D'
import { TILES } from './tilesEnum'
import LandscapeTileIndexRaw3D from './LandscapeTileIndexRaw3D'
import Memoize3D from './Memoize3D'

export default class LandscapeTileIndexIntermediate3D implements IHelper3D {
  private _tileHelper: IHelper3D
  constructor() {
    this._tileHelper = new Memoize3D(new LandscapeTileIndexRaw3D())
  }
  getValue(x: number, y: number, z: number) {
    const h = this._tileHelper
    const tile = h.getValue(x, y, z)
    switch (tile) {
      case TILES.STONE:
        const wcc1 = h.getValue(x - 1, y, z) === TILES.STONE
        const ecc1 = h.getValue(x + 1, y, z) === TILES.STONE
        const cnc1 = h.getValue(x, y + 1, z) === TILES.STONE
        const csc1 = h.getValue(x, y - 1, z) === TILES.STONE
        const ccu1 = h.getValue(x, y, z + 1) === TILES.STONE
        const ccd1 = h.getValue(x, y, z - 1) === TILES.STONE
        if (wcc1 && ecc1 && csc1 && cnc1 && ccu1 && ccd1) {
          if (
            h.getValue(x - 1, y - 1, z + 1) &&
            h.getValue(x - 1, y + 1, z + 1) &&
            h.getValue(x + 1, y - 1, z + 1) &&
            h.getValue(x + 1, y + 1, z + 1)
          ) {
            return TILES.STONEINTERNAL
          }
        }
        if (wcc1 && ecc1 && ccu1 && ccd1 && !csc1) {
          return TILES.STONEBIG_CSC
        } else if (csc1 && cnc1 && ccu1 && ccd1 && !ecc1) {
          return TILES.STONEBIG_ECC
        } else if (wcc1 && ecc1 && csc1 && cnc1 && !ccu1) {
          return TILES.STONEBIG_CCU
        } else if (wcc1 && ecc1 && !csc1 && cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_CSU
        } else if (wcc1 && !ecc1 && csc1 && cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_ECU
        } else if (!wcc1 && ecc1 && !csc1 && cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_WSU
        } else if (wcc1 && !ecc1 && csc1 && !cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_ENU
        } else if (wcc1 && !ecc1 && !csc1 && cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_ESU
        } else if (!wcc1 && ecc1 && csc1 && !cnc1 && !ccu1 && ccd1) {
          return TILES.STONEBIG_WNU
        } else if (!wcc1 && ecc1 && !csc1 && ccu1 && ccd1) {
          return TILES.STONEBIG_WSC
        } else if (!ecc1 && csc1 && !cnc1 && ccu1 && ccd1) {
          return TILES.STONEBIG_ENC
        } else if (wcc1 && !ecc1 && cnc1 && !csc1 && ccu1 && ccd1) {
          return TILES.STONEBIG_ESC
        } else if (!wcc1 && ecc1 && !csc1 && ccu1 && !ccd1) {
          return TILES.STONEBIG_WSD
        } else if (wcc1 && !ecc1 && !csc1 && cnc1 && ccu1 && !ccd1) {
          return TILES.STONEBIG_ESD
        } else if (wcc1 && !ecc1 && csc1 && !cnc1 && ccu1 && !ccd1) {
          return TILES.STONEBIG_END
        } else if (wcc1 && !ecc1 && csc1 && cnc1 && ccu1 && !ccd1) {
          return TILES.STONEBIG_ECD
        } else if (wcc1 && ecc1 && !csc1 && cnc1 && ccu1 && !ccd1) {
          return TILES.STONEBIG_CSD
        }
        // if (h.getValue(x, y, z + 1) === TILES.SNOW) {
        //   return TILES.ICYSTONE
        // } else if (h.getValue(x, y, z + 1) === TILES.DIRT) {
        //   return TILES.STONEUNDERDIRT
        // }
        return tile
      case TILES.DIRT:
        const wcc2r = h.getValue(x - 1, y, z)
        const ecc2r = h.getValue(x + 1, y, z)
        const cnc2r = h.getValue(x, y + 1, z)
        const csc2r = h.getValue(x, y - 1, z)
        const ccu2r = h.getValue(x, y, z + 1)
        const ccd2r = h.getValue(x, y, z - 1)

        if (
          wcc2r === TILES.WATER ||
          ecc2r === TILES.WATER ||
          cnc2r === TILES.WATER ||
          csc2r === TILES.WATER ||
          ccu2r === TILES.WATER
        ) {
          return TILES.SAND
        }

        const wcc2 = wcc2r === TILES.DIRT || wcc2r === TILES.WATER
        const ecc2 = ecc2r === TILES.DIRT || ecc2r === TILES.WATER
        const cnc2 = cnc2r === TILES.DIRT || cnc2r === TILES.WATER
        const csc2 = csc2r === TILES.DIRT || csc2r === TILES.WATER
        const ccu2 = ccu2r === TILES.DIRT
        const ccd2 = ccd2r !== TILES.EMPTY

        let grassy = true
        for (let i = 1; i < 10; i++) {
          if (h.getValue(x, y, z + i) !== TILES.EMPTY) {
            grassy = false
            break
          }
        }
        if (wcc2 && ecc2 && csc2 && cnc2 && ccu2 && ccd2) {
          return TILES.DIRTINTERNAL
        } else if (wcc2 && ecc2 && ccu2 && ccd2 && !csc2) {
          return grassy ? TILES.GRASSYDIRTBIG_CSC : TILES.DIRTBIG_CSC
        } else if (csc2 && cnc2 && ccu2 && ccd2 && !ecc2) {
          return grassy ? TILES.GRASSYDIRTBIG_ECC : TILES.DIRTBIG_ECC
        } else if (wcc2 && ecc2 && csc2 && cnc2 && !ccu2) {
          return grassy ? TILES.GRASSYDIRTBIG_CCU : TILES.DIRTBIG_CCU
        } else if (wcc2 && ecc2 && !csc2 && cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_CSU : TILES.DIRTBIG_CSU
        } else if (wcc2 && !ecc2 && csc2 && cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ECU : TILES.DIRTBIG_ECU
        } else if (!wcc2 && ecc2 && !csc2 && cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_WSU : TILES.DIRTBIG_WSU
        } else if (wcc2 && !ecc2 && csc2 && !cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ENU : TILES.DIRTBIG_ENU
        } else if (wcc2 && !ecc2 && !csc2 && cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ESU : TILES.DIRTBIG_ESU
        } else if (!wcc2 && ecc2 && csc2 && !cnc2 && !ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_WNU : TILES.DIRTBIG_WNU
        } else if (!wcc2 && ecc2 && !csc2 && ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_WSC : TILES.DIRTBIG_WSC
        } else if (!ecc2 && csc2 && !cnc2 && ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ENC : TILES.DIRTBIG_ENC
        } else if (wcc2 && !ecc2 && cnc2 && !csc2 && ccu2 && ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ESC : TILES.DIRTBIG_ESC
        } else if (!wcc2 && ecc2 && !csc2 && ccu2 && !ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_WSD : TILES.DIRTBIG_WSD
        } else if (wcc2 && !ecc2 && !csc2 && cnc2 && ccu2 && !ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ESD : TILES.DIRTBIG_ESD
        } else if (wcc2 && !ecc2 && csc2 && !cnc2 && ccu2 && !ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_END : TILES.DIRTBIG_END
        } else if (wcc2 && !ecc2 && csc2 && cnc2 && ccu2 && !ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_ECD : TILES.DIRTBIG_ECD
        } else if (wcc2 && ecc2 && !csc2 && cnc2 && ccu2 && !ccd2) {
          return grassy ? TILES.GRASSYDIRTBIG_CSD : TILES.DIRTBIG_CSD
        }
        if (grassy) {
          return TILES.GRASSYDIRT
        }
        if (h.getValue(x, y, z + 1) === TILES.STONE) {
          return TILES.DIRTUNDERSTONE
        }
        return tile
      case TILES.WATER:
        if (h.getValue(x, y, z + 1) !== TILES.EMPTY) {
          return TILES.WATERINTERNAL
        }
        return tile
      default:
        return tile
    }
  }
  invalidate(x: number, y: number, z: number) {
    const h = this._tileHelper
    h.invalidate(x - 1, y - 1, z - 1)
    h.invalidate(x - 1, y - 1, z)
    h.invalidate(x - 1, y - 1, z + 1)
    h.invalidate(x - 1, y, z - 1)
    h.invalidate(x - 1, y, z)
    h.invalidate(x - 1, y, z + 1)
    h.invalidate(x - 1, y + 1, z - 1)
    h.invalidate(x - 1, y + 1, z)
    h.invalidate(x - 1, y + 1, z + 1)

    h.invalidate(x, y - 1, z - 1)
    h.invalidate(x, y - 1, z)
    h.invalidate(x, y - 1, z + 1)
    h.invalidate(x, y, z - 1)
    h.invalidate(x, y, z)
    h.invalidate(x, y, z + 1)
    h.invalidate(x, y + 1, z - 1)
    h.invalidate(x, y + 1, z)
    h.invalidate(x, y + 1, z + 1)

    h.invalidate(x + 1, y - 1, z - 1)
    h.invalidate(x + 1, y - 1, z)
    h.invalidate(x + 1, y - 1, z + 1)
    h.invalidate(x + 1, y, z - 1)
    h.invalidate(x + 1, y, z)
    h.invalidate(x + 1, y, z + 1)
    h.invalidate(x + 1, y + 1, z - 1)
    h.invalidate(x + 1, y + 1, z)
    h.invalidate(x + 1, y + 1, z + 1)
  }
  setValue(x: number, y: number, z: number, value: number) {
    this._tileHelper.setValue(x, y, z, value)
  }
}
