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
import { initOffset } from '../../constants'
import { getMouseBoundViewTransform } from '../../helpers/viewTransformMouse'
import { rand, rand2, wrap } from '../../utils/math'
import { detRandLights, detRandPhysics } from '../../utils/random'
import getKeyboardInput from '../../input/getKeyboardInput'
import { KeyboardCodes } from '../../utils/KeyboardCodes'
import PixelTextMesh from 'three-pixel-font'

import lib from '@lib/index'
import { getQuickKeyboardDirectionVector } from '../directionalKeyboardInputHelper'

import BaseTestScene from './BaseTestScene'
import JITTileSampler from '../../../src/rendering/tileMaker/mapTileMaker/JITTileSampler'
import { removeFromArray } from '../../utils/arrayUtils'
import { getUrlFlag, getUrlInt } from '../../utils/location'

const __pixelsPerTile = getUrlInt('pixelsPerTile', 32)

class DummyController {
  private _updaters: Array<(dt: number) => void> = []
  z = 0
  animTime = 0
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

function wandererUpdate(this: any, dt: number) {
  let angleDelta = this.wandererAngleDelta
  const maxSpeed = this.wandererMaxSpeed

  if (this.animTime === 0) {
    angleDelta += rand2(0.03)
    angleDelta = clamp(angleDelta, -0.1, 0.1)
    angleDelta *= 0.99
    this.angle += angleDelta
    this.angle *= 0.99
    this.wandererAngleDelta = angleDelta
    if (rand() > 0.97) {
      this.animTime += 0.01
    }
  }
  if (this.animTime > 0) {
    this.animTime += 0.025
    const realSpeed = maxSpeed
    this.x += Math.cos(this.angle - Math.PI * 0.5) * realSpeed
    this.y += Math.sin(this.angle - Math.PI * 0.5) * realSpeed
  }
  if (this.animTime >= 1) {
    this.animTime = 0
  }
}
function makeWanderer(target: any, maxSpeed = 0.4) {
  target.wandererAngleDelta = 0
  target.wandererMaxSpeed = maxSpeed
  return wandererUpdate
}

function grabberUpdate() {
  if (this.grabbed) {
    const other = this.grabbed
    const deltaX = this.x - other.x
    const deltaY = this.y - other.y
    const a = Math.atan2(deltaY, deltaX) + Math.PI * 0.5
    other.angle = a
    this.angle = a + Math.PI
    const coord = getCoordInFrontOfPlayer(this)
    other.x = lerp(other.x, coord.x, 0.5)
    other.y = lerp(other.y, coord.y, 0.5)
    // other.x += 0.05
  }
}
function makeGrabber(target: any) {
  target.grabbed = null
  return grabberUpdate
}

function spinnerUpdate(this: any, dt: number) {
  this.angle += this.spinSpeed * dt
}
function makeSpinner(target: any, spinSpeed = 4) {
  target.spinSpeed = spinSpeed
  return spinnerUpdate
}

function hoverUpdate(this: any, dt: number) {
  this.z =
    Math.abs(Math.cos(this.hoverSpeed * performance.now() + this.hoverOffset)) *
    this.hoverRange
}
function makeHover(
  target: any,
  hoverRange = 1,
  hoverSpeed = 0.004,
  hoverOffset = rand2(Math.PI * 2)
) {
  target.hoverRange = hoverRange
  target.hoverSpeed = hoverSpeed
  target.hoverOffset = hoverOffset
  return hoverUpdate
}

function makeSolipsisticRespawner(
  solipsisticRespawnerTarget: any,
  metaTileSampler: JITTileSampler
) {
  const tempSample = metaTileSampler.sampleMeta(0, 0)
  const fastWaterOrRocks = tempSample.makeFastMultiMask(['water', 'rocks'])

  function solipsisticRespawnerUpdate(dt: number) {
    const distanceX = solipsisticRespawnerTarget.x - this.x
    let x = this.x
    let y = this.y
    if (Math.abs(distanceX) > 10) {
      x = solipsisticRespawnerTarget.x + Math.sign(distanceX) * 9
    }
    const distanceY = solipsisticRespawnerTarget.y - this.y
    if (Math.abs(distanceY) > 10) {
      y = solipsisticRespawnerTarget.y + Math.sign(distanceY) * 9
    }
    if (this.x !== x || this.y !== y) {
      const tempSample = metaTileSampler.sampleMeta(
        Math.round(x),
        Math.round(y)
      )
      if (!tempSample.hasFast(fastWaterOrRocks)) {
        this.x = x
        this.y = y
      }
    }
  }
  return solipsisticRespawnerUpdate
}

function makeTileAvoider(metaTileSampler: JITTileSampler) {
  const tempSample = metaTileSampler.sampleMeta(0, 0)
  const fastSmallColliders = tempSample.makeFastMultiMask(['beam', 'lampPost'])

  const fastTrees = tempSample.makeFastMultiMask(['treePine', 'treeMaple'])
  const fastRocks = tempSample.makeFastMask('rocks')
  const fastBeam = tempSample.makeFastMask('beam')
  const fastBricksOrBushes = tempSample.makeFastMultiMask(['bricks', 'bush'])
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
    let vx = 0
    let vy = 0
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        const tx = otx + ix
        const ty = oty + iy
        const namedBits = metaTileSampler.sampleMeta(tx, ty)
        let size = 0
        if (
          namedBits.hasFast(fastMediumColliders) ||
          (namedBits.hasFast(fastTrees) && !namedBits.hasFast(fastHarvested))
        ) {
          size = 0.65
          for (const co of cardinalOffsets) {
            if (
              metaTileSampler
                .sampleMeta(tx + co[0], ty + co[1])
                .hasFast(fastBricksOrBushes)
            ) {
              const dx = x - tx - co[0] * 0.5
              const dy = y - ty - co[1] * 0.5
              const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
              if (dist < size) {
                const ratio = 1 - dist / size
                vx += dx * ratio
                vy += dy * ratio
              }
            }
          }
        } else if (
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
              }
            }
          }
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
          }
        }
      }
    }
    const amt = dt / __idealFrameDuration
    this.x += vx * amt
    this.y += vy * amt
  }
}

