import { BufferGeometry } from 'three'
import { initOffset } from '../../../constants'
import AdditiveGroupHelper2D from '../../../helpers/utils/AdditiveGroupHelper2D'
import ClampHelper2D from '../../../helpers/utils/ClampHelper2D'
import { simpleThreshNoise } from '../../../helpers/utils/helper2DFactory'
import NamedBitsInBytes from '../../../helpers/utils/NamedBitsInBytes'
import NamedBitsInNumber from '../../../helpers/utils/NamedBitsInNumber'
import NoiseHelper2D from '../../../helpers/utils/NoiseHelper2D'
import StephHelper2D from '../../../helpers/utils/StepHelper2D'
import InvertHelper2D from '../../../helpers/utils/InvertHelper2D'
import { CardinalStrings } from '../../../meshes/factorySand'
import { getUrlFlag } from '../../../utils/location'
import { wrap } from '../../../utils/math'

import MapTileMaker from './MapTileMaker'

const metaTileStrings = [
  'water',
  'dirt',
  'sand',
  'beach',
  'floor',
  'beam',
  'bricks',
  'drywall',
  'grass',
  'bush',
  'goldPile',
  'lampPost',
  'testObject',
  'pyramid',
  'rockyGround',
  'rocks',
  'goldOreForRocks',
  'silverOreForRocks',
  'ironOreForRocks',
  'copperOreForRocks',
  'harvested',
  'treePine',
  'maturePlant',
  'treeMaple'
] as const

type MetaTile = typeof metaTileStrings[number]

type BottomAndTopIds = {
  idTop: number
  idBottom: number
}

type NamedMetaBits = NamedBitsInNumber<typeof metaTileStrings>

const __animFrameTimes = ['0', '1', '2', '3'] as const

