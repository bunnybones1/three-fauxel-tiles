import {
  Color,
  GammaEncoding,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { clamp, lerp } from 'three/src/math/MathUtils'
import { initOffset } from '~/constants'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { getUrlFlag, getUrlInt } from '~/utils/location'
import { rand, rand2, wrap } from '~/utils/math'
import { detRandLights } from '~/utils/random'
import getKeyboardInput from '~/input/getKeyboardInput'
import { KeyboardCodes } from '~/utils/KeyboardCodes'

import lib from '@lib/index'
import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'

import BaseTestScene from './BaseTestScene'
import JITTileSampler from '../../../src/rendering/tileMaker/mapTileMaker/JITTileSampler'
import NamedBitsInNumber from '../../../src/helpers/utils/NamedBitsInNumber'
import { getUrlParam } from '../../utils/location'
import { removeFromArray } from '../../utils/arrayUtils'

const __pixelsPerTile = getUrlInt('pixelsPerTile', 32)

class DummyController {
  private _updaters: Array<(dt: number) => void> = []
  constructor(public x: number, public y: number, public angle: number) {
    //
  }
  addUpdater(updater: (dt: number) => void) {
    this._updaters.push(updater)
  }
  update(dt: number) {
    for (const updater of this._updaters) {
      updater.call(this, dt)
    }
  }
}

class DummyLightController {
  private _updaters: Array<(dt: number) => void> = []
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public color: Color,
    public size: number
  ) {
    //
  }
  addUpdater(updater: (dt: number) => void) {
    this._updaters.push(updater)
  }
  update(dt: number) {
    for (const updater of this._updaters) {
      updater.call(this, dt)
    }
  }
}

function makeWanderer(maxSpeed = 0.4, maxSpeedDelta = 0.02) {
  let angleDelta = 0
  let speed = 0
  let speedDelta = 0
  return function wanderer(dt: number) {
    angleDelta += rand2(0.03)
    angleDelta = clamp(angleDelta, -0.1, 0.1)
    angleDelta *= 0.99
    this.angle += angleDelta
    this.angle *= 0.99
    speedDelta += rand2(maxSpeedDelta)
    speedDelta = clamp(speedDelta, -maxSpeedDelta, maxSpeedDelta)
    speedDelta *= 0.9
    speed += speedDelta
    speed = clamp(speed, 0, maxSpeed)
    speed *= 0.99
    const realSpeed = Math.max(0, speed - 0.2) * 0.5
    this.x += Math.cos(this.angle - Math.PI * 0.5) * realSpeed
    this.y += Math.sin(this.angle - Math.PI * 0.5) * realSpeed
  }
}

