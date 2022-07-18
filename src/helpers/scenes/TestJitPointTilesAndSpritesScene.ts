import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from 'three'
import { clamp, lerp } from 'three/src/math/MathUtils'
import { initOffset } from '~/constants'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { getUrlFlag, getUrlInt } from '~/utils/location'
import { rand, rand2, wrap } from '~/utils/math'
import { detRandLights } from '~/utils/random'

import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'
import { MaterialPassType } from '../materials/materialLib'
import MapScrollingView from '../utils/MapScrollingView'

import { BaseTestScene } from './BaseTestScene'
import { LightController } from './mapCache/PointLightRenderer'
import { SpriteController } from './spriteMaker/JITSpriteSampler'

const __pixelsPerTile = getUrlInt('pixelsPerTile', 32)

class DummyController {
  constructor(
    public x: number,
    public y: number,
    public angle: number,
    private _maxSpeed = 0.4
  ) {
    //
  }
  angleDelta = 0
  speed = 0
  speedDelta = 0
  update() {
    this.angleDelta += rand2(0.03)
    this.angleDelta = clamp(this.angleDelta, -0.1, 0.1)
    this.angleDelta *= 0.99
    this.angle += this.angleDelta
    this.angle *= 0.99
    this.speedDelta += rand2(0.02)
    this.speedDelta = clamp(this.speedDelta, -0.02, 0.02)
    this.speedDelta *= 0.9
    this.speed += this.speedDelta
    this.speed = clamp(this.speed, 0, this._maxSpeed)
    this.speed *= 0.99
    const realSpeed = Math.max(0, this.speed - 0.2) * 0.5
    this.x += Math.cos(this.angle - Math.PI * 0.5) * realSpeed
    this.y += Math.sin(this.angle - Math.PI * 0.5) * realSpeed
  }
}

class DummyLightController extends DummyController {
  size: number
  z = 0.5
  private _sizePhase = detRandLights(0, Math.PI * 2)
  constructor(
    x: number,
    y: number,
    private _size: number,
    public color: Color,
    maxSpeed = 0
  ) {
    super(x, y, 0, maxSpeed)
    this.size = _size
  }
  update() {
    super.update()
    this._sizePhase += 1 / this._size
    this.x += 1 / this._size
    this.size =
      this._size * lerp(0.8, 1.2, Math.sin(this._sizePhase * 10) * 0.5 + 0.5)
    // this.z = lerp(0.3, 2, Math.sin(this._sizePhase * 0.3) * 0.5 + 0.5)
  }
}
export default class TestJitPointTilesAndSpritesScene extends BaseTestScene {
  mapCacheNeedsUpdate: boolean
  dirty = true
  protected _transform: Vector3
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
  private _mapScrollingView: MapScrollingView
  private _sprites: SpriteController[]
  private _spriteControllers: DummyController[]
  private _lights: LightController[]
  private _lightControllers: DummyLightController[]
  constructor() {
    super()

    const scene = this.scene
    const transform = getMouseBoundViewTransform()
    const viewWidth = getUrlInt('viewTiles', 16)
    const viewHeight = getUrlInt('viewTiles', 16)
    const pixelsPerTile = __pixelsPerTile
    const pixelsPerCacheEdge = 2048
    const clipspaceMode = !getUrlFlag('debugView')
    const passes: MaterialPassType[] = [
      // 'beauty',
      'customColor',
      'normals',
      'customEmissive',
      'customRoughnessMetalnessHeight',
      'customTopDownHeight'
    ]
    const mapScrollingView = new MapScrollingView(
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge,
      this._mapViewUvST,
      this._mapViewSubTilePixelOffsetUvST,
      clipspaceMode,
      passes
    )
    const spriteControllers: DummyController[] = []
    for (let i = 0; i < 1000; i++) {
      spriteControllers.push(
        new DummyController(rand2(20), rand2(20, 10), rand(-Math.PI, Math.PI))
      )
    }
    const sprites = spriteControllers.map((tc) =>
      mapScrollingView.jitSpriteSampler.makeSprite(tc.x, tc.y, tc.angle)
    )

    const lightControllers: DummyLightController[] = []
    const s = 20
    for (let i = 0; i < 1000; i++) {
      const color = new Color().setHSL(
        detRandLights(0, 100),
        detRandLights(0.5, 0.8),
        detRandLights(0.25, 0.5)
      )
      lightControllers.push(
        new DummyLightController(
          detRandLights(-s, s),
          detRandLights(-s, s + 10),
          detRandLights(64, 256),
          color
        )
      )
    }
    const lights = lightControllers.map((tc) =>
      mapScrollingView.pointLightRenderer.makeLight(
        tc.x,
        tc.y,
        0.5,
        tc.size,
        tc.color
      )
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
          map: mapScrollingView.mapWithSpritesCacheRenderer.mapCache.get(pass)!
            .texture
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
          map: mapScrollingView.spriteMaker.getTexture(pass)
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

    if (!clipspaceMode) {
      const pointLightMaterial = new MeshBasicMaterial({
        map: mapScrollingView.pointLightRenderer.texture,
        transparent: true,
        depthWrite: false
      })
      const pointLightPreview = new Mesh(
        new PlaneGeometry(0.5, 0.5, 1, 1),
        pointLightMaterial
      )
      pointLightPreview.rotation.x = Math.PI * -0.25
      pointLightPreview.scale.multiplyScalar(2)
      scene.add(pointLightPreview)
    }
    this._transform = transform
    this._mapScrollingView = mapScrollingView
    this._pixelsPerTile = pixelsPerTile

    this._viewWidth = viewWidth
    this._viewHeight = viewHeight
    this._spriteControllers = spriteControllers
    this._sprites = sprites
    this._lightControllers = lightControllers
    this._lights = lights
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
      this._mapScrollingView.offsetX = this._tilesOffset.x
      this._mapScrollingView.pointLightRenderer.offsetX = this._tilesOffset.x
    }
    this._mapViewUvST.z =
      (this._tilesOffset.x + this._pixelRemainder.x / this._pixelsPerTile) /
      this._viewWidth
    if (this._tilesOffsetPrevious.y !== this._tilesOffset.y) {
      this._mapScrollingView.offsetY = this._tilesOffset.y
      this._mapScrollingView.pointLightRenderer.offsetY = this._tilesOffset.y
    }
    this._mapViewUvST.w =
      (this._tilesOffset.y + this._pixelRemainder.y / this._pixelsPerTile) /
      this._viewHeight
    this._tilesOffsetPrevious.copy(this._tilesOffset)
    this._mapViewSubTilePixelOffsetUvST.z =
      this._pixelRemainder.x / this._pixelsPerTile / this._viewWidth
    this._mapViewSubTilePixelOffsetUvST.w =
      this._pixelRemainder.y / this._pixelsPerTile / this._viewHeight

    for (let i = 0; i < this._spriteControllers.length; i++) {
      const tc = this._spriteControllers[i]
      const s = this._sprites[i]
      tc.update()
      s.x = tc.x
      s.y = tc.y
      s.angle =
        (~~(wrap(tc.angle / (Math.PI * 2), 0, 1) * 16) / 16) * Math.PI * 2
    }
    for (let i = 0; i < this._lightControllers.length; i++) {
      const tc = this._lightControllers[i]
      const s = this._lights[i]
      tc.update()
      s.x = tc.x
      s.y = tc.y
      s.z = tc.z
      s.size = tc.size
    }
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._mapScrollingView.render(renderer, dt)
    super.render(renderer, dt)
  }
}
