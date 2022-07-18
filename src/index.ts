import JITTileSampler from './tileMaker/JITTileSampler'
import TileMaker from './tileMaker/TileMaker'
import MapScrollingView from './helpers/utils/MapScrollingView'
import TextureCachingScroller from './rendering/TextureCachingScroller'

import { BasicFullScreenMaterial } from './materials/BasicFullScreenMaterial'
import { SimplexNoiseMaterial } from './materials/SimplexNoiseMaterial'
import { BasicTextureMaterial } from './materials/BasicTextureMaterial'
import FibonacciSphereGeometry from './geometries/FibonacciSphereGeometry'
import { getMaterial } from './helpers/materials/materialLib'
import { LightController } from './mapCache/PointLightRenderer'
import { SpriteController } from './spriteMaker/JITSpriteSampler'

export default {
  TileMaker,
  JITTileSampler,
  MapScrollingView,
  TextureCachingScroller,
  geometry: {
    FibonacciSphereGeometry
  },
  LightController,
  SpriteController,
  getMaterial,
  materials: {
    BasicFullScreenMaterial,
    SimplexNoiseMaterial,
    BasicTextureMaterial
  }
}