function makeTileAvoider(metaTileSampler: JITTileSampler) {
  const tempSample = metaTileSampler.sampleMeta(0, 0)
  const fastSmallColliders = tempSample.makeFastMultiMask(['beam', 'lampPost'])

  const fastTrees = tempSample.makeFastMultiMask(['treePine', 'treeMaple'])
  const fastRocks = tempSample.makeFastMask('rocks')
  const fastBeam = tempSample.makeFastMask('beam')
  const fastHarvested = tempSample.makeFastMask('harvested')
  const fastMaturePlant = tempSample.makeFastMask('maturePlant')
  const fastMediumColliders = tempSample.makeFastMultiMask([
    'bricks',
    'bush',
    'testObject',
    'pyramid'
  ])
  const fastWater = tempSample.makeFastMask('water')
  const cardinalOffsets = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ]
  return function tileAvoider(dt: number) {
    const x = this.x
    const y = this.y
    const otx = Math.floor(x)
    const oty = Math.floor(y)
    let vDist = 0
    let vx = 0
    let vy = 0
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        const tx = otx + ix
        const ty = oty + iy
        const namedBits = metaTileSampler.sampleMeta(tx, ty)
        let size = 0
        if (
          namedBits.hasFast(fastSmallColliders) ||
          (namedBits.hasFast(fastTrees) &&
            namedBits.hasFast(fastHarvested) &&
            namedBits.hasFast(fastMaturePlant))
        ) {
          size = 0.35
          for (const co of cardinalOffsets) {
            if (
              metaTileSampler
                .sampleMeta(tx + co[0], ty + co[1])
                .hasFast(fastBeam)
            ) {
              const dx = x - tx - co[0] * 0.5
              const dy = y - ty - co[1] * 0.5
              const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
              if (dist < size) {
                const ratio = 1 - dist / size
                vx += dx * ratio
                vy += dy * ratio
                vDist++
              }
            }
          }
        } else if (
          namedBits.hasFast(fastMediumColliders) ||
          (namedBits.hasFast(fastTrees) && !namedBits.hasFast(fastHarvested))
        ) {
          size = 0.65
        } else if (
          namedBits.hasFast(fastRocks) &&
          !namedBits.hasFast(fastHarvested)
        ) {
          size = 0.9
        } else if (namedBits.hasFast(fastWater)) {
          let waters = 0
          for (const co of cardinalOffsets) {
            if (
              metaTileSampler
                .sampleMeta(tx + co[0], ty + co[1])
                .hasFast(fastWater)
            ) {
              waters++
            }
          }
          if (waters === 4) {
            size = 0.75
          }
        }
        if (size > 0) {
          const dx = x - tx
          const dy = y - ty
          const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
          if (dist < size) {
            const ratio = 1 - dist / size
            vx += dx * ratio
            vy += dy * ratio
            vDist++
          }
        }
      }
    }
    const amt = dt / __idealFrameDuration
    this.x += vx * amt
    this.y += vy * amt
    if (vDist === 4) {
      this.y += 1
    }
  }
}

const spriteTileOccupancy: Map<string, any[]> = new Map()
const spriteSize = 0.5
function makeSpriteAvoider() {
  let oldKey: string | undefined = undefined
  return function spriteAvoider(dt: number) {
    const x = this.x
    const y = this.y
    const otx = Math.floor(x - spriteSize)
    const oty = Math.floor(y - spriteSize)
    let vx = 0
    let vy = 0
    const amt = (dt / __idealFrameDuration) * 0.5
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        const tx = otx + ix
        const ty = oty + iy
        const nearbyKey = `${tx}:${ty}`
        if (spriteTileOccupancy.has(nearbyKey)) {
          for (const other of spriteTileOccupancy.get(nearbyKey)!) {
            if (other !== this) {
              const dx = x - other.x
              const dy = y - other.y
              const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
              if (dist < spriteSize) {
                const ratio = 1 - dist / spriteSize
                vx += dx * ratio
                vy += dy * ratio
                other.x -= dx * ratio * amt
                other.y -= dy * ratio * amt
              }
            }
          }
        }
      }
    }
    this.x += vx * amt
    this.y += vy * amt
    const finalOtx = Math.floor(x)
    const finalOty = Math.floor(y)
    const newKey = `${finalOtx}:${finalOty}`
    if (oldKey !== newKey) {
      if (oldKey) {
        removeFromArray(spriteTileOccupancy.get(oldKey)!, this)
      }
      if (!spriteTileOccupancy.has(newKey)) {
        spriteTileOccupancy.set(newKey, [])
      }
      spriteTileOccupancy.get(newKey)!.push(this)
    }
    oldKey = newKey
  }
}

