import JITTileSampler from './rendering/tileMaker/mapTileMaker/JITTileSampler'
import MapTileMaker from './rendering/tileMaker/mapTileMaker/MapTileMaker'
import MapScrollingView from './helpers/utils/MapScrollingView'
import TextureCachingScroller from './rendering/TextureCachingScroller'

import { BasicFullScreenMaterial } from './materials/BasicFullScreenMaterial'
import { SimplexNoiseMaterial } from './materials/SimplexNoiseMaterial'
import { BasicTextureMaterial } from './materials/BasicTextureMaterial'
import FibonacciSphereGeometry from './geometries/FibonacciSphereGeometry'
import { getMeshMaterial } from './helpers/materials/materialLib'
import { PegboardMesh } from './helpers/meshes/PegboardMesh'
import LandscapeTileIndex3D from './helpers/utils/LandscapeTileIndex3D'
import Memoize3D from './helpers/utils/Memoize3D'
import { TILES } from './helpers/utils/tilesEnum'
import { LightController } from './mapCache/PointLightRenderer'
import { SpriteController } from './rendering/tileMaker/spriteMaker/JITSpriteSampler'
import { createMapCacheViewPlane } from './helpers/utils/createMapCacheViewPlane'
export default {
  MapTileMaker,
  JITTileSampler,
  MapScrollingView,
  TextureCachingScroller,
  geometry: {
    FibonacciSphereGeometry
  },
  helpers: {
    createMapCacheViewPlane
  },
  LightController,
  SpriteController,
  getMeshMaterial,
  PegboardMesh,
  LandscapeTileIndex3D,
  Memoize3D,
  TILES,
  materials: {
    BasicFullScreenMaterial,
    SimplexNoiseMaterial,
    BasicTextureMaterial
  }
}