function heldItemUpdater() {
  this.x = lerp(this.x, this.parent.x, 0.5)
  this.y = lerp(this.y, this.parent.y, 0.5)
  this.z = lerp(this.z, this.parent.z + 0.35, 0.5)
  this.angle = this.parent.angle
}

function makeHeldItem(target: any, parent: any) {
  target.parent = parent
  return heldItemUpdater
}

const spriteTileOccupancy: Map<string, any[]> = new Map()
const spriteSize = 0.5
function makeSpriteAvoider() {
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
                if (
                  (other.canBeHeld && this.canHoldItem) ||
                  (this.canBeHeld && other.canHoldItem)
                ) {
                  const container = other.canHoldItem ? other : this
                  const item = this === container ? other : this
                  item.canBeHeld = false
                  item.canBeGrabbed = false
                  item.canHoldItem = true
                  container.canHoldItem = false
                  item.addUpdater(makeHeldItem(item, container))
                } else if (Math.abs(this.z - other.z) < 0.2) {
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
    }
    this.x += vx * amt
    this.y += vy * amt
    const finalOtx = Math.floor(x)
    const finalOty = Math.floor(y)
    const newKey = `${finalOtx}:${finalOty}`
    if (this.spriteAvoiderOldKey !== newKey) {
      if (this.spriteAvoiderOldKey) {
        removeFromArray(
          spriteTileOccupancy.get(this.spriteAvoiderOldKey)!,
          this
        )
      }
      if (!spriteTileOccupancy.has(newKey)) {
        spriteTileOccupancy.set(newKey, [])
      }
      spriteTileOccupancy.get(newKey)!.push(this)
    }
    this.spriteAvoiderOldKey = newKey
  }
}