const __idealFrameDuration = 1 / 60
function makeKeyboardUpdater() {
  const angleLerpRate = 0.2
  let angle = 0
  // let speed = 0
  const kv = new Vector2()

  return function keyboardUpdater(dt: number) {
    const adjDt = dt / __idealFrameDuration
    const angleLerpAmt = 1 - Math.pow(1 - angleLerpRate, adjDt)
    kv.copy(getQuickKeyboardDirectionVector()).normalize()
    if (!(kv.x === 0 && kv.y === 0)) {
      const newAngle = Math.atan2(-kv.y, kv.x) + Math.PI * 0.5
      let angleDelta = newAngle - angle
      if (angleDelta < -Math.PI) {
        angleDelta += Math.PI * 2
      } else if (angleDelta > Math.PI) {
        angleDelta -= Math.PI * 2
      }
      angle += angleDelta * angleLerpAmt
      if (angle < -Math.PI) {
        angle += Math.PI * 2
      } else if (angle > Math.PI) {
        angle -= Math.PI * 2
      }
      const speed = 0.05 * adjDt
      this.x += kv.x * speed
      this.y -= kv.y * speed
      const steppedAngle =
        (Math.round((angle / Math.PI / 2) * 16) / 16) * Math.PI * 2
      this.angle = steppedAngle
    }
  }
}

function makeLightUpdater(size: number, sizeSpeed = 10) {
  let sizePhase = detRandLights(0, Math.PI * 2)

  return function lightUpdater(dt: number) {
    sizePhase += ((1 / size) * __idealFrameDuration) / dt
    // this.x += 1 / this._size
    this.size =
      size * lerp(0.8, 1.2, Math.sin(sizePhase * sizeSpeed) * 0.5 + 0.5)
    // this.z = lerp(0.3, 2, Math.sin(this._sizePhase * 0.3) * 0.5 + 0.5)
  }
}

function makeLanternLightUpdater(parent: DummyController) {
  const angleLerpRate = 0.25
  let swing = 0
  return function lanternLightUpdater(dt: number) {
    const adjDt = dt / __idealFrameDuration
    const angleLerpAmt = 1 - Math.pow(1 - angleLerpRate, adjDt)
    const a = parent.angle + Math.PI * -0.375
    const d = 0.5
    swing += dt

    this.x = lerp(this.x, parent.x + Math.cos(a) * d, angleLerpAmt)
    this.y = lerp(this.y, parent.y + Math.sin(a) * d, angleLerpAmt)
    this.z = lerp(0.45, 0.55, Math.sin(swing * 5) * 0.5 + 0.5)
  }
}

function makeYoyoUpdater(low: number, high: number) {
  return function yoyoUpdater(dt: number) {
    this.z = lerp(low, high, Math.sin(performance.now() * 0.001) * 0.5 + 0.5)
  }
}

function makeOffsetSpinUpdater(x: number, y: number, radius: number) {
  const angleOffset = detRandLights() * Math.PI * 2
  return function yoyoUpdater(dt: number) {
    const a = angleOffset + performance.now() * 0.0002
    this.x = x + Math.cos(a) * radius
    this.y = y + Math.sin(a) * radius
  }
}

