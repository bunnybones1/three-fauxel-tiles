import {
  AdditiveBlending,
  Color,
  RawShaderMaterial,
  Texture,
  Uniform,
  Vector2
} from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { assertPowerOfTwo } from '~/utils/math'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export interface PointLightPointMaterialParameters {
  viewWidth: number
  viewHeight: number
  pixelsPerTile: number
  relativeTileSize: number
  relativePixelSize: number
  pixelsPerCacheEdge: number
  mapCacheColorsTexture: Texture
  mapCacheNormalsTexture: Texture
  mapCacheRoughnessMetalnessHeightTexture: Texture
  mapCacheDepthTopDownTexture: Texture
  z: number
}

const __defaultParams: PointLightPointMaterialParameters = {
  mapCacheColorsTexture: getTempTexture(),
  mapCacheNormalsTexture: getTempTexture(),
  mapCacheRoughnessMetalnessHeightTexture: getTempTexture(),
  mapCacheDepthTopDownTexture: getTempTexture(),
  viewWidth: 1024,
  viewHeight: 1024,
  pixelsPerTile: 32,
  relativeTileSize: 1 / 16, //one over the number of tiles in view
  relativePixelSize: 1 / 512, //one over the number of pixels in view
  pixelsPerCacheEdge: 2048,
  z: 0
}

export class PointLightPointMaterial extends RawShaderMaterial {
  constructor(options: Partial<PointLightPointMaterialParameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    assertPowerOfTwo(params.pixelsPerTile)
    assertPowerOfTwo(params.pixelsPerCacheEdge)
    const uTextureColorsMapCache = new Uniform(params.mapCacheColorsTexture)
    const uTextureNormalsMapCache = new Uniform(params.mapCacheNormalsTexture)
    const uTextureRoughnessMetalnessHeightMapCache = new Uniform(
      params.mapCacheRoughnessMetalnessHeightTexture
    )
    const uTextureDepthTopDownMapCache = new Uniform(
      params.mapCacheDepthTopDownTexture
    )

    const uniforms: { [key: string]: Uniform } = {
      uColor: new Uniform(new Color(1.0, 0.9, 0.8)),
      uTextureColorsMapCache,
      uTextureNormalsMapCache,
      uTextureRoughnessMetalnessHeightMapCache,
      uTextureDepthTopDownMapCache,
      uViewRes: new Uniform(new Vector2(params.viewWidth, params.viewHeight)),
      z: new Uniform(params.z)
    }

    const defines: { [key: string]: boolean | string | number } = {
      PIXELS_PER_TILE: params.pixelsPerTile.toFixed(1),
      RELATIVE_TILE_SIZE: params.relativeTileSize,
      RELATIVE_PIXEL_SIZE: params.relativePixelSize,
      RELATIVE_TILE_PIXEL_SIZE:
        params.relativePixelSize / params.relativeTileSize
    }

    defines.PIXEL_VIEW_RATIO = `vec2(${(1 / params.viewWidth).toFixed(6)}, ${(
      1 / params.viewHeight
    ).toFixed(6)})`
    super({
      uniforms,
      defines,
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
  }
}
