import { Mesh, Vector4, WebGLRenderer } from 'three'
import { BasicTextureMaterial } from '../../materials/BasicTextureMaterial'
import { FauxelMaterial } from '../../materials/FauxelMaterial'
import { MaterialPassType } from '../materials/materialLib'
import NoiseTextureMaker from '../NoiseTextureMaker'
import SpriteMaker from '../../rendering/tileMaker/spriteMaker/SpriteMaker'

import JITTileSampler from '../../rendering/tileMaker/mapTileMaker/JITTileSampler'
import JITSpriteSampler from '../../rendering/tileMaker/spriteMaker/JITSpriteSampler'
import MapCacheRenderer from '../../mapCache/MapCacheRenderer'
import MapTileMaker from '../../rendering/tileMaker/mapTileMaker/MapTileMaker'
import { sunOffset, sunSpeed } from '../../constants'

import MapWithSpritesCacheRenderer from '../../mapCache/MapWithSpritesCacheRenderer'
import PointLightRenderer from '../../mapCache/PointLightRenderer'
import { getSharedRectangleGeometry } from '../../../test/utils/geometry'
export default class MapScrollingView {
  tileMaker: MapTileMaker
  spriteMaker: SpriteMaker
  jitTileSampler: JITTileSampler
  jitSpriteSampler: JITSpriteSampler
  mapCacheRenderer: MapCacheRenderer
  mapWithSpritesCacheRenderer: MapWithSpritesCacheRenderer
  pointLightRenderer: PointLightRenderer
  private _dirty = true
  mapCachePassViews: Mesh[]
  private _noiseMaker: NoiseTextureMaker
  mapCacheFinalView: Mesh
  private _noiseReady: boolean
  areLightsVisible: boolean
  private _mapScrollingViewMaterial: FauxelMaterial
  public get offsetX(): number {
    return this.jitTileSampler.offsetX
  }
  public set offsetX(value: number) {
    this.jitTileSampler.offsetX = value
    this.jitSpriteSampler.offsetX = value
    this.mapWithSpritesCacheRenderer.offsetX = value
  }
  public get offsetY(): number {
    return this.jitTileSampler.offsetY
  }
  public set offsetY(value: number) {
    this.jitTileSampler.offsetY = value
    this.jitSpriteSampler.offsetY = value
    this.mapWithSpritesCacheRenderer.offsetY = value
  }
  constructor(
    viewWidth = 16,
    viewHeight = 16,
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    mapViewUvST?: Vector4,
    mapViewSubTilePixelOffsetUvST?: Vector4,
    clipspaceMode = true,
    passes?: MaterialPassType[]
  ) {
    const tileMaker = new MapTileMaker(
      pixelsPerTile,
      pixelsPerCacheEdge,
      passes
    )
    const spriteMaker = new SpriteMaker(
      pixelsPerTile,
      pixelsPerCacheEdge,
      passes
    )
    const jitTileSampler = new JITTileSampler(tileMaker, viewWidth, viewHeight)
    const jitSpriteSampler = new JITSpriteSampler(
      spriteMaker,
      pixelsPerTile,
      viewWidth,
      viewHeight
    )
    const mapCacheRenderer = new MapCacheRenderer(
      viewWidth,
      viewHeight,
      jitTileSampler,
      pixelsPerTile,
      pixelsPerCacheEdge
    )

    const mapWithSpritesCacheRenderer = new MapWithSpritesCacheRenderer(
      mapCacheRenderer,
      viewWidth,
      viewHeight,
      1024,
      jitSpriteSampler,
      pixelsPerTile,
      pixelsPerCacheEdge
    )
    const pointLightRenderer = new PointLightRenderer(
      mapWithSpritesCacheRenderer,
      viewWidth,
      viewHeight,
      1024,
      pixelsPerTile
    )
    const mapCachePassViews: Mesh[] = []
    for (const pass of tileMaker.passes) {
      const mapScrollingViewMaterial = new BasicTextureMaterial({
        texture: mapCacheRenderer.mapCache.get(pass)!.texture,
        uvST: mapViewUvST,
        clipspaceMode
      })
      const mapCacheView = new Mesh(
        getSharedRectangleGeometry(),
        mapScrollingViewMaterial
      )
      mapCachePassViews.push(mapCacheView)
    }
    this._noiseMaker = new NoiseTextureMaker()

    const mapScrollingViewMaterial = new FauxelMaterial({
      textureColor:
        mapWithSpritesCacheRenderer.mapCache.get('customColor')!.texture,
      textureNormals:
        mapWithSpritesCacheRenderer.mapCache.get('normals')!.texture,
      textureEmissive:
        mapWithSpritesCacheRenderer.mapCache.get('customEmissive')!.texture,
      textureRoughnessMetalnessHeight: mapWithSpritesCacheRenderer.mapCache.get(
        'customRoughnessMetalnessHeight'
      )!.texture,
      textureTopDownHeight: mapWithSpritesCacheRenderer.mapCache.get(
        'customTopDownHeight'
      )!.texture,
      texturePointLights: pointLightRenderer.texture,
      uvSTWorldOffset: mapViewUvST,
      uvST: mapViewSubTilePixelOffsetUvST,
      clipspaceMode,
      relativeTileSize: 1 / viewWidth,
      relativePixelSize: 1 / viewWidth / pixelsPerTile,
      pixelsPerTile,
      textureFog: this._noiseMaker.texture
    })
    const mapCacheFinalView = new Mesh(
      getSharedRectangleGeometry(),
      mapScrollingViewMaterial
    )

    this.spriteMaker = spriteMaker
    this.tileMaker = tileMaker
    this.jitTileSampler = jitTileSampler
    this.jitSpriteSampler = jitSpriteSampler
    this.mapCacheRenderer = mapCacheRenderer
    this.mapWithSpritesCacheRenderer = mapWithSpritesCacheRenderer
    this.pointLightRenderer = pointLightRenderer
    this.mapCachePassViews = mapCachePassViews
    this.mapCacheFinalView = mapCacheFinalView
    this._mapScrollingViewMaterial = mapScrollingViewMaterial
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._mapScrollingViewMaterial.setSunAngle(
      0.1 + performance.now() * sunSpeed + sunOffset * Math.PI * 2
    )
    if (!this._noiseReady) {
      this._noiseMaker.render(renderer)
      this._noiseReady = true
    }
    if (
      this.jitTileSampler.updateMeta() ||
      this._dirty ||
      this.jitTileSampler.offsetsDirty
    ) {
      this._dirty = false
      this.jitTileSampler.updateVis(
        this.mapCacheRenderer.tileBottomPointsGeo,
        this.mapCacheRenderer.tileTopPointsGeo
      )
      this.tileMaker.render(renderer)
      this.mapCacheRenderer.render(renderer)
      this.mapCacheRenderer.tileBottomPointsGeo.drawRange.count = 0
      this.mapCacheRenderer.tileTopPointsGeo.drawRange.count = 0
    }
    this.jitSpriteSampler.updateVis(
      this.mapWithSpritesCacheRenderer.spriteBottomPointsGeo,
      this.mapWithSpritesCacheRenderer.spriteTopPointsGeo
    )
    this.spriteMaker.render(renderer)
    this.mapWithSpritesCacheRenderer.render(renderer)
    this.areLightsVisible = this.pointLightRenderer.render(renderer)
  }
}