const debugView = getUrlFlag('debugView')

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
  private _mapScrollingView: lib.MapScrollingView
  private _sprites: lib.SpriteController[]
  private _spriteControllers: DummyController[]
  private _lights: lib.LightController[]
  private _lanternLights: lib.LightController[]
  private _lightControllers: DummyLightController[]
  private _lanternLightControllers: DummyLightController[]
  mapCacheFinalViewCache: WebGLRenderTarget
  finalViewCacheScene: Scene
  finalViewCacheCamera: OrthographicCamera
  constructor() {
    super()

    const scene = this.scene
    const transform = getMouseBoundViewTransform()
    const viewWidth = getUrlInt('viewTiles', 16)
    const viewHeight = getUrlInt('viewTiles', 16)
    const pixelsPerTile = __pixelsPerTile
    const pixelsPerCacheEdge = 2048
    const clipspaceMode = !debugView
    const passes: lib.MaterialPassType[] = [
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
    const spriteControllers: DummyController[] = []
    const player = new DummyController(
      rand2(20),
      rand2(20, 10),
      rand(-Math.PI, Math.PI)
    )
    player.addUpdater(makeKeyboardUpdater())
    const tileAvoider = makeTileAvoider(mapScrollingView.jitTileSampler)
    player.addUpdater(tileAvoider)
    player.addUpdater(makeSpriteAvoider())
    rigHarvestAction(player, mapScrollingView.jitTileSampler)
    player.x = getUrlInt('x', 0)
    player.y = getUrlInt('y', 0)
    spriteControllers.push(player)
    for (let i = 0; i < 2000; i++) {
      const actor = new DummyController(
        rand2(20),
        rand2(20, 10),
        rand(-Math.PI, Math.PI)
      )
      const wanderer = makeWanderer(0.25)
      actor.addUpdater(wanderer)
      actor.addUpdater(tileAvoider)
      actor.addUpdater(makeSpriteAvoider())
      spriteControllers.push(actor)
    }
    const sprites = spriteControllers.map((tc) =>
      mapScrollingView.jitSpriteSampler.makeSprite(tc.x, tc.y, tc.angle)
    )

    const lightControllers: DummyLightController[] = []
    const s = 20
    for (let i = 0; i < 0; i++) {
      const color = new Color().setHSL(
        detRandLights(0, 100),
        detRandLights(0.5, 0.8),
        detRandLights(0.25, 0.5)
      )
      const lightSize = detRandLights(2, 8) * pixelsPerTile
      const light = new DummyLightController(
        detRandLights(-s, s),
        detRandLights(-s, s + 10),
        0.5,
        color,
        lightSize
      )
      light.addUpdater(makeLightUpdater(lightSize))
      lightControllers.push(light)
    }

    const lights: any[] = []

    const lightRegistry: Map<string, [any, any]> = new Map()

    mapScrollingView.jitTileSampler.onDirtyMetaProcessed(
      (x: number, y: number, meta) => {
        const key = `${x}:${y}`
        if (meta.has('lampPost') && !lightRegistry.has(key)) {
          const color = new Color()
            .setHSL(
              detRandLights(0, 1) > 0.5 ? 0.04 : 0.5,
              0.8,
              0.6
              // detRandLights(0, 100),
              // detRandLights(0.5, 0.8),
              // detRandLights(0.25, 0.5)
            )
            .multiplyScalar(1.2)
          const dlc = new DummyLightController(
            x + 0.3,
            y,
            1.1,
            color,
            8 * pixelsPerTile
          )
          // dlc.addUpdater(makeYoyoUpdater(0.5, 1.5))
          lightControllers.push(dlc)
          const light = mapScrollingView.pointLightRenderer.makeLight(
            dlc.x,
            dlc.y,
            0.5,
            dlc.size,
            dlc.color
          )
          lights.push(light)
          lightRegistry.set(key, [dlc, light])
        }
        if (
          meta.has('treePine') &&
          !meta.has('maturePlant') &&
          !meta.has('harvested') &&
          !lightRegistry.has(key) &&
          getUrlFlag('christmas')
        ) {
          const t = 62
          for (let i = 0; i < t; i++) {
            const ratio = i / t
            const color = new Color()
              .setHSL(
                detRandLights(0, 1),
                0.9,
                0.5
                // detRandLights(0, 100),
                // detRandLights(0.5, 0.8),
                // detRandLights(0.25, 0.5)
              )
              .multiplyScalar(20)
            const a = detRandLights() * Math.PI * 2
            const radius = (1 - ratio) * 0.7 + 0.1
            const dlc = new DummyLightController(
              x + Math.cos(a) * radius,
              y + Math.sin(a) * radius,
              1.2 * ratio * ratio + 0.2,
              color,
              0.5 * pixelsPerTile
            )
            dlc.addUpdater(makeOffsetSpinUpdater(x, y, radius))
            lightControllers.push(dlc)
            const light = mapScrollingView.pointLightRenderer.makeLight(
              dlc.x,
              dlc.y,
              0.5,
              dlc.size,
              dlc.color
            )
            lights.push(light)
            lightRegistry.set(key, [dlc, light])
          }
        }
      }
    )
    // for (let iy = -40; iy < 40; iy++) {
    //   for (let ix = -40; ix < 40; ix++) {
    //     const metaProps = mapScrollingView.jitTileSampler.sampleMeta(ix, iy)
    //     if (metaProps.has('lampPost')) {
    //       const color = new Color()
    //         .setHSL(
    //           detRandLights(0, 1) > 0.5 ? 0.04 : 0.5,
    //           0.8,
    //           0.6
    //           // detRandLights(0, 100),
    //           // detRandLights(0.5, 0.8),
    //           // detRandLights(0.25, 0.5)
    //         )
    //         .multiplyScalar(3)
    //       const dlc = new DummyLightController(
    //         ix + 0.3,
    //         iy,
    //         1.25,
    //         color,
    //         8 * pixelsPerTile
    //       )
    //       lightControllers.push(dlc)
    //     }
    //   }
    // }

    const lanternLightControllers: DummyLightController[] = spriteControllers
      .map((spriteC, i) => {
        if (i === 0 || detRandLights() > 0.95) {
          const color = new Color().setHSL(
            // detRandLights(0, 100),
            // detRandLights(0.5, 0.8),
            // detRandLights(0.25, 0.5)
            0.1,
            0.9,
            0.6
          )
          const lc = new DummyLightController(
            spriteC.x,
            spriteC.y,
            0.5,
            color,
            8 * pixelsPerTile
          )
          lc.addUpdater(makeLanternLightUpdater(spriteC))
          return lc
        } else {
          return undefined
        }
      })
      .filter((v) => !!v) as DummyLightController[]

    for (const lc of lightControllers) {
      lights.push(
        mapScrollingView.pointLightRenderer.makeLight(
          lc.x,
          lc.y,
          0.5,
          lc.size,
          lc.color
        )
      )
    }

    const lanternLights = lanternLightControllers.map((tc) =>
      mapScrollingView.pointLightRenderer.makeLight(
        tc.x,
        tc.y,
        0.5,
        tc.size,
        tc.color
      )
    )

    const allViews = !debugView
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

    if (debugView) {
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
          // map: mapScrollingView.spriteMaker.getTexture(pass)
          map: mapScrollingView.tileMaker.getTexture(pass)
        })

        const tileCachePreview = new Mesh(
          new PlaneGeometry(0.5, 0.5, 1, 1),
          tileCacheMaterial
        )
        tileCachePreview.position.x = 0.25 + i * 0.1
        tileCachePreview.position.y = i * -0.1 + 2
        tileCachePreview.position.z = 1.2
        tileCachePreview.rotation.x = Math.PI * -0.25
        tileCachePreview.scale.multiplyScalar(2)
        scene.add(tileCachePreview)
      }
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

    this._sprites = sprites
    this._spriteControllers = spriteControllers

    this._lights = lights
    this._lightControllers = lightControllers

    this._lanternLights = lanternLights
    this._lanternLightControllers = lanternLightControllers

    const mapCacheFinalViewCache = new WebGLRenderTarget(
      viewWidth * pixelsPerTile,
      viewHeight * pixelsPerTile,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        encoding: GammaEncoding,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        generateMipmaps: false
      }
    )
    const finalViewCacheScene = new Scene()
    const mapCacheFinalView = new Mesh(
      lib.helpers.createMapCacheViewPlane(viewWidth, viewHeight, true),
      new MeshBasicMaterial({ map: mapCacheFinalViewCache.texture })
    )
    const finalViewCacheCamera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
    finalViewCacheScene.add(mapCacheFinalView)
    finalViewCacheScene.add(finalViewCacheCamera)
    this.mapCacheFinalViewCache = mapCacheFinalViewCache
    this.finalViewCacheScene = finalViewCacheScene
    this.finalViewCacheCamera = finalViewCacheCamera
  }
  update(dt: number) {
    for (let i = 0; i < this._spriteControllers.length; i++) {
      const tc = this._spriteControllers[i]
      const s = this._sprites[i]
      tc.update(dt)
      s.x = tc.x
      s.y = tc.y
      s.angle =
        (~~(wrap(tc.angle / (Math.PI * 2), 0, 1) * 16) / 16) * Math.PI * 2
    }
    for (let i = 0; i < this._lightControllers.length; i++) {
      const tc = this._lightControllers[i]
      const s = this._lights[i]
      tc.update(dt)
      s.x = tc.x
      s.y = tc.y
      s.z = tc.z
      s.size = tc.size
    }
    for (let i = 0; i < this._lanternLightControllers.length; i++) {
      const lc = this._lanternLightControllers[i]
      const l = this._lanternLights[i]
      lc.update(dt)
      l.x = lc.x
      l.y = lc.y
      l.z = lc.z
      l.size = lc.size
    }
    if (getUrlFlag('play')) {
      const player = this._spriteControllers[0]
      this._pixelsOffset.set(
        (player.x - this._viewWidth * 0.5) * this._pixelsPerTile,
        -(player.y - this._viewHeight * 0.5) * this._pixelsPerTile
      )
    } else {
      if (getUrlFlag('autoMove')) {
        const a = performance.now() * 0.0002
        this._arrowKeysDirection.copy(
          new Vector2(Math.cos(a) * 1, Math.sin(a) * 1)
        )
      }
      this._pixelsOffset.add(
        this._arrowKeysDirection.clone().multiplyScalar(4 * 60 * dt)
      )
    }
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

    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._mapScrollingView.render(renderer, dt)
    if (!debugView) {
      renderer.setRenderTarget(this.mapCacheFinalViewCache)
    }
    super.render(renderer, dt)
    if (!debugView) {
      renderer.setRenderTarget(null)
      renderer.render(this.finalViewCacheScene, this.finalViewCacheCamera)
    }
  }
}
const pVec = new Vector2()
const tVec = new Vector2()
function getCoordInFrontOfPlayer(player: DummyController) {
  const a = player.angle - Math.PI * 0.5
  pVec.x = Math.cos(a)
  pVec.y = Math.sin(a)
  pVec.multiplyScalar(0.75)
  tVec.x = Math.round(player.x + pVec.x)
  tVec.y = Math.round(player.y + pVec.y)
  return tVec
}
function rigHarvestAction(
  player: DummyController,
  metaTileSampler: JITTileSampler
) {
  let harvestActionState = false
  let buildActionState = false
  let lampPostActionState = false
  let unbuildActionState = false
  const onKey = (key: KeyboardCodes, down: boolean) => {
    switch (key) {
      case 'Space':
        if (down && !harvestActionState) {
          const coord = getCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          tileMeta.enableBit('harvested')
          tileMeta.disableBit('bush')
          metaTileSampler.writeMeta(coord.x, coord.y, tileMeta)
        }
        harvestActionState = down
        break
      case 'KeyB':
        if (down && !buildActionState) {
          const coord = getCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          if (!tileMeta.has('floor')) {
            tileMeta.enableBit('floor')
          } else if (!tileMeta.has('beam')) {
            tileMeta.enableBit('beam')
          } else if (!tileMeta.has('bricks')) {
            tileMeta.enableBit('bricks')
          }
          metaTileSampler.writeMeta(coord.x, coord.y, tileMeta)
        }
        buildActionState = down
        break
      case 'KeyX':
        if (down && !unbuildActionState) {
          const coord = getCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          if (tileMeta.has('lampPost')) {
            tileMeta.disableBit('lampPost')
          } else if (tileMeta.has('bricks')) {
            tileMeta.disableBit('bricks')
          } else if (tileMeta.has('beam')) {
            tileMeta.disableBit('beam')
          } else if (tileMeta.has('floor')) {
            tileMeta.disableBit('floor')
          }
          metaTileSampler.writeMeta(coord.x, coord.y, tileMeta)
        }
        unbuildActionState = down
        break
      case 'KeyL':
        if (down && !lampPostActionState) {
          const coord = getCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          if (!tileMeta.has('lampPost')) {
            tileMeta.enableBit('lampPost')
            metaTileSampler.writeMeta(coord.x, coord.y, tileMeta)
          }
        }
        lampPostActionState = down
        break
    }
  }
  getKeyboardInput().addListener(onKey)
}