export default class JITTileSampler {
  onTileMade = (index: number) => {
    this.indicesOfNewlyMadeTiles.add(index)
    this.dirty = true
  }
  dirty: boolean
  indicesOfMadeTiles: Set<number> = new Set()
  indicesOfNewlyMadeTiles: Set<number> = new Set()
  private _animFrame: number
  public get animFrame(): number {
    return this._animFrame
  }
  public set animFrame(value: number) {
    if (value === this._animFrame) {
      return
    }
    this.dirty = true
    this._animFrame = value
  }
  get offsetX(): number {
    return this._offsetX
  }
  set offsetX(value: number) {
    this._offsetsDirty = true
    this.dirty = true
    this._offsetX = value
  }
  get offsetY(): number {
    return this._offsetY
  }
  set offsetY(value: number) {
    this._offsetsDirty = true
    this.dirty = true
    this._offsetY = value
  }
  get tileMaker(): MapTileMaker {
    return this._tileMaker
  }
  set tileMaker(value: MapTileMaker) {
    throw new Error('Cannot change tileMaker during runtime')
  }
  metaNoiseGenerators: StephHelper2D[]
  bytesPerTile: number
  // localMetaProps: number
  // visProps: Uint8Array
  metaRawCache: Map<string, NamedMetaBits> = new Map() //maybe change this caching mechanism for something more memory friendly. e.i. Map<number, <Map<number, number>> ?
  metaCache: Map<string, NamedMetaBits> = new Map() //maybe change this caching mechanism for something more memory friendly. e.i. Map<number, <Map<number, number>> ?
  dirtyMeta: Set<string> = new Set()
  dirtyVis: Set<string> = new Set()
  private _offsetX = initOffset.x
  private _offsetY = initOffset.y
  private _offsetsDirty: boolean
  get offsetsDirty(): boolean {
    return this._offsetsDirty
  }
  set offsetsDirty(value: boolean) {
    this._offsetsDirty = value
  }
  private _offsetXOld = initOffset.x
  private _offsetYOld = -initOffset.y
  constructor(
    private _tileMaker: MapTileMaker,
    private _viewWidthInTiles: number,
    private _viewHeightInTiles: number
  ) {
    this.bytesPerTile = Math.ceil(
      _tileMaker.visualPropertyLookupStrings.length / 8
    )

    const seed = 1
    const floorNoise = simpleThreshNoise(0.1, 0, 0, 0.5, seed)
    const sandNoise = simpleThreshNoise(0.1, -182, 237, 0.5, seed)
    const beachNoise = simpleThreshNoise(0.1, -182, 237, -0.2, seed)
    const waterBase = new AdditiveGroupHelper2D([
      new NoiseHelper2D(0.02, 0, 0, seed),
      new NoiseHelper2D(0.08, 0, 0, seed, 0.5)
    ])
    const waterNoise = new StephHelper2D(waterBase)
    const dirtNoise = new StephHelper2D(new InvertHelper2D(sandNoise))
    const beamNoise = simpleThreshNoise(0.08, -100, -100, 0.4, seed)
    const bricksNoise = simpleThreshNoise(0.06, -50, -50, 0.5, seed)
    const drywallNoise = simpleThreshNoise(0.05, 20, 20, 0.5, seed)
    const grassNoise = new StephHelper2D(
      new AdditiveGroupHelper2D([
        new NoiseHelper2D(0.15, 100, 200, seed),
        new NoiseHelper2D(0.01, 100, 200, seed)
      ]),
      -0.5
    )
    const bushNoise = simpleThreshNoise(0.3, 300, 200, 0.25, seed)
    const goldNoise = simpleThreshNoise(3, -300, 200, 0.75, seed)
    const lampPostNoise = simpleThreshNoise(3, -1300, 200, 0.75, seed)
    const testObjectNoise = simpleThreshNoise(3, -100, -300, 0.75, seed)
    const pyramidNoise = simpleThreshNoise(3, -204, -121, 0.85, seed)
    const rockyGroundNoise = simpleThreshNoise(3, 204, -121, 0.25, seed)
    const rocksNoiseBase = new AdditiveGroupHelper2D([
      new NoiseHelper2D(0.01, 604, -121, seed),
      new NoiseHelper2D(0.05, 604, -121, seed, 0.5)
    ])
    const rocksNoise = new StephHelper2D(rocksNoiseBase, 0.7)
    const goldOreForRocksNoise = new StephHelper2D(
      new AdditiveGroupHelper2D([
        new ClampHelper2D(rocksNoiseBase),
        new NoiseHelper2D(0.8, 604, -121, seed, 0.2, -0.1)
      ]),
      1.07
    )
    const silverOreForRocksNoise = new StephHelper2D(
      new AdditiveGroupHelper2D([
        new ClampHelper2D(rocksNoiseBase),
        new NoiseHelper2D(0.8, -604, -121, seed, 0.2, -0.1)
      ]),
      1.05
    )
    const ironOreForRocksNoise = new StephHelper2D(
      new AdditiveGroupHelper2D([
        new ClampHelper2D(rocksNoiseBase),
        new NoiseHelper2D(0.8, 404, 121, seed, 0.2, -0.15)
      ]),
      0.95
    )
    const copperOreForRocksNoise = new StephHelper2D(
      new AdditiveGroupHelper2D([
        new ClampHelper2D(rocksNoiseBase),
        new NoiseHelper2D(0.8, 504, 121, seed, 0.2, -0.15)
      ]),
      0.97
    )
    const harvestedNoise = simpleThreshNoise(0.08, -500, -100, 0.35, seed)
    const treePineNoise = simpleThreshNoise(0.3, -200, -400, 0.5, seed)
    const plantMatureNoise = simpleThreshNoise(3, -340, -460, 0.25, seed)
    const treeMapleNoise = simpleThreshNoise(0.3, 200, 400, 0.6, seed)
    this.metaNoiseGenerators = [
      waterNoise,
      dirtNoise,
      sandNoise,
      beachNoise,
      floorNoise,
      beamNoise,
      bricksNoise,
      drywallNoise,
      grassNoise,
      bushNoise,
      goldNoise,
      lampPostNoise,
      testObjectNoise,
      pyramidNoise,
      rockyGroundNoise,
      rocksNoise,
      goldOreForRocksNoise,
      silverOreForRocksNoise,
      ironOreForRocksNoise,
      copperOreForRocksNoise,
      harvestedNoise,
      treePineNoise,
      plantMatureNoise,
      treeMapleNoise
    ]
  }
  writeMeta(x: number, y: number, meta: NamedMetaBits) {
    const key = x + ':' + y
    if (this.metaCache.has(key) && this.metaCache.get(key)) {
      this.metaCache.set(key, meta)
    }
    this.dirtyMeta.add(key)
  }
  sampleMetaRaw(x: number, y: number) {
    const key = x + ':' + y
    if (this.metaRawCache.has(key)) {
      return this.metaRawCache.get(key)!
    }
    const metaRaw = new NamedBitsInNumber(
      this.metaNoiseGenerators.reduce((accum, noise, j) => {
        return accum + (noise.getValue(x, y) << j)
      }, 0),
      metaTileStrings
    )
    this.metaRawCache.set(key, metaRaw)
    return metaRaw
  }
  sampleMeta(x: number, y: number) {
    const key = x + ':' + y
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key)!
    }
    const metaProps = new NamedBitsInNumber(
      this.sampleMetaRaw(x, y).value,
      metaTileStrings
    )
    this.validateLocalMeta(metaProps, x, y)
    return metaProps
  }
  validateLocalMeta(val: NamedMetaBits, x: number, y: number) {
    const key = x + ':' + y

    // this.localMetaProps = this.metaNoiseGenerators[2].getTreshold(x, y, 0.5) << 4
    const hasRocks = val.has('rocks')
    const hasSand = val.has('sand')
    const hasBeach = val.has('beach')
    const hasDirt = val.has('dirt')
    const hasGold = val.has('goldOreForRocks')
    const hasSilver = val.has('silverOreForRocks')
    const hasIron = val.has('ironOreForRocks')
    const hasCopper = val.has('copperOreForRocks')

    if (val.has('water')) {
      val.value = 0
      if (hasRocks) {
        val.enableBit('rocks')
      }
      if (
        this.sampleMetaRaw(x + 1, y).has('water') &&
        this.sampleMetaRaw(x - 1, y).has('water') &&
        this.sampleMetaRaw(x, y + 1).has('water') &&
        this.sampleMetaRaw(x, y - 1).has('water') &&
        this.sampleMetaRaw(x + 1, y + 1).has('water') &&
        this.sampleMetaRaw(x + 1, y - 1).has('water') &&
        this.sampleMetaRaw(x - 1, y + 1).has('water') &&
        this.sampleMetaRaw(x - 1, y - 1).has('water')
      ) {
        val.enableBit('water')
      } else {
        // if (!hasSand && !hasDirt) {
        //   val.enableBit('beach')
        // }
        if (hasSand) {
          val.enableBit('sand')
        }
        if (hasDirt) {
          if (hasBeach) {
            val.enableBit('sand')
          } else {
            val.enableBit('dirt')
          }
        }
      }
    }

    if (val.has('sand')) {
      val.disableBit('dirt')
      val.disableBit('grass')
    }

    if (Math.abs(x) > 10 || Math.abs(y) > 10) {
      val.disableBit('floor')
      val.disableBit('bricks')
      val.disableBit('beam')
      val.disableBit('drywall')
      val.disableBit('lampPost')
      val.disableBit('pyramid')
      val.disableBit('testObject')
      val.disableBit('goldPile')
    }

    if (Math.abs(x) > 16 || Math.abs(y) > 16) {
      val.disableBit('harvested')
    }

    if (!val.has('floor') && val.has('beam')) {
      val.flipBit('beam')
    }
    if (val.has('beam') && val.has('grass')) {
      val.flipBit('grass')
    }
    if (!val.has('beam') && val.has('bricks')) {
      val.flipBit('bricks')
    }
    if (val.has('floor') && val.has('grass')) {
      val.flipBit('grass')
    }
    if (val.has('floor') && val.has('bush')) {
      val.flipBit('bush')
    }
    if (!val.has('grass') && val.has('bush')) {
      val.flipBit('bush')
    }
    if (val.has('testObject') && (val.has('bush') || val.has('pyramid'))) {
      val.flipBit('testObject')
    }
    if (
      val.has('lampPost') &&
      (val.has('beam') ||
        val.has('bush') ||
        val.has('bricks') ||
        val.has('goldPile') ||
        val.has('testObject'))
    ) {
      val.flipBit('lampPost')
    }

    if (
      val.has('pyramid') &&
      (val.has('bush') ||
        val.has('beam') ||
        val.has('lampPost') ||
        val.has('lampPost') ||
        val.has('grass') ||
        !val.has('floor') ||
        val.has('goldPile'))
    ) {
      val.flipBit('pyramid')
    }

    if (
      val.has('rockyGround') &&
      (val.has('beam') ||
        val.has('bush') ||
        val.has('floor') ||
        val.has('grass') ||
        val.has('bricks') ||
        val.has('goldPile') ||
        val.has('testObject'))
    ) {
      val.flipBit('rockyGround')
    }

    if (hasRocks) {
      const wasHarvested = val.has('harvested')
      val.value = 0
      if (val.has('sand')) {
        val.enableBit('sand')
      } else {
        val.enableBit('dirt')
      }
      val.flipBit('rocks')
      if (hasGold && !hasCopper && !hasIron) {
        val.flipBit('goldOreForRocks')
      }
      if (hasSilver && !hasCopper && !hasIron) {
        val.flipBit('silverOreForRocks')
      }
      if (hasIron) {
        val.flipBit('ironOreForRocks')
      }
      if (hasCopper) {
        val.flipBit('copperOreForRocks')
      }
      if (wasHarvested) {
        val.flipBit('harvested')
      }
    }

    const hasAnyTree = val.has('treePine') || val.has('treeMaple')

    if (hasAnyTree && val.has('bush')) {
      val.flipBit('bush')
    }
    if (hasAnyTree && val.has('goldPile')) {
      val.flipBit('goldPile')
    }
    if (hasAnyTree && val.has('testObject')) {
      val.flipBit('testObject')
    }
    if (val.has('lampPost') || !val.has('grass')) {
      if (val.has('treePine')) {
        val.flipBit('treePine')
      }
      if (val.has('treeMaple')) {
        val.flipBit('treeMaple')
      }
    }

    if (val.has('treePine') && val.has('treeMaple')) {
      val.flipBit('treeMaple')
    }

    //TEST SIMPLER MAP
    if (getUrlFlag('simple')) {
      // const item = val.has('testObject')
      // const keepGrass = val.has('grass')
      // this.localMetaProps = 0
      // if (keepGrass) {
      //   val.flipBit('grass')
      // }
      // if (keepGrass && item) {
      //   val.flipBit('testObject')
      // }

      // const item = val.has('floor')
      // const item2 = val.has('beam')
      // const item3 = val.has('bricks')
      // val.value = 0
      // if (item) {
      //   val.flipBit('floor')
      // }
      // if (item2) {
      //   val.flipBit('beam')
      // }
      // if (item3) {
      //   val.flipBit('bricks')
      // }

      const item = val.has('treeMaple')
      const item2 = val.has('treePine')
      const item3 = val.has('bush')
      // val.value = 0
      if (item) {
        val.flipBit('treeMaple')
      }
      if (item2) {
        val.flipBit('treePine')
      }
      if (item3) {
        val.flipBit('bush')
      }
    }

    this.metaCache.set(key, val)
    return val
  }

  private _visPropsCache: Map<
    string,
    NamedBitsInBytes<typeof this.tileMaker.visualPropertyLookupStrings>
  > = new Map()

  private _bottomAndTopIdsCache: Map<string, BottomAndTopIds> = new Map()

  sampleVisProps(x: number, y: number, time: '0' | '1' | '2' | '3' = '0') {
    const key = `${x}:${y}:${time}`
    if (this._visPropsCache.has(key)) {
      return this._visPropsCache.get(key)!
    } else {
      const metaPropsN = this.sampleMeta(x, y - 1)
      const metaPropsNE = this.sampleMeta(x + 1, y - 1)
      const metaPropsE = this.sampleMeta(x + 1, y)
      const metaPropsSE = this.sampleMeta(x + 1, y + 1)
      const metaPropsS = this.sampleMeta(x, y + 1)
      const metaPropsSW = this.sampleMeta(x - 1, y + 1)
      const metaPropsW = this.sampleMeta(x - 1, y)
      const metaPropsNW = this.sampleMeta(x - 1, y - 1)

      const metaProps = this.sampleMeta(x, y)

      const visProps = new NamedBitsInBytes(
        new Uint8Array(this.bytesPerTile),
        this.tileMaker.visualPropertyLookupStrings
      )

      this._visPropsCache.set(key, visProps)

      let needsWater = false
      const waterMask = metaProps.makeFastMask('water')
      const sandMask = metaProps.makeFastMask('sand')
      const dirtMask = metaProps.makeFastMask('dirt')
      const makeCardinalBits = (mask: number) => {
        const cardinalBits = new NamedBitsInNumber(0, CardinalStrings)
        if (metaProps.hasFast(mask)) {
          cardinalBits.enableBit('c')
          cardinalBits.enableBit('ne')
          cardinalBits.enableBit('se')
          cardinalBits.enableBit('nw')
          cardinalBits.enableBit('sw')
          cardinalBits.enableBit('n')
          cardinalBits.enableBit('s')
          cardinalBits.enableBit('e')
          cardinalBits.enableBit('w')
          if (!(metaPropsN.hasFast(mask) || metaPropsE.hasFast(mask))) {
            cardinalBits.disableBit('ne')
            needsWater = true
          }
          if (!(metaPropsS.hasFast(mask) || metaPropsE.hasFast(mask))) {
            cardinalBits.disableBit('se')
            needsWater = true
          }
          if (!(metaPropsN.hasFast(mask) || metaPropsW.hasFast(mask))) {
            cardinalBits.disableBit('nw')
            needsWater = true
          }
          if (!(metaPropsS.hasFast(mask) || metaPropsW.hasFast(mask))) {
            cardinalBits.disableBit('sw')
            needsWater = true
          }
        } else {
          needsWater = true
          const majorN = metaPropsN.hasFast(mask)
          if (majorN) {
            cardinalBits.enableBit('n')
          }
          const majorS = metaPropsS.hasFast(mask)
          if (majorS) {
            cardinalBits.enableBit('s')
          }
          const majorE = metaPropsE.hasFast(mask)
          if (majorE) {
            cardinalBits.enableBit('e')
          }
          const majorW = metaPropsW.hasFast(mask)
          if (majorW) {
            cardinalBits.enableBit('w')
          }
          if (metaPropsNE.hasFast(mask) && (majorN || majorE)) {
            cardinalBits.enableBit('ne')
          }
          if (metaPropsSW.hasFast(mask) && (majorS || majorW)) {
            cardinalBits.enableBit('sw')
          }
          if (metaPropsSE.hasFast(mask) && (majorS || majorE)) {
            cardinalBits.enableBit('se')
          }
          if (metaPropsNW.hasFast(mask) && (majorN || majorW)) {
            cardinalBits.enableBit('nw')
          }
        }
        return cardinalBits
      }
      const sandBits = makeCardinalBits(dirtMask)
      const dirtBits = makeCardinalBits(sandMask)

      for (const params of [
        ['dirt', dirtBits],
        ['sand', sandBits]
      ] as const) {
        const baseName = params[0]
        const cardinalBits = params[1]
        const quads = [
          [
            cardinalBits.has('nw'),
            cardinalBits.has('n'),
            cardinalBits.has('w'),
            cardinalBits.has('c')
          ], //nw
          [
            cardinalBits.has('n'),
            cardinalBits.has('ne'),
            cardinalBits.has('c'),
            cardinalBits.has('e')
          ], //ne
          [
            cardinalBits.has('w'),
            cardinalBits.has('c'),
            cardinalBits.has('sw'),
            cardinalBits.has('s')
          ], //sw
          [
            cardinalBits.has('c'),
            cardinalBits.has('e'),
            cardinalBits.has('s'),
            cardinalBits.has('se')
          ] //se
        ]

        for (let quadId = 0; quadId < quads.length; quadId++) {
          const quad = quads[quadId]
          const heightCode =
            (quad[0] ? 1 : 0) +
            (quad[1] ? 2 : 0) +
            (quad[2] ? 4 : 0) +
            (quad[3] ? 8 : 0)
          if (heightCode > 0) {
            const groundId = `${baseName}${
              quadId * 16 + heightCode
            }` as unknown as typeof this.tileMaker.visualPropertyLookupStrings
            visProps.enableBit(groundId)
          }
        }
      }

      const maxWater = 8
      if (needsWater || metaProps.hasFast(waterMask)) {
        let landDist = maxWater - 1
        for (let i = 0; i < maxWater; i++) {
          const waterN = this.sampleMeta(x, y - i - 1)
          if (!waterN.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterS = this.sampleMeta(x, y + i + 1)
          if (!waterS.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterW = this.sampleMeta(x - i - 1, y)
          if (!waterW.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterE = this.sampleMeta(x + i + 1, y)
          if (!waterE.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterNE = this.sampleMeta(x + i + 1, y - i - 1)
          if (!waterNE.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterSW = this.sampleMeta(x - i - 1, y + i + 1)
          if (!waterSW.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterNW = this.sampleMeta(x - i - 1, y - i - 1)
          if (!waterNW.hasFast(waterMask)) {
            landDist = i
            break
          }
          const waterSE = this.sampleMeta(x + i + 1, y + i + 1)
          if (!waterSE.hasFast(waterMask)) {
            landDist = i
            break
          }
        }
        visProps.enableBit(`water${time}${landDist}`)
      }

      const propMaskGrass = metaProps.makeFastMask('grass')
      if (metaProps.hasFast(propMaskGrass)) {
        visProps.enableBit('grassC')
        if (metaPropsN.has('grass')) {
          visProps.enableBit('grassN')
        }
        if (metaPropsE.hasFast(propMaskGrass)) {
          visProps.enableBit('grassE')
        }
        if (metaPropsS.hasFast(propMaskGrass)) {
          visProps.enableBit('grassS')
        }
        if (metaPropsW.hasFast(propMaskGrass)) {
          visProps.enableBit('grassW')
        }
        if (
          metaPropsNE.hasFast(propMaskGrass) &&
          metaPropsN.hasFast(propMaskGrass) &&
          metaPropsE.hasFast(propMaskGrass)
        ) {
          visProps.enableBit('grassNE')
        }
        if (
          metaPropsNW.hasFast(propMaskGrass) &&
          metaPropsN.hasFast(propMaskGrass) &&
          metaPropsW.hasFast(propMaskGrass)
        ) {
          visProps.enableBit('grassNW')
        }
        if (
          metaPropsSE.hasFast(propMaskGrass) &&
          metaPropsS.hasFast(propMaskGrass) &&
          metaPropsE.hasFast(propMaskGrass)
        ) {
          visProps.enableBit('grassSE')
        }
        if (
          metaPropsSW.hasFast(propMaskGrass) &&
          metaPropsS.hasFast(propMaskGrass) &&
          metaPropsW.hasFast(propMaskGrass)
        ) {
          visProps.enableBit('grassSW')
        }
      }
      const propMaskBush = metaProps.makeFastMask('bush')
      if (metaProps.hasFast(propMaskBush)) {
        visProps.enableBit('bushC')
        if (metaPropsN.hasFast(propMaskBush)) {
          visProps.enableBit('bushN')
        }
        if (metaPropsE.hasFast(propMaskBush)) {
          visProps.enableBit('bushE')
        }
        if (metaPropsS.hasFast(propMaskBush)) {
          visProps.enableBit('bushS')
        }
        if (metaPropsW.hasFast(propMaskBush)) {
          visProps.enableBit('bushW')
        }
        if (
          metaPropsNE.hasFast(propMaskBush) &&
          metaPropsN.hasFast(propMaskBush) &&
          metaPropsE.hasFast(propMaskBush)
        ) {
          visProps.enableBit('bushNE')
        }
        if (
          metaPropsNW.hasFast(propMaskBush) &&
          metaPropsN.hasFast(propMaskBush) &&
          metaPropsW.hasFast(propMaskBush)
        ) {
          visProps.enableBit('bushNW')
        }
        if (
          metaPropsSE.hasFast(propMaskBush) &&
          metaPropsS.hasFast(propMaskBush) &&
          metaPropsE.hasFast(propMaskBush)
        ) {
          visProps.enableBit('bushSE')
        }
        if (
          metaPropsSW.hasFast(propMaskBush) &&
          metaPropsS.hasFast(propMaskBush) &&
          metaPropsW.hasFast(propMaskBush)
        ) {
          visProps.enableBit('bushSW')
        }
      }
      const propMaskBeam = metaProps.makeFastMask('beam')
      const beamC = metaProps.hasFast(propMaskBeam)
      const beamN = metaPropsN.hasFast(propMaskBeam)
      const beamE = metaPropsE.hasFast(propMaskBeam)
      const beamS = metaPropsS.hasFast(propMaskBeam)
      const beamW = metaPropsW.hasFast(propMaskBeam)
      if (beamC) {
        if (beamE && beamW && !beamS && !beamN) {
          visProps.enableBit('beamEW')
        } else if (!beamE && !beamW && beamS && beamN) {
          visProps.enableBit('beamNS')
        } else {
          visProps.enableBit('beamCenter')
          if (beamE) {
            visProps.enableBit('beamE')
          }
          if (beamW) {
            visProps.enableBit('beamW')
          }
          if (beamN) {
            visProps.enableBit('beamN')
          }
          if (beamS) {
            visProps.enableBit('beamS')
          }
        }
      }
      const propMaskBricks = metaProps.makeFastMask('bricks')
      if (metaProps.hasFast(propMaskBricks)) {
        const bricksS = metaPropsN.hasFast(propMaskBricks)
        const bricksE = metaPropsE.hasFast(propMaskBricks)
        const bricksN = metaPropsS.hasFast(propMaskBricks)
        const bricksW = metaPropsW.hasFast(propMaskBricks)
        if (bricksN) {
          visProps.enableBit('bricks0')
          visProps.enableBit('bricks1')
        } else if (!(beamC && beamS)) {
          visProps.enableBit('bricks8')
        }
        if (bricksE) {
          visProps.enableBit('bricks2')
          visProps.enableBit('bricks3')
        } else if (!(beamC && beamE)) {
          visProps.enableBit('bricks9')
        }
        if (bricksW) {
          visProps.enableBit('bricks7')
          visProps.enableBit('bricks6')
        } else if (!(beamC && beamW)) {
          visProps.enableBit('bricks11')
        }
        if (bricksS) {
          visProps.enableBit('bricks4')
          visProps.enableBit('bricks5')
        } else if (!(beamC && beamN)) {
          visProps.enableBit('bricks10')
        }
      }
      const propMaskGold = metaProps.makeFastMask('goldPile')
      if (metaProps.hasFast(propMaskGold)) {
        visProps.enableBit('goldPile')
      }
      const propMaskLampPost = metaProps.makeFastMask('lampPost')
      if (metaProps.hasFast(propMaskLampPost)) {
        visProps.enableBit('lampPost')
      }
      const propMaskTestObject = metaProps.makeFastMask('testObject')
      if (metaProps.hasFast(propMaskTestObject)) {
        visProps.enableBit('testObject')
      }
      const propMaskPyramid = metaProps.makeFastMask('pyramid')
      if (metaProps.hasFast(propMaskPyramid)) {
        visProps.enableBit('pyramid')
      }
      const propMaskRockyGround = metaProps.makeFastMask('rockyGround')
      if (metaProps.hasFast(propMaskRockyGround)) {
        visProps.enableBit('rockyGround')
      }

      const propMaskRocks = metaProps.makeFastMask('rocks')
      const propMaskHarvested = metaProps.makeFastMask('harvested')

      const isRocksC = metaProps.hasFast(propMaskRocks)
      const isHarvestedC = metaProps.hasFast(propMaskHarvested)
      const isGoldOre = metaProps.has('goldOreForRocks')
      const isSilverOre = metaProps.has('silverOreForRocks')
      const isIronOre = metaProps.has('ironOreForRocks')
      const isCopperOre = metaProps.has('copperOreForRocks')
      if (isRocksC) {
        const isRocksN = metaPropsN.hasFast(propMaskRocks)
        const isHarvestedN = metaPropsN.hasFast(propMaskHarvested)
        const isRocksE = metaPropsE.hasFast(propMaskRocks)
        const isHarvestedE = metaPropsE.hasFast(propMaskHarvested)
        const isRocksS = metaPropsS.hasFast(propMaskRocks)
        const isHarvestedS = metaPropsS.hasFast(propMaskHarvested)
        const isRocksW = metaPropsW.hasFast(propMaskRocks)
        const isHarvestedW = metaPropsW.hasFast(propMaskHarvested)
        const isRocksNE = metaPropsNE.hasFast(propMaskRocks)
        const isHarvestedNE = metaPropsNE.hasFast(propMaskHarvested)
        const isRocksSE = metaPropsSE.hasFast(propMaskRocks)
        const isHarvestedSE = metaPropsSE.hasFast(propMaskHarvested)
        const isRocksSW = metaPropsSW.hasFast(propMaskRocks)
        const isHarvestedSW = metaPropsSW.hasFast(propMaskHarvested)
        const isRocksNW = metaPropsNW.hasFast(propMaskRocks)
        const isHarvestedNW = metaPropsNW.hasFast(propMaskHarvested)

        visProps.enableBit(isHarvestedC ? 'rockCrumbsC' : 'rocksC')
        if (isRocksN) {
          visProps.enableBit(
            isHarvestedN || isHarvestedC ? 'rockCrumbsN' : 'rocksN'
          )
        }
        if (isRocksS) {
          visProps.enableBit(
            isHarvestedS || isHarvestedC ? 'rockCrumbsS' : 'rocksS'
          )
        }
        if (isRocksE) {
          visProps.enableBit(
            isHarvestedE || isHarvestedC ? 'rockCrumbsE' : 'rocksE'
          )
        }
        if (isRocksW) {
          visProps.enableBit(
            isHarvestedW || isHarvestedC ? 'rockCrumbsW' : 'rocksW'
          )
        }

        if (isRocksW && isRocksN && isRocksNW) {
          visProps.enableBit(
            isHarvestedW || isHarvestedN || isHarvestedNW || isHarvestedC
              ? 'rockCrumbsNW'
              : 'rocksNW'
          )
        }
        if (isRocksE && isRocksN && isRocksNE) {
          visProps.enableBit(
            isHarvestedE || isHarvestedN || isHarvestedNE || isHarvestedC
              ? 'rockCrumbsNE'
              : 'rocksNE'
          )
        }
        if (isRocksW && isRocksS && isRocksSW) {
          visProps.enableBit(
            isHarvestedW || isHarvestedS || isHarvestedSW || isHarvestedC
              ? 'rockCrumbsSW'
              : 'rocksSW'
          )
        }
        if (isRocksE && isRocksS && isRocksSE) {
          visProps.enableBit(
            isHarvestedE || isHarvestedS || isHarvestedSE || isHarvestedC
              ? 'rockCrumbsSE'
              : 'rocksSE'
          )
        }

        if (!isHarvestedC) {
          if (
            isRocksN &&
            isRocksE &&
            isRocksS &&
            isRocksW &&
            !isHarvestedN &&
            !isHarvestedE &&
            !isHarvestedS &&
            !isHarvestedW
          ) {
            visProps.enableBit('rocksCBig')
            if (isGoldOre) {
              visProps.enableBit('goldOreForBigRocks')
            }
            if (isSilverOre) {
              visProps.enableBit('silverOreForBigRocks')
            }
            if (isIronOre) {
              visProps.enableBit('ironOreForBigRocks')
            }
            if (isCopperOre) {
              visProps.enableBit('copperOreForBigRocks')
            }
          } else {
            if (isGoldOre) {
              visProps.enableBit('goldOreForRocks')
            }
            if (isSilverOre) {
              visProps.enableBit('silverOreForRocks')
            }
            if (isIronOre) {
              visProps.enableBit('ironOreForRocks')
            }
            if (isCopperOre) {
              visProps.enableBit('copperOreForRocks')
            }
          }
        }
      }

      const propMaskMaturePlant = metaProps.makeFastMask('maturePlant')

      const propMaskTreePine = metaProps.makeFastMask('treePine')
      if (
        metaProps.hasFast(propMaskTreePine) &&
        !metaProps.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${metaProps.hasFast(propMaskMaturePlant) ? 'Mature' : ''}C`
        )
      }
      if (
        metaPropsE.hasFast(propMaskTreePine) &&
        !metaPropsE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${metaPropsE.hasFast(propMaskMaturePlant) ? 'Mature' : ''}E`
        )
      }
      if (
        metaPropsW.hasFast(propMaskTreePine) &&
        !metaPropsW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${metaPropsW.hasFast(propMaskMaturePlant) ? 'Mature' : ''}W`
        )
      }
      if (
        metaPropsN.hasFast(propMaskTreePine) &&
        !metaPropsN.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${metaPropsN.hasFast(propMaskMaturePlant) ? 'Mature' : ''}N`
        )
      }
      if (
        metaPropsS.hasFast(propMaskTreePine) &&
        !metaPropsS.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${metaPropsS.hasFast(propMaskMaturePlant) ? 'Mature' : ''}S`
        )
      }
      if (
        metaPropsNE.hasFast(propMaskTreePine) &&
        !metaPropsNE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${
            metaPropsNE.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }NE`
        )
      }
      if (
        metaPropsSW.hasFast(propMaskTreePine) &&
        !metaPropsSW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${
            metaPropsSW.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }SW`
        )
      }
      if (
        metaPropsNW.hasFast(propMaskTreePine) &&
        !metaPropsNW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${
            metaPropsNW.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }NW`
        )
      }
      if (
        metaPropsSE.hasFast(propMaskTreePine) &&
        !metaPropsSE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePine${
            metaPropsSE.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }SE`
        )
      }

      if (
        metaProps.hasFast(propMaskTreePine) &&
        metaProps.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treePineStump${
            metaProps.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }`
        )
      }

      const propMaskTreeMaple = metaProps.makeFastMask('treeMaple')
      if (
        metaProps.hasFast(propMaskTreeMaple) &&
        !metaProps.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${metaProps.hasFast(propMaskMaturePlant) ? 'Mature' : ''}C`
        )
      }
      if (
        metaPropsE.hasFast(propMaskTreeMaple) &&
        !metaPropsE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${metaPropsE.hasFast(propMaskMaturePlant) ? 'Mature' : ''}E`
        )
      }
      if (
        metaPropsW.hasFast(propMaskTreeMaple) &&
        !metaPropsW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${metaPropsW.hasFast(propMaskMaturePlant) ? 'Mature' : ''}W`
        )
      }
      if (
        metaPropsN.hasFast(propMaskTreeMaple) &&
        !metaPropsN.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${metaPropsN.hasFast(propMaskMaturePlant) ? 'Mature' : ''}N`
        )
      }
      if (
        metaPropsS.hasFast(propMaskTreeMaple) &&
        !metaPropsS.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${metaPropsS.hasFast(propMaskMaturePlant) ? 'Mature' : ''}S`
        )
      }
      if (
        metaPropsNE.hasFast(propMaskTreeMaple) &&
        !metaPropsNE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${
            metaPropsNE.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }NE`
        )
      }
      if (
        metaPropsSW.hasFast(propMaskTreeMaple) &&
        !metaPropsSW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${
            metaPropsSW.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }SW`
        )
      }
      if (
        metaPropsNW.hasFast(propMaskTreeMaple) &&
        !metaPropsNW.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${
            metaPropsNW.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }NW`
        )
      }
      if (
        metaPropsSE.hasFast(propMaskTreeMaple) &&
        !metaPropsSE.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMaple${
            metaPropsSE.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }SE`
        )
      }

      if (
        metaProps.hasFast(propMaskTreeMaple) &&
        metaProps.hasFast(propMaskHarvested)
      ) {
        visProps.enableBit(
          `treeMapleStump${
            metaProps.hasFast(propMaskMaturePlant) ? 'Mature' : ''
          }`
        )
      }
      return visProps
    }
  }
  sampleVisIds(x: number, y: number, time: '0' | '1' | '2' | '3' = '0') {
    const key = `${x}:${y}:${time}`
    if (!this._bottomAndTopIdsCache.has(key)) {
      const visProps = this.sampleVisProps(x, y, time)
      const bottomAndTopIds: BottomAndTopIds =
        this.sampleVisIdsByVisProps(visProps)
      this._bottomAndTopIdsCache.set(key, bottomAndTopIds)
      return bottomAndTopIds
    } else {
      return this._bottomAndTopIdsCache.get(key)!
    }
  }
  sampleVisIdsByVisProps(
    visProps: NamedBitsInBytes<
      typeof this.tileMaker.visualPropertyLookupStrings
    >
  ) {
    const idBottom = this._tileMaker.getTileId(visProps.bytes)
    const visProps2 = visProps.bytes.slice()
    visProps2[0] |= 1
    const idTop = this._tileMaker.getTileId(visProps2)

    const bottomAndTopIds: BottomAndTopIds = {
      idBottom,
      idTop
    }
    return bottomAndTopIds
  }
  updateMeta() {
    // if (this._offsetsDirty) {
    // this._offsetsDirty = false
    // if (this._offsetX !== this._offsetXOld) {
    //   let xMin =
    //     this._offsetX < this._offsetXOld ? this._offsetX : this._offsetXOld
    //   let xMax =
    //     this._offsetX > this._offsetXOld ? this._offsetX : this._offsetXOld
    //   if (this._offsetX === xMax) {
    //     xMin += this._viewWidthInTiles
    //     xMax += this._viewWidthInTiles
    //   }
    //   for (let iCol = xMin; iCol < xMax; iCol++) {
    //     for (let iRow = 0; iRow < this._viewHeightInTiles; iRow++) {
    //       const x = this._offsetXOld + iCol
    //       const y = this._offsetYOld + iRow
    //       const key = `${x}:${y}`
    //       this.dirtyMeta.add(key)
    //     }
    //   }
    // }
    // if (this._offsetY !== this._offsetYOld) {
    //   let yMin =
    //     this._offsetY < this._offsetYOld ? this._offsetY : this._offsetYOld
    //   let yMax =
    //     this._offsetY > this._offsetYOld ? this._offsetY : this._offsetYOld
    //   if (this._offsetY === yMin) {
    //     yMin -= this._viewHeightInTiles
    //     yMax -= this._viewHeightInTiles
    //   }
    //   for (let iRow = yMin; iRow < yMax; iRow++) {
    //     for (let iCol = 0; iCol < this._viewWidthInTiles; iCol++) {
    //       const x = this._offsetXOld + iCol
    //       const y = this._offsetYOld + iRow
    //       const key = `${x}:${y}`
    //       this.dirtyMeta.add(key)
    //     }
    //   }
    // }
    // this._offsetXOld = this._offsetX
    // this._offsetYOld = this._offsetY
    // console.log(this._offsetXOld, this._offsetX)
    // }
    if (this.dirtyMeta.size > 0) {
      this.dirtyMeta.forEach((v) => {
        const coords = v.split(':').map((v) => parseInt(v))
        const x = coords[0]
        const y = coords[1]
        for (let cY = -1; cY <= 1; cY++) {
          for (let cX = -1; cX <= 1; cX++) {
            const visKey = `${x + cX}:${y + cY}`
            this.dirtyVis.add(visKey)
          }
        }
      })
      this.dirtyMeta.clear()
      return true
    } else {
      return false
    }
  }
  updateVis(bottomPointsGeo: BufferGeometry, topPointsGeo: BufferGeometry) {
    if (this._offsetsDirty) {
      this._offsetsDirty = false
      if (this._offsetX !== this._offsetXOld) {
        let xMin =
          this._offsetX < this._offsetXOld ? this._offsetX : this._offsetXOld
        let xMax =
          this._offsetX > this._offsetXOld ? this._offsetX : this._offsetXOld
        if (this._offsetX === xMax) {
          xMin += this._viewWidthInTiles
          xMax += this._viewWidthInTiles
        }
        for (let iCol = xMin; iCol < xMax; iCol++) {
          for (let iRow = 0; iRow < this._viewHeightInTiles; iRow++) {
            const x = iCol
            const y = this._offsetY + iRow
            const key = `${x}:${y}`
            this.dirtyVis.add(key)
          }
        }
      }

      if (this._offsetY !== this._offsetYOld) {
        let yMin =
          this._offsetY < this._offsetYOld ? this._offsetY : this._offsetYOld
        let yMax =
          this._offsetY > this._offsetYOld ? this._offsetY : this._offsetYOld
        if (this._offsetY === yMax) {
          yMin += this._viewHeightInTiles
          yMax += this._viewHeightInTiles
        }
        for (let iRow = yMin; iRow < yMax; iRow++) {
          for (let iCol = 0; iCol < this._viewWidthInTiles; iCol++) {
            const x = this._offsetX + iCol
            const y = iRow
            const key = `${x}:${y}`
            this.dirtyVis.add(key)
          }
        }
      }
      this._offsetXOld = this._offsetX
      this._offsetYOld = this._offsetY
    }

    if (this.indicesOfNewlyMadeTiles.size > 0) {
      for (let iCol = 0; iCol < this._viewWidthInTiles; iCol++) {
        for (let iRow = 0; iRow < this._viewHeightInTiles; iRow++) {
          const x = this._offsetX + iCol
          const y = this._offsetY + iRow
          const time = this.sampleMeta(x, y).has('water')
            ? __animFrameTimes[this._animFrame % __animFrameTimes.length]
            : undefined
          const sampledVis = this.sampleVisIds(x, y, time)
          if (this.indicesOfNewlyMadeTiles.has(sampledVis.idBottom)) {
            // this.dirtyVis.add(`${x}:${y-1}`)
            this.indicesOfMadeTiles.add(sampledVis.idBottom)
            this.dirtyVis.add(`${x}:${y}`)
            // this.dirtyVis.add(`${x}:${y+1}`)
          }
          if (this.indicesOfNewlyMadeTiles.has(sampledVis.idTop)) {
            // this.dirtyVis.add(`${x}:${y-1}`)
            this.dirtyVis.add(`${x}:${y}`)
            // this.dirtyVis.add(`${x}:${y-1}`)
          }
        }
      }
      this.indicesOfNewlyMadeTiles.forEach((index) =>
        this.indicesOfMadeTiles.add(index)
      )
      this.indicesOfNewlyMadeTiles.clear()
    }

    for (let iCol = 0; iCol < this._viewWidthInTiles; iCol++) {
      for (let iRow = 0; iRow < this._viewHeightInTiles; iRow++) {
        const x = this._offsetX + iCol
        const y = this._offsetY + iRow
        const meta = this.sampleMeta(x, y)
        if (meta.has('water')) {
          this.dirtyVis.add(`${x}:${y}`)
        }
      }
    }

    this.indicesOfNewlyMadeTiles.forEach((index) =>
      this.indicesOfMadeTiles.add(index)
    )
    this.indicesOfNewlyMadeTiles.clear()

    this.dirty = false

    if (this.dirtyVis.size > 0) {
      const xyBottomAttr = bottomPointsGeo.getAttribute('xy')
      const xyBottomArr = xyBottomAttr.array as number[]
      const idBottomAttr = bottomPointsGeo.getAttribute('id')
      const idBottomArr = idBottomAttr.array as number[]
      const xyTopAttr = topPointsGeo.getAttribute('xy')
      const xyTopArr = xyTopAttr.array as number[]
      const idTopAttr = topPointsGeo.getAttribute('id')
      const idTopArr = idTopAttr.array as number[]
      const currentFrame =
        __animFrameTimes[this._animFrame % __animFrameTimes.length]
      this.dirtyVis.forEach((v) => {
        const coords = v.split(':').map((v) => parseInt(v))
        const i = bottomPointsGeo.drawRange.count
        const i2 = i * 2
        const x = coords[0]
        const y = coords[1]
        const xWrapped = wrap(x, 0, this._viewWidthInTiles)
        const yWrapped = wrap(y, 0, this._viewHeightInTiles)
        // const xWrapped = x
        // const yWrapped = y
        xyBottomArr[i2] = xWrapped
        xyBottomArr[i2 + 1] = yWrapped
        xyBottomArr[i2 + 2] = xWrapped
        xyBottomArr[i2 + 3] = yWrapped + 1
        xyTopArr[i2] = xWrapped
        xyTopArr[i2 + 1] = yWrapped
        xyTopArr[i2 + 2] = xWrapped
        xyTopArr[i2 + 3] = yWrapped + 1
        const frame = this.sampleMeta(x, y).has('water')
          ? currentFrame
          : undefined
        const sampleDown = this.sampleVisIds(x, y - 1)
        const sampleCenter = this.sampleVisIds(x, y, frame)
        const sampleUp = this.sampleVisIds(x, y + 1)
        // const sampleDown = this.sampleVis(rand(0, 1000), rand(0, 1000))
        // const sampleCenter = this.sampleVis(rand(0, 1000), rand(0, 1000))
        // const sampleUp = this.sampleVis(rand(0, 1000), rand(0, 1000))
        idBottomArr[i] = this.indicesOfMadeTiles.has(sampleCenter.idBottom)
          ? sampleCenter.idBottom
          : 0
        idBottomArr[i + 1] = this.indicesOfMadeTiles.has(sampleUp.idBottom)
          ? sampleUp.idBottom
          : 0

        idTopArr[i] = this.indicesOfMadeTiles.has(sampleDown.idTop)
          ? sampleDown.idTop
          : 0

        idTopArr[i + 1] = this.indicesOfMadeTiles.has(sampleCenter.idTop)
          ? sampleCenter.idTop
          : 0

        // todo find out why some tiles stay as cyberPanels AKA 0
        // if (idBottomArr[i] === 0) {
        //   debugger
        // }

        bottomPointsGeo.drawRange.count += 2
        topPointsGeo.drawRange.count += 2
      })
      xyBottomAttr.needsUpdate = true
      idBottomAttr.needsUpdate = true
      xyTopAttr.needsUpdate = true
      idTopAttr.needsUpdate = true
      this.dirtyVis.clear()
      return true
    } else {
      return false
    }
  }
}