const __idealFrameDuration = 1 / 60
function makeKeyboardUpdater(
  movementVector: Vector2,
  directionVector: Vector2
) {
  const angleLerpRate = 0.2
  let angle = 0
  // let speed = 0
  const mv = new Vector2()
  const dv = new Vector2()

  return function keyboardUpdater(dt: number) {
    const adjDt = dt / __idealFrameDuration
    const angleLerpAmt = 1 - Math.pow(1 - angleLerpRate, adjDt)
    mv.copy(movementVector).normalize()
    dv.copy(directionVector).normalize()
    let newAngle = 0

    const directionOverridesMovementAngle =
      directionVector.x !== 0 || directionVector.y !== 0

    let newDirectionAngle = Math.atan2(-dv.y, dv.x) + Math.PI * 0.5
    if (directionOverridesMovementAngle) {
      newAngle = newDirectionAngle
    } else {
      newAngle = this.angle
      newDirectionAngle = this.angle
    }

    if (!(mv.x === 0 && mv.y === 0)) {
      const newMovementAngle = Math.atan2(-mv.y, mv.x) + Math.PI * 0.5
      if (!directionOverridesMovementAngle) {
        newAngle = newMovementAngle
      }
      const speed = 0.05 * adjDt
      let movementDirectionAngleDelta = newMovementAngle - newDirectionAngle
      while (movementDirectionAngleDelta > Math.PI) {
        movementDirectionAngleDelta -= Math.PI * 2
      }
      while (movementDirectionAngleDelta < -Math.PI) {
        movementDirectionAngleDelta += Math.PI * 2
      }
      const runningBackwards =
        movementDirectionAngleDelta > Math.PI * 0.55 ||
        movementDirectionAngleDelta < Math.PI * -0.55

      const speedDirection = runningBackwards ? -1 : 1
      const speedScale = lerp(
        Math.cos(movementDirectionAngleDelta) * 0.5 + 0.5,
        1,
        0.65
      )
      this.animTime += 0.02 * speedScale * speedDirection
      this.x += mv.x * speed * Math.abs(speedScale)
      this.y -= mv.y * speed * Math.abs(speedScale)
    } else {
      this.animTime = 0
    }
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
    this.angle = angle

    if (this.grabbed) {
      // const coord = getCoordInFrontOfPlayer(this)
      const dx = this.grabbed.x - this.x
      const dy = this.grabbed.y - this.y
      const angleOfGrabbed = Math.atan2(dy, dx)
      const dist = Math.sqrt(dx * dx + dy * dy)

      let angleDelta = angleOfGrabbed - angle + Math.PI * 0.5
      if (angleDelta < -Math.PI) {
        angleDelta += Math.PI * 2
      } else if (angleDelta > Math.PI) {
        angleDelta -= Math.PI * 2
      }
      let newX = 0
      let newY = 0
      let newAngle = 0
      if (angleDelta < Math.PI * 0.45 && angleDelta > Math.PI * -0.45) {
        newAngle = angle + Math.PI * -0.5
      } else {
        newAngle = angle + Math.PI * 0.5
      }
      newX = this.grabbed.x - Math.cos(newAngle) * dist
      newY = this.grabbed.y - Math.sin(newAngle) * dist
      this.x = lerp(this.x, newX, 0.1)
      this.y = lerp(this.y, newY, 0.1)

      // let adjustedAngle = angleOfGrabbed
      // if (angleDelta < -0.1) {
      //   adjustedAngle += 0.05
      // } else if (angleDelta > 0.1) {
      //   adjustedAngle -= 0.05
      // }
      // console.log(adjustedAngle)

      // const coord = new Vector2()
      // coord.x = this.x + Math.cos(adjustedAngle) * dist
      // coord.y = this.y + Math.sin(adjustedAngle) * dist

      // // this.grabbed.x = lerp(this.grabbed.x, coord.x, 0.5)
      // // this.grabbed.y = lerp(this.grabbed.y, coord.y, 0.5)
      // this.x = this.grabbed.x - Math.cos(angle + Math.PI * -0.5) * dist
      // this.y = this.grabbed.y - Math.sin(angle + Math.PI * -0.5) * dist
      // this.grabbed.x = coord.x
      // this.grabbed.y = coord.y
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

function makeLanternLightUpdater(this: any, parent: DummyController) {
  const angleLerpRate = 0.25
  let swing = 0
  return function lanternLightUpdater(dt: number) {
    const adjDt = dt / __idealFrameDuration
    const angleLerpAmt = 1 - Math.pow(1 - angleLerpRate, adjDt)
    const a = parent.angle + Math.PI * -0.375
    const d = 0.75
    swing += dt

    const x = parent.x + Math.cos(a) * d
    const y = parent.y + Math.sin(a) * d
    if (Math.abs(this.x - x) > 2 || Math.abs(this.y - y) > 2) {
      this.x = x
      this.y = y
    } else {
      this.x = lerp(this.x, x, angleLerpAmt)
      this.y = lerp(this.y, y, angleLerpAmt)
    }
    this.z = lerp(0.45, 0.55, Math.sin(swing * 5) * 0.5 + 0.5)
  }
}

function makeYoyoUpdater(low: number, high: number) {
  return function yoyoUpdater(dt: number) {
    this.z = lerp(low, high, Math.sin(performance.now() * 0.001) * 0.5 + 0.5)
  }
}

function makeOffsetSpinUpdater(
  x: number,
  y: number,
  radius: number,
  angleOffset: number
) {
  return function spinnerUpdater(dt: number) {
    const a = angleOffset + performance.now() * 0.0002
    this.x = x + Math.cos(a) * radius
    this.y = y + Math.sin(a) * radius
  }
}

const debugView = getUrlFlag('debugView')
const sampleCoords = new Vector2()
function regenSampleCoords(jitTileSampler: JITTileSampler, restricted: number) {
  let attempts = 40
  do {
    attempts--
    sampleCoords.x = Math.round(rand2(20))
    sampleCoords.y = Math.round(rand2(20, 10))
  } while (
    jitTileSampler
      .sampleMeta(sampleCoords.x, sampleCoords.y)
      .hasFast(restricted) &&
    attempts > 0
  )
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
  private _wasdKeysDirection = getQuickKeyboardDirectionVector(
    'KeyW',
    'KeyS',
    'KeyA',
    'KeyD'
  )
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
  testText: any
  constructor() {
    const camera = new OrthographicCamera(0, 1, 1, 0, -1, 1)
    super(camera)

    const scene = this.scene
    scene.add(camera)
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
    player.addUpdater(
      makeKeyboardUpdater(this._wasdKeysDirection, this._arrowKeysDirection)
    )
    // player.addUpdater(makeHover(player))
    const tileAvoider = makeTileAvoider(mapScrollingView.jitTileSampler)
    const solipsisticRespawner = makeSolipsisticRespawner(
      player,
      mapScrollingView.jitTileSampler
    )
    const spriteAvoider = makeSpriteAvoider()
    const sprites: any[] = []
    player.addUpdater(tileAvoider)
    player.addUpdater(spriteAvoider)
    rigHarvestAction(player, mapScrollingView.jitTileSampler)
    player.addUpdater(makeGrabber(player))

    player.x = getUrlInt('x', 0)
    player.y = getUrlInt('y', 0)

    const playerSprite = mapScrollingView.jitSpriteSampler.makeSprite(
      player.x,
      player.y,
      player.angle
    )
    playerSprite.metaBytes.enableBit('skeleton')
    mapScrollingView.jitSpriteSampler.validateMeta(playerSprite.metaBytes)
    spriteControllers.push(player)
    sprites.push(playerSprite)

    const wheelBarrow = new DummyController(
      rand2(20),
      rand2(20, 10),
      rand(-Math.PI, Math.PI)
    )
    ;(wheelBarrow as any).canHoldItem = true
    ;(wheelBarrow as any).canBeGrabbed = true
    // wheelBarrow.addUpdater(makeHover(wheelBarrow))
    wheelBarrow.addUpdater(tileAvoider)
    wheelBarrow.addUpdater(spriteAvoider)
    wheelBarrow.x = getUrlInt('x', 0) + 1
    wheelBarrow.y = getUrlInt('y', 0)

    const wheelBarrowSprite = mapScrollingView.jitSpriteSampler.makeSprite(
      wheelBarrow.x,
      wheelBarrow.y,
      wheelBarrow.angle
    )
    wheelBarrowSprite.metaBytes.enableBit('wheelBarrow')
    mapScrollingView.jitSpriteSampler.validateMeta(wheelBarrowSprite.metaBytes)
    spriteControllers.push(wheelBarrow)
    sprites.push(wheelBarrowSprite)

    const tempSample = (
      mapScrollingView.jitTileSampler as JITTileSampler
    ).sampleMeta(0, 0)
    const fastWaterOrRocks = tempSample.makeFastMultiMask(['water', 'rocks'])
    for (let i = 0; i < 20; i++) {
      regenSampleCoords(mapScrollingView.jitTileSampler, fastWaterOrRocks)
      const actor = new DummyController(
        sampleCoords.x,
        sampleCoords.y,
        rand(-Math.PI, Math.PI)
      )
      const wanderer = makeWanderer(actor, 0.025)
      actor.addUpdater(wanderer)
      actor.addUpdater(solipsisticRespawner)
      actor.addUpdater(tileAvoider)
      actor.addUpdater(spriteAvoider)
      spriteControllers.push(actor)
      const sprite = mapScrollingView.jitSpriteSampler.makeSprite(
        actor.x,
        actor.y,
        actor.angle
      )
      sprite.metaBytes.enableBit('sheep')
      mapScrollingView.jitSpriteSampler.validateMeta(sprite.metaBytes)
      sprites.push(sprite)
    }

    const noLogsHere = tempSample.makeFastMultiMask([
      'water',
      'rocks',
      'lampPost',
      'bricks',
      'beam',
      'treeMaple',
      'treePine',
      'bush',
      'testObject',
      'pyramid'
    ])

    for (let i = 0; i < 200; i++) {
      regenSampleCoords(mapScrollingView.jitTileSampler, noLogsHere)
      const item = new DummyController(
        sampleCoords.x + rand2(0.1),
        sampleCoords.y + rand2(0.1),
        rand(-Math.PI, Math.PI)
      )
      item.addUpdater(tileAvoider)
      item.addUpdater(spriteAvoider)
      // const spinner = makeSpinner(item)
      // item.addUpdater(spinner)
      // const hover = makeHover(item)
      // item.addUpdater(hover)
      spriteControllers.push(item)
      const sprite = mapScrollingView.jitSpriteSampler.makeSprite(
        item.x,
        item.y,
        item.angle
      )
      sprite.metaBytes.enableBit('itemLog')
      ;(item as any).canBeHeld = true
      ;(item as any).canBeGrabbed = true
      mapScrollingView.jitSpriteSampler.validateMeta(sprite.metaBytes)
      sprites.push(sprite)
    }

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
          const light = mapScrollingView.pointLightRenderer
            .getLightGroup(true, 128)
            .makeLight(dlc.x, dlc.y, 0.5, dlc.size, dlc.color)
          lights.push(light)
          lightRegistry.set(key, [dlc, light])
        }
        const correctTile =
          meta.has('treePine') &&
          !meta.has('maturePlant') &&
          !meta.has('harvested')

        const christmas = getUrlFlag('christmas')
        const christmasColors = [
          new Color(1, 0, 0.05),
          new Color(1, 0.5, 0),
          new Color(0, 0.15, 1),
          new Color(0, 1, 0)
        ]
        // christmasColors.forEach(c => c.multiplyScalar(0.9).addScalar(0.1))
        const needsChristmasLights =
          correctTile && !lightRegistry.has(key) && christmas
        if (needsChristmasLights) {
          const t1 = 62
          for (let i = 0; i < t1; i++) {
            const ratio = i / t1
            const color = christmasColors[i % christmasColors.length]
              .clone()
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
            const angleOffset = detRandLights() * Math.PI * 2
            dlc.addUpdater(makeOffsetSpinUpdater(x, y, radius, angleOffset))
            lightControllers.push(dlc)
            const light = mapScrollingView.pointLightRenderer
              .getLightGroup(false)
              .makeLight(dlc.x, dlc.y, 0.5, dlc.size, dlc.color)
            lights.push(light)
            lightRegistry.set(key, [dlc, light])
          }

          const t2 = 5
          for (let i = 0; i < t2; i++) {
            const ratio = i / t2
            const color = new Color()
              .setHSL(
                detRandLights(0, 1),
                0.9,
                0.5
                // detRandLights(0, 100),
                // detRandLights(0.5, 0.8),
                // detRandLights(0.25, 0.5)
              )
              .multiplyScalar(0.8)
            const a = ratio * Math.PI * 2
            const radius = 0.5
            const dlc = new DummyLightController(
              x + Math.cos(a) * radius,
              y + Math.sin(a) * radius,
              0.6,
              color,
              3 * pixelsPerTile
            )
            dlc.addUpdater(makeOffsetSpinUpdater(x, y, radius, a))
            lightControllers.push(dlc)
            const light = mapScrollingView.pointLightRenderer
              .getLightGroup(false)
              .makeLight(dlc.x, dlc.y, 0.5, dlc.size, dlc.color)
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
        const sprite = sprites[i]
        if (
          i === 0 ||
          (detRandLights() > 0.25 && sprite.metaBytes.has('sheep'))
        ) {
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
        mapScrollingView.pointLightRenderer
          .getLightGroup()
          .makeLight(lc.x, lc.y, 0.5, lc.size, lc.color)
      )
    }

    const lanternLights = lanternLightControllers.map((tc) =>
      mapScrollingView.pointLightRenderer
        .getLightGroup(true, 64)
        .makeLight(tc.x, tc.y, 0.5, tc.size, tc.color)
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
        mapCachePreview.position.y = -0.5 + i * -0.1 + 1.5
        mapCachePreview.rotation.x = Math.PI * -0.25
        mapCachePreview.scale.multiplyScalar(1.2)
        scene.add(mapCachePreview)
      }
      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i]
        const tileCacheMaterial = new MeshBasicMaterial({
          map: mapScrollingView.spriteMaker.getTexture(pass)
          // map: mapScrollingView.tileMaker.getTexture(pass)
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

    const testText = new PixelTextMesh.PixelTextMesh(
      '',
      undefined,
      undefined,
      (w, h) => {
        testText.scale.x = ((w * 7) / 512) * 2
        testText.scale.y = ((h * 8) / 512) * 2
      }
    )
    testText.position.set(0.5, 0.5, 0)
    scene.add(testText)
    this.testText = testText
  }
  update(dt: number) {
    const y = Math.cos(performance.now() * 0.005) * 0.01 + 0.65
    this.testText.position.y = Math.round(y * 512) / 512
    for (let i = 0; i < this._spriteControllers.length; i++) {
      const tc = this._spriteControllers[i]
      const s = this._sprites[i]
      tc.update(dt)
      s.x = tc.x
      s.y = tc.y
      s.z = tc.z
      s.animTime = tc.animTime
      s.angle =
        (Math.round(wrap(tc.angle / (Math.PI * 2), 0, 1) * 16) / 16) *
        Math.PI *
        2
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
        this._wasdKeysDirection.copy(
          new Vector2(Math.cos(a) * 1, Math.sin(a) * 1)
        )
      }
      this._pixelsOffset.add(
        this._wasdKeysDirection.clone().multiplyScalar(4 * 60 * dt)
      )
    }
    this._pixelsOffset.round()
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
function getTileCoordInFrontOfPlayer(player: DummyController) {
  const a = player.angle - Math.PI * 0.5
  pVec.x = Math.cos(a)
  pVec.y = Math.sin(a)
  pVec.multiplyScalar(0.75)
  tVec.x = Math.round(player.x + pVec.x)
  tVec.y = Math.round(player.y + pVec.y)
  return tVec
}

function getCoordInFrontOfPlayer(player: DummyController) {
  const a = player.angle - Math.PI * 0.5
  pVec.x = Math.cos(a)
  pVec.y = Math.sin(a)
  pVec.multiplyScalar(0.75)
  tVec.x = player.x + pVec.x
  tVec.y = player.y + pVec.y
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
  let grabbing = false

  const grabDistance = 0.5
  const onKey = (key: KeyboardCodes, down: boolean) => {
    switch (key) {
      case 'Space':
        if (down && !grabbing) {
          console.log('grab')

          const a = player.angle + Math.PI * -0.5
          const coord = getCoordInFrontOfPlayer(player)

          grabbing = down

          const x = coord.x
          const y = coord.y
          const otx = Math.floor(x - spriteSize)
          const oty = Math.floor(y - spriteSize)
          for (let ix = 0; ix < 2; ix++) {
            for (let iy = 0; iy < 2; iy++) {
              const tx = otx + ix
              const ty = oty + iy
              const nearbyKey = `${tx}:${ty}`
              if (spriteTileOccupancy.has(nearbyKey)) {
                for (const other of spriteTileOccupancy.get(nearbyKey)!) {
                  if (
                    other !== player &&
                    other.canBeGrabbed &&
                    !(player as any).grabbed
                  ) {
                    const dx = x - other.x
                    const dy = y - other.y
                    const dist = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
                    console.log(dist)
                    if (dist < spriteSize) {
                      ;(player as any).grabbed = other
                    }
                  }
                }
              }
            }
          }
        } else if (!down && grabbing) {
          console.log('release')
          ;(player as any).grabbed = null
          grabbing = down
        }
        break
      case 'KeyC':
        if (down && !harvestActionState) {
          const coord = getTileCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          tileMeta.enableBit('harvested')
          tileMeta.disableBit('bush')
          metaTileSampler.writeMeta(coord.x, coord.y, tileMeta)
        }
        harvestActionState = down
        break
      case 'KeyB':
        if (down && !buildActionState) {
          const coord = getTileCoordInFrontOfPlayer(player)
          const tileMeta = metaTileSampler.sampleMeta(coord.x, coord.y).clone()
          if (!tileMeta.has('floor')) {
            tileMeta.enableBit('floor')
          } else if (!tileMeta.has('logWall') && !tileMeta.has('beam')) {
            tileMeta.enableBit('logWall')
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
          const coord = getTileCoordInFrontOfPlayer(player)
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
          const coord = getTileCoordInFrontOfPlayer(player)
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
