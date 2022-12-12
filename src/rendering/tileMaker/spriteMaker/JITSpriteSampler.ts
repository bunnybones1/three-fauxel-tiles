import { BufferGeometry, Sprite } from 'three'
import { simpleThreshNoise } from '../../../helpers/utils/helper2DFactory'
import NamedBitsInBytes from '../../../helpers/utils/NamedBitsInBytes'
import NamedBitsInNumber from '../../../helpers/utils/NamedBitsInNumber'
import StepHelper2D from '../../../helpers/utils/StepHelper2D'
import { wrap } from '../../../utils/math'

import SpriteMaker from './SpriteMaker'

type BottomAndTopIds = {
  idTop: number
  idBottom: number
}
const masks32: number[] = []
for (let i = 0; i < 32; i++) {
  masks32[i] = 1 << i
}
const __animFrameTimes = ['0', '1', '2', '3', '4', '5', '6', '7'] as const

const metaSpriteStrings = [
  'body',
  'body2',
  'hat',
  'sword',
  'shield',
  'sheep',
  'animRun',
  'animTime1',
  'animTime2',
  'animTime4'
] as const
type MetaSprite = typeof metaSpriteStrings[number]

const visualSpriteStrings = [
  'layer2',
  'body',
  'body2',
  'hat',
  'sword',
  'shield',
  'sheep',
  'sheepRun0',
  'sheepRun1',
  'sheepRun2',
  'sheepRun3',
  'sheepRun4',
  'sheepRun5',
  'sheepRun6',
  'sheepRun7'
] as const

type VisSprite = typeof visualSpriteStrings[number]

const masks8: number[] = []
for (let i = 0; i < 8; i++) {
  masks8[i] = 1 << i
}

export class SpriteController {
  private _animTime: number
  get animTime(): number {
    return this._animTime
  }
  set animTime(value: number) {
    this._animTime = value
    this.animFrame = ~~(value * 8)
  }
  private _animFrame: number
  get animFrame(): number {
    return this._animFrame
  }
  set animFrame(value: number) {
    if (value === this._animFrame) {
      return
    }
    this._animFrame = value
    if ((this.animFrame & 1) !== 0) {
      this.metaBytes.enableBit('animTime1')
    } else {
      this.metaBytes.disableBit('animTime1')
    }
    if ((this.animFrame & 2) !== 0) {
      this.metaBytes.enableBit('animTime2')
    } else {
      this.metaBytes.disableBit('animTime2')
    }
    if ((this.animFrame & 4) !== 0) {
      this.metaBytes.enableBit('animTime4')
    } else {
      this.metaBytes.disableBit('animTime4')
    }
  }
  constructor(
    public x: number,
    public y: number,
    public id: number,
    public angle: number,
    public metaBytes: NamedBitsInNumber<typeof metaSpriteStrings>
  ) {
    //
  }
}

let __id = 0
export default class JITTileSampler {
  private _sprites: SpriteController[] = []
  offsetX = 0
  offsetY = 0
  makeSprite(x: number, y: number, angle: number) {
    const id = __id
    // const sprite = new SpriteController(x, y, id, angle)
    const meta = this.sampleMeta(id)
    const sprite = new SpriteController(x, y, id, angle, meta)
    __id++
    this._sprites.push(sprite)
    return sprite
  }
  get spriteMaker(): SpriteMaker {
    return this._spriteMaker
  }
  set spriteMaker(value: SpriteMaker) {
    throw new Error('Cannot change spriteMaker during runtime')
  }
  metaNoiseGenerators: StepHelper2D[]
  bytesPerTile: number
  metaCache: Map<string, NamedBitsInNumber<typeof metaSpriteStrings>> =
    new Map() //maybe change this caching mechanism for something more memory friendly. e.i. Map<number, <Map<number, number>> ?
  constructor(
    private _spriteMaker: SpriteMaker,
    private _pixelsPerTile: number,
    private _viewWidth: number,
    private _viewHeight: number
  ) {
    this.bytesPerTile = Math.ceil(visualSpriteStrings.length / 8)

    const seed = 1
    const bodyNoise = simpleThreshNoise(0.1, 0, 0, 0, seed)
    const body2Noise = simpleThreshNoise(0.08, -100, -100, 0, seed)
    const hatNoise = simpleThreshNoise(0.06, -50, -50, 0.5, seed)
    const swordNoise = simpleThreshNoise(0.26, 50, 50, 0, seed)
    const shieldNoise = simpleThreshNoise(0.36, 50, 150, 0, seed)
    const sheepNoise = simpleThreshNoise(0.36, 50, 150, -0.9, seed)
    const animRunNoise = simpleThreshNoise(0.36, 50, 150, -0.5, seed)
    this.metaNoiseGenerators = [
      bodyNoise,
      body2Noise,
      hatNoise,
      swordNoise,
      shieldNoise,
      sheepNoise,
      animRunNoise
    ]
  }

