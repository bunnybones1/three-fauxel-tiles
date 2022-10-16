import { BufferGeometry } from 'three'
import NoiseHelper2D from '../../../helpers/utils/NoiseHelper2D'
import ThreshNoiseHelper2D from '../../../helpers/utils/ThreshNoiseHelper2D'
import { wrap } from '../../../utils/math'

import SpriteMaker from './SpriteMaker'

const masks32: number[] = []
for (let i = 0; i < 32; i++) {
  masks32[i] = 1 << i
}

type MetaSprite = 'body' | 'body2' | 'hat' | 'sword' | 'shield'

const masks8: number[] = []
for (let i = 0; i < 8; i++) {
  masks8[i] = 1 << i
}

export class SpriteController {
  constructor(
    public x: number,
    public y: number,
    public id: number,
    public metaBytes: number,
    public angle: number
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
    const sprite = new SpriteController(x, y, id, this.sampleMeta(id), angle)
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
  metaPropertyLookup: MetaSprite[]
  visualPropertyLookup: string[]
  metaNoiseGenerators: ThreshNoiseHelper2D[]
  bytesPerTile: number
  localMetaProps: number
  visProps: Uint8Array
  metaCache: Map<string, number> = new Map() //maybe change this caching mechanism for something more memory friendly. e.i. Map<number, <Map<number, number>> ?
  metaPropertyMasks: number[]
  dirtyMeta: Set<string> = new Set()
  constructor(
    private _spriteMaker: SpriteMaker,
    private _pixelsPerTile: number,
    private _viewWidth: number,
    private _viewHeight: number
  ) {
    this.metaPropertyLookup = ['body', 'body2', 'hat', 'sword', 'shield']

    this.visualPropertyLookup = [
      'layer2',
      'body',
      'body2',
      'hat',
      'sword',
      'shield',
      '180',
      '90',
      '45'
    ]
    this.bytesPerTile = Math.ceil(this.visualPropertyLookup.length / 8)

    const seed = 1
    const bodyNoise = ThreshNoiseHelper2D.simple(0.1, 0, 0, 0, seed)
    const body2Noise = ThreshNoiseHelper2D.simple(0.08, -100, -100, 0, seed)
    const hatNoise = ThreshNoiseHelper2D.simple(0.06, -50, -50, 0.5, seed)
    const goldNoise = ThreshNoiseHelper2D.simple(0.16, 50, -50, 0, seed)
    const swordNoise = ThreshNoiseHelper2D.simple(0.26, 50, 50, 0, seed)
    const shieldNoise = ThreshNoiseHelper2D.simple(0.36, 50, 150, 0, seed)
    this.metaNoiseGenerators = [
      bodyNoise,
      body2Noise,
      hatNoise,
      goldNoise,
      swordNoise,
      shieldNoise
    ]
  }

  sampleMeta(id: number) {
    const key = id.toString()
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key)!
    }
    this.localMetaProps = this.metaNoiseGenerators.reduce((accum, noise, j) => {
      return (
        accum +
        (noise.getTreshold(wrap(id * 37, -100, 100), wrap(id * 124, -70, 70)) <<
          j)
      )
    }, 0)
    return this.validateLocalMeta(id)
  }
  flipMeta(id: number, meta: MetaSprite, validate = true) {
    this.writeMeta(id, this.metaBitsFlip(this.sampleMeta(id), meta))
    if (validate) {
      this.validateLocalMeta(id)
    }
  }
  metaBitsHas(val: number, maskName: MetaSprite) {
    return val & masks32[this.metaPropertyLookup.indexOf(maskName)]
  }

  metaBitsFlip(val: number, maskName: MetaSprite) {
    return val ^ masks32[this.metaPropertyLookup.indexOf(maskName)]
  }

  visualBitsEnable(val: Uint8Array, maskName: string) {
    const i = this.visualPropertyLookup.indexOf(maskName)
    const ib = ~~(i / 8)
    const i8 = i % 8
    val[ib] |= masks8[i8]
  }
  localMetaBitsFlip(maskName: MetaSprite) {
    this.localMetaProps = this.metaBitsFlip(this.localMetaProps, maskName)
  }
  localMetaBitsHas(maskName: MetaSprite) {
    return this.metaBitsHas(this.localMetaProps, maskName)
  }
  writeMeta(id: number, meta: number) {
    const key = id.toString()
    if (this.metaCache.has(key) && this.metaCache.get(key)) {
      this.metaCache.set(key, meta)
    }
    this.dirtyMeta.add(key)
    this.localMetaProps = meta
  }
  validateLocalMeta(id: number) {
    const key = id.toString()

    // this.localMetaProps = this.metaNoiseGenerators[2].getTreshold(x, y, 0.5) << 4

    if (!this.localMetaBitsHas('body') && !this.localMetaBitsHas('body2')) {
      this.localMetaBitsFlip('body')
    }
    if (this.localMetaBitsHas('body') && this.localMetaBitsHas('body2')) {
      this.localMetaBitsFlip('body2')
    }
    this.metaCache.set(key, this.localMetaProps)
    return this.localMetaProps
  }
  myVisualBitsEnable(maskName: string) {
    this.visualBitsEnable(this.visProps, maskName)
  }
  sampleVis(id: number, angle: number) {
    const metaProps = this.sampleMeta(id)
    this.localMetaProps = metaProps

    this.visProps = new Uint8Array(this.bytesPerTile)

    this.myVisualBitsEnable(this.localMetaBitsHas('body') ? 'body' : 'body2')

    if (this.localMetaBitsHas('hat')) {
      this.myVisualBitsEnable('hat')
    }
    if (this.localMetaBitsHas('sword')) {
      this.myVisualBitsEnable('sword')
    }
    if (this.localMetaBitsHas('shield')) {
      this.myVisualBitsEnable('shield')
    }
    const idBottom = this._spriteMaker.getTileIdAtAngle(this.visProps, angle)
    const visProps2 = this.visProps.slice()
    visProps2[0] |= 1
    const idTop = this._spriteMaker.getTileIdAtAngle(visProps2, angle)
    // const indexBottomX = (idBottom * 8) % 256
    // const indexBottomY = ~~(idBottom / 32) * 8
    // const indexTopX = (idTop * 8) % 256
    // const indexTopY = ~~(idTop / 32) * 8
    return {
      idBottom,
      idTop
    }
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
        const x = sprite.x - this.offsetX
        const y = sprite.y - this.offsetY
        if (x < 0 || x > this._viewWidth || y < 0 || y > this._viewHeight) {
          continue
        }
        const xSnap = Math.round(wrap(x, 0, this._viewWidth) * ppt) / ppt
        const ySnap = Math.round(wrap(y, 0, this._viewHeight) * ppt) / ppt
        const id = sprite.metaBytes
        const j2 = j * 2
        xyBottomArr[j2] = xSnap
        xyBottomArr[j2 + 1] = ySnap
        xyTopArr[j2] = xSnap
        xyTopArr[j2 + 1] = ySnap + 1
        const sample = this.sampleVis(id, sprite.angle)
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
