import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from 'three'
import { initOffset } from '~/constants'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { getUrlFlag, getUrlInt } from '~/utils/location'
import { wrap } from '~/utils/math'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'
import lib from '@lib/index'

import BaseTestScene from './BaseTestScene'
import JITTileSampler from './tileMaker/JITTileSampler'

const __pixelsPerTile = getUrlInt('pixelsPerTile', 32)
export default class TestJitPointTilesScene extends BaseTestScene {
  mapCacheNeedsUpdate: boolean
  dirty = true
  protected _transform: Vector3
  private _jitTileSampler: JITTileSampler
  private _pixelsOffset = new Vector2(
    initOffset.x * __pixelsPerTile,
    initOffset.y * __pixelsPerTile
  )
  private _tilesOffset = new Vector2(initOffset.x, initOffset.y)
  private _pixelRemainder = new Vector2()
  private _mapViewUvST = new Vector4(1, 1, 0, 0)
  private _mapViewSubTilePixelOffsetUvST = new Vector4(1, 1, 0, 0)
  private _tilesOffsetPrevious = new Vector2(initOffset.x, initOffset.y)
  private _arrowKeysDirection = getQuickKeyboardDirectionVector()
  private _pixelsPerTile: number
  private _viewWidth: number
  private _viewHeight: number
  private _mapScrollingView: lib.MapScrollingView
  constructor() {
    super()

    const scene = this.scene
    const transform = getMouseBoundViewTransform()
    const viewWidth = getUrlInt('viewTiles', 16)
    const viewHeight = getUrlInt('viewTiles', 16)
    const pixelsPerTile = __pixelsPerTile
    const pixelsPerCacheEdge = 2048
    const clipspaceMode = !getUrlFlag('debugView')
    const passes: string[] = [
      // 'beauty',
      'customColor',
      'normals',
      'customEmissive',
      'customRoughnessMetalnessHeight',
      'customTopDownHeight'
    ]
    const mapScrollingView = new lib.MapScrollingView(
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge,
      this._mapViewUvST,
      this._mapViewSubTilePixelOffsetUvST,
      clipspaceMode,
      passes
    )
    const allViews = clipspaceMode
      ? [mapScrollingView.mapCacheFinalView]
      : [mapScrollingView.mapCacheFinalView].concat(
          mapScrollingView.mapCachePassViews
        )
    for (let i = 0; i < allViews.length; i++) {
      const mapCacheView = allViews[i]
      mapCacheView.position.x = 0.5 + i * 0.1
      mapCacheView.position.y = 0.5 + i * -0.1
      mapCacheView.rotation.x = Math.PI * -0.25
      mapCacheView.scale.multiplyScalar(0.3)
      scene.add(mapCacheView)
    }

    if (!clipspaceMode) {
      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i]
        const mapCacheMaterial = new MeshBasicMaterial({
          map: mapScrollingView.mapCacheRenderer.mapCache.get(pass)!.texture
        })
        const mapCachePreview = new Mesh(
          new PlaneGeometry(0.5, 0.5, 1, 1),
          mapCacheMaterial
        )
        mapCachePreview.position.x = 0.5 + i * 0.1
        mapCachePreview.position.y = -0.5 + i * -0.1
        mapCachePreview.rotation.x = Math.PI * -0.25
        mapCachePreview.scale.multiplyScalar(1.2)
        scene.add(mapCachePreview)
      }
      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i]
        const tileCacheMaterial = new MeshBasicMaterial({
          map: mapScrollingView.tileMaker.getTexture(pass)
        })

        const tileCachePreview = new Mesh(
          new PlaneGeometry(0.5, 0.5, 1, 1),
          tileCacheMaterial
        )
        tileCachePreview.position.x = -1.1 + i * 0.1
        tileCachePreview.position.y = i * -0.1
        tileCachePreview.rotation.x = Math.PI * -0.25
        tileCachePreview.scale.multiplyScalar(2)
        scene.add(tileCachePreview)
      }
    }
    this._transform = transform
    this._mapScrollingView = mapScrollingView
    this._jitTileSampler = mapScrollingView.jitTileSampler
    this._pixelsPerTile = pixelsPerTile

    this._viewWidth = viewWidth
    this._viewHeight = viewHeight

    // setInterval(() => {
    //   const x = ~~rand(0, viewWidth)
    //   const y = ~~rand(0, viewHeight)
    //   mapScrollingView.jitTileSampler.flipMeta(
    //     ~~rand(0, viewWidth),
    //     ~~rand(0, viewHeight),
    //     'grass'
    //   )
    //   mapScrollingView.jitTileSampler.flipMeta(
    //     ~~rand(0, viewWidth),
    //     ~~rand(0, viewHeight),
    //     'floor'
    //   )
    //   mapScrollingView.jitTileSampler.flipMeta(x, y, 'bush')
    //   mapScrollingView.jitTileSampler.flipMeta(
    //     ~~rand(0, viewWidth),
    //     ~~rand(0, viewHeight),
    //     'beam'
    //   )
    //   // mapScrollingView.jitTileSampler.validateLocalMeta(x, y)
    //   mapScrollingView.jitTileSampler.flipMeta(
    //     ~~rand(0, viewWidth),
    //     ~~rand(0, viewHeight),
    //     'bricks'
    //   )
    // }, 500)
  }
  update(dt: number) {
    if (getUrlFlag('autoMove')) {
      const a = performance.now() * 0.002
      this._arrowKeysDirection.copy(
        new Vector2(Math.cos(a) * 3, Math.sin(a) * 3)
      )
    }
    this._pixelsOffset.add(
      this._arrowKeysDirection.clone().multiplyScalar(4 * 60 * dt)
    )
    this._tilesOffset.x = Math.floor(this._pixelsOffset.x / this._pixelsPerTile)
    this._tilesOffset.y = -Math.floor(
      this._pixelsOffset.y / this._pixelsPerTile
    )
    this._pixelRemainder.x = wrap(this._pixelsOffset.x, 0, this._pixelsPerTile)
    this._pixelRemainder.y = -wrap(this._pixelsOffset.y, 0, this._pixelsPerTile)
    if (this._tilesOffsetPrevious.x !== this._tilesOffset.x) {
      this._jitTileSampler.offsetX = this._tilesOffset.x
    }
    this._mapViewUvST.z =
      (this._tilesOffset.x + this._pixelRemainder.x / this._pixelsPerTile) /
      this._viewWidth
    if (this._tilesOffsetPrevious.y !== this._tilesOffset.y) {
      this._jitTileSampler.offsetY = this._tilesOffset.y
    }
    this._mapViewUvST.w =
      (this._tilesOffset.y + this._pixelRemainder.y / this._pixelsPerTile) /
      this._viewHeight
    this._mapViewSubTilePixelOffsetUvST.z =
      this._pixelRemainder.x / this._pixelsPerTile / this._viewWidth
    this._mapViewSubTilePixelOffsetUvST.w =
      this._pixelRemainder.y / this._pixelsPerTile / this._viewHeight
    this._tilesOffsetPrevious.copy(this._tilesOffset)
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._mapScrollingView.render(renderer, dt)
    super.render(renderer, dt)
  }
}
