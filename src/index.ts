import JITTileSampler from './rendering/tileMaker/mapTileMaker/JITTileSampler'
import MapTileMaker from './rendering/tileMaker/mapTileMaker/MapTileMaker'
import MapScrollingView from './helpers/utils/MapScrollingView'
import TextureCachingScroller from './rendering/TextureCachingScroller'

import { BasicFullScreenMaterial } from './materials/BasicFullScreenMaterial'
import { SimplexNoiseMaterial } from './materials/SimplexNoiseMaterial'
import { BasicTextureMaterial } from './materials/BasicTextureMaterial'
import FibonacciSphereGeometry from './geometries/FibonacciSphereGeometry'
import { getMeshMaterial } from './helpers/materials/materialLib'
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
  materials: {
    BasicFullScreenMaterial,
    SimplexNoiseMaterial,
    BasicTextureMaterial
  }
}