  sampleMeta(id: number) {
    const key = id.toString()
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key)!
    }
    const metaProps = new NamedBitsInNumber(
      this.metaNoiseGenerators.reduce((accum, noise, j) => {
        return (
          accum +
          (noise.getValue(wrap(id * 37, -100, 100), wrap(id * 124, -70, 70)) <<
            j)
        )
      }, 0),
      metaSpriteStrings
    )
    this.validateMeta(metaProps)
    console.log('valid', metaProps.has('sheep'))
    this.metaCache.set(key, metaProps)
    return metaProps
  }
  validateMeta(val: NamedBitsInNumber<typeof metaSpriteStrings>) {
    if (!val.has('body') && !val.has('body2')) {
      val.enableBit('body')
    }
    if (val.has('body')) {
      val.disableBit('body2')
    }
    if (val.has('sheep')) {
      val.disableBit('body2')
      val.disableBit('body')
      val.enableBit('animRun')
    } else if (val.has('animRun')) {
      val.disableBit('animRun')
    }
    return val
  }
  sampleVisProps(metaProps: NamedBitsInNumber<typeof metaSpriteStrings>) {
    const visProps = new NamedBitsInBytes(
      new Uint8Array(this.bytesPerTile),
      visualSpriteStrings
    )

    if (metaProps.has('sheep')) {
      if (metaProps.has('animRun')) {
        const time =
          (metaProps.has('animTime1') ? 1 : 0) +
          (metaProps.has('animTime2') ? 2 : 0) +
          (metaProps.has('animTime4') ? 4 : 0)
        visProps.enableBit('sheepRun' + time)
      } else {
        visProps.enableBit('sheep')
      }
    } else {
      if (metaProps.has('body')) {
        visProps.enableBit('body')
      }
      if (metaProps.has('body2')) {
        visProps.enableBit('body2')
      }

      if (metaProps.has('hat')) {
        visProps.enableBit('hat')
      }
      if (metaProps.has('sword')) {
        visProps.enableBit('sword')
      }
      if (metaProps.has('shield')) {
        visProps.enableBit('shield')
      }
    }
    return visProps
  }

  sampleVisIds(
    sprite: SpriteController,
    time: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' = '0'
  ) {
    const visProps = this.sampleVisProps(sprite.metaBytes)
    const bottomAndTopIds: BottomAndTopIds = this.sampleVisIdsByVisProps(
      visProps,
      sprite.angle
    )
    return bottomAndTopIds
  }

  sampleVisIdsByVisProps(
    visProps: NamedBitsInBytes<typeof visualSpriteStrings>,
    angle: number
  ) {
    const idBottom = this._spriteMaker.getTileIdAtAngle(visProps.bytes, angle)
    const visProps2 = visProps.bytes.slice()
    visProps2[0] |= 1
    const idTop = this._spriteMaker.getTileIdAtAngle(visProps2, angle)

    const bottomAndTopIds: BottomAndTopIds = {
      idBottom,
      idTop
    }
    return bottomAndTopIds
  }
  updateVis(bottomPointsGeo: BufferGeometry, topPointsGeo: BufferGeometry) {
    if (this._sprites.length > 0) {
      const ppt = this._pixelsPerTile
      const xyBottomAttr = bottomPointsGeo.getAttribute('xy')
      const xyBottomArr = xyBottomAttr.array as number[]
      const idBottomAttr = bottomPointsGeo.getAttribute('id')
      const idBottomArr = idBottomAttr.array as number[]
      const xyTopAttr = topPointsGeo.getAttribute('xy')
      const xyTopArr = xyTopAttr.array as number[]
      const idTopAttr = topPointsGeo.getAttribute('id')
      const idTopArr = idTopAttr.array as number[]
      bottomPointsGeo.drawRange.count = 0
      topPointsGeo.drawRange.count = 0
      let j = 0
      for (let i = 0; i < this._sprites.length; i++) {
        const sprite = this._sprites[i]
        const currentFrame =
          __animFrameTimes[sprite.animFrame % __animFrameTimes.length]
        const x = sprite.x - this.offsetX
        const y = sprite.y - this.offsetY
        if (x < 0 || x > this._viewWidth || y < 0 || y > this._viewHeight) {
          continue
        }
        const xSnap = Math.round(wrap(x, 0, this._viewWidth) * ppt) / ppt
        const ySnap = Math.round(wrap(y, 0, this._viewHeight) * ppt) / ppt
        const id = sprite.id
        const j2 = j * 2
        xyBottomArr[j2] = xSnap
        xyBottomArr[j2 + 1] = ySnap
        xyTopArr[j2] = xSnap
        xyTopArr[j2 + 1] = ySnap + 1
        const frame = sprite.metaBytes.has('animRun') ? currentFrame : undefined
        const sample = this.sampleVisIds(sprite, frame)
        idBottomArr[j] = sample.idBottom
        idTopArr[j] = sample.idTop
        j++
      }
      bottomPointsGeo.drawRange.count = j
      topPointsGeo.drawRange.count = j
      if (j === 0) {
        return false
      }
      xyBottomAttr.needsUpdate = true
      idBottomAttr.needsUpdate = true
      xyTopAttr.needsUpdate = true
      idTopAttr.needsUpdate = true
      return true
    } else {
      return false
    }
  }
}
