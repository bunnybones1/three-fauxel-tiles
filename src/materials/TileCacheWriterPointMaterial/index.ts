import {
  Color,
  RawShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector4
} from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { assertPowerOfTwo } from '~/utils/math'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export interface TileCacheWriterPointMaterialParameters {
  color: Color
  tileTex: Texture
  viewWidth: number
  viewHeight: number
  pixelsPerTile: number
  pixelsPerCacheEdge: number
  mapDepthCacheTexture?: Texture
  mapDepthCacheUvST?: Vector4
  alternateDepthTileTex?: Texture
  depthSortByY?: boolean
  z: number
}

const __defaultParams: TileCacheWriterPointMaterialParameters = {
  color: new Color(1, 0, 0),
  tileTex: getTempTexture(),
  viewWidth: 1024,
  viewHeight: 1024,
  pixelsPerTile: 32,
  pixelsPerCacheEdge: 2048,
  z: 0
}

export class TileCacheWriterPointMaterial extends RawShaderMaterial {
  private _mapDepthCacheTextureUniform: Uniform
  public get mapDepthCacheTexture(): Texture {
    return this._mapDepthCacheTextureUniform.value
  }
  public set mapDepthCacheTexture(value: Texture) {
    this._mapDepthCacheTextureUniform.value = value
  }
  public get tileTexture(): Texture {
    return this._tileTexUniform.value
  }
  public set tileTexture(value: Texture) {
    this._tileTexUniform.value = value
  }
  public get alternateDepthTileTexture(): Texture {
    return this._alternateDepthTileTexUniform.value
  }
  public set alternateDepthTileTexture(value: Texture) {
    this._alternateDepthTileTexUniform.value = value
  }
  private _tileTexUniform: Uniform
  private _alternateDepthTileTexUniform: Uniform
  constructor(options: Partial<TileCacheWriterPointMaterialParameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    assertPowerOfTwo(params.pixelsPerTile)
    assertPowerOfTwo(params.pixelsPerCacheEdge)
    const uTileTex = new Uniform(params.tileTex)
    const alternateDepthTileTexUniform = new Uniform(
      params.alternateDepthTileTex || getTempTexture()
    )
    const uniforms: { [key: string]: Uniform } = {
      uColor: new Uniform(params.color),
      uTileTex,
      uViewRes: new Uniform(new Vector2(params.viewWidth, params.viewHeight)),
      z: new Uniform(params.z)
    }

    const defines: { [key: string]: boolean | string | number } = {
      PIXELS_PER_TILE: params.pixelsPerTile.toFixed(1),
      TILES_PER_CACHE_EDGE: (
        params.pixelsPerCacheEdge / params.pixelsPerTile
      ).toFixed(1)
    }
    const mapDepthCacheTextureUniform = new Uniform(params.mapDepthCacheTexture)
    if (params.mapDepthCacheTexture) {
      uniforms.uMapDepthCacheTexture = mapDepthCacheTextureUniform
      uniforms.uMapDepthCacheUvST = new Uniform(params.mapDepthCacheUvST)
      defines.DISCARD_BY_MAP_DEPTH_CACHE = true
      defines.TILE_VIEW_RATIO = `vec2(${(32 / params.viewWidth).toFixed(6)}, ${(
        32 / params.viewHeight
      ).toFixed(6)})`
      if (params.alternateDepthTileTex) {
        uniforms.uAlternateDepthTileTex = alternateDepthTileTexUniform
        defines.ALTERNATE_DEPTH_TILE = true
      }
    }
    if (params.depthSortByY) {
      defines.DEPTH_SORT_BY_Y = true
    }
    super({
      uniforms,
      defines,
      vertexShader,
      fragmentShader,
      // alphaTest: 0.5,
      // transparent: true,
      depthWrite: true,
      depthTest: true
    })
    this._tileTexUniform = uTileTex
    this._alternateDepthTileTexUniform = alternateDepthTileTexUniform
    this._mapDepthCacheTextureUniform = mapDepthCacheTextureUniform
  }
}
