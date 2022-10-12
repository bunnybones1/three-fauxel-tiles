import { BufferGeometry } from 'three'
import { initOffset } from '../constants'
import NoiseHelper2D from '../helpers/utils/NoiseHelper2D'
import ThreshNoiseHelper2D from '../helpers/utils/ThreshNoiseHelper2D'
import { wrap } from '../utils/math'

import TileMaker from './TileMaker'

const masks32: number[] = []
for (let i = 0; i < 32; i++) {
  masks32[i] = 1 << i
}

type MetaTile =
  | 'floor'
  | 'beam'
  | 'bricks'
  | 'drywall'
  | 'grass'
  | 'bush'
  | 'goldPile'
  | 'lampPost'
  | 'testObject'
  | 'pyramid'
  | 'rockyGround'
  | 'rocks'
  | 'goldOreForRocks'
  | 'harvested'
  | 'treePine'
  | 'maturePlant'

const masks8: number[] = []
for (let i = 0; i < 8; i++) {
  masks8[i] = 1 << i
}

export default class JITTileSampler {
  get offsetX(): number {
    return this._offsetX
  }
  set offsetX(value: number) {
    this._offsetsDirty = true
    this._offsetX = value
  }
  get offsetY(): number {
    return this._offsetY
  }
  set offsetY(value: number) {
    this._offsetsDirty = true
    this._offsetY = value
  }
  get tileMaker(): TileMaker {
    return this._tileMaker
  }
  set tileMaker(value: TileMaker) {
    throw new Error('Cannot change tileMaker during runtime')
  }
  metaNoiseGenerators: ThreshNoiseHelper2D[]
  metaPropertyLookup: MetaTile[]
  visualPropertyLookup: string[]
  bytesPerTile: number
  localMetaProps: number
  visProps: Uint8Array
  metaCache: Map<string, number> = new Map() //maybe change this caching mechanism for something more memory friendly. e.i. Map<number, <Map<number, number>> ?
  metaPropertyMasks: number[]
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
  private _offsetYOld = initOffset.y
  constructor(
    private _tileMaker: TileMaker,
    private _viewWidthInTiles: number,
    private _viewHeightInTiles: number
  ) {
    this.metaPropertyLookup = [
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
      'harvested',
      'treePine',
      'maturePlant'
    ]

    this.visualPropertyLookup = [
      'layer2',
      'floor',
      'beamCenter',
      'beamN',
      'beamE',
      'beamS',
      'beamW',
      'beamNS',
      'beamEW',
      'bricks0',
      'bricks1',
      'bricks2',
      'bricks3',
      'bricks4',
      'bricks5',
      'bricks6',
      'bricks7',
      'bricks8',
      'bricks9',
      'bricks10',
      'bricks11',
      'ground',
      'grassC',
      'grassN',
      'grassNE',
      'grassE',
      'grassSE',
      'grassS',
      'grassSW',
      'grassW',
      'grassNW',
      'bushC',
      'bushN',
      'bushNE',
      'bushE',
      'bushSE',
      'bushS',
      'bushSW',
      'bushW',
      'bushNW',
      'goldPile',
      'lampPost',
      'testObject',
      'pyramid',
      'rockyGround',
      'rocksC',
      'rocksCBig',
      'rocksN',
      'rocksNE',
      'rocksE',
      'rocksSE',
      'rocksS',
      'rocksSW',
      'rocksW',
      'rocksNW',
      'goldOreForRocks',
      'goldOreForBigRocks',
      'rockCrumbsC',
      'rockCrumbsN',
      'rockCrumbsNE',
      'rockCrumbsE',
      'rockCrumbsSE',
      'rockCrumbsS',
      'rockCrumbsSW',
      'rockCrumbsW',
      'rockCrumbsNW',
      'treePineC',
      'treePineN',
      'treePineNE',
      'treePineE',
      'treePineSE',
      'treePineS',
      'treePineSW',
      'treePineW',
      'treePineNW',
      'treePineMatureC',
      'treePineMatureN',
      'treePineMatureNE',
      'treePineMatureE',
      'treePineMatureSE',
      'treePineMatureS',
      'treePineMatureSW',
      'treePineMatureW',
      'treePineMatureNW',
      'treePineStumpMature'
    ]
    this.bytesPerTile = Math.ceil(this.visualPropertyLookup.length / 8)

    const seed = 1
    const floorNoise = ThreshNoiseHelper2D.simple(0.1, 0, 0, 0.5, seed)
    const beamNoise = ThreshNoiseHelper2D.simple(0.08, -100, -100, 0.4, seed)
    const bricksNoise = ThreshNoiseHelper2D.simple(0.06, -50, -50, 0.5, seed)
    const drywallNoise = ThreshNoiseHelper2D.simple(0.05, 20, 20, 0.5, seed)
    const grassNoise = ThreshNoiseHelper2D.simple(0.15, 100, 200, -0.2, seed)
    const bushNoise = ThreshNoiseHelper2D.simple(0.3, 300, 200, 0.25, seed)
    const goldNoise = ThreshNoiseHelper2D.simple(3, -300, 200, 0.75, seed)
    const lampPostNoise = ThreshNoiseHelper2D.simple(3, -1300, 200, 0.75, seed)
    const testObjectNoise = ThreshNoiseHelper2D.simple(
      3,
      -100,
      -300,
      0.75,
      seed
    )
    const pyramidNoise = ThreshNoiseHelper2D.simple(3, -204, -121, 0.85, seed)
    const rockyGroundNoise = ThreshNoiseHelper2D.simple(
      3,
      204,
      -121,
      0.25,
      seed
    )
    const rocksNoise = ThreshNoiseHelper2D.simple(0.05, 604, -121, 0.7, seed)
    const goldOreForRocksNoise = new ThreshNoiseHelper2D(
      [
        new NoiseHelper2D(0.05, 604, -121, seed),
        new NoiseHelper2D(0.8, 604, -121, seed, 0.2)
      ],
      0.97
    )
    const harvestedNoise = ThreshNoiseHelper2D.simple(
      0.08,
      -500,
      -100,
      0.35,
      seed
    )
    const treePineNoise = ThreshNoiseHelper2D.simple(0.3, -200, -400, 0.5, seed)
    const plantMatureNoise = ThreshNoiseHelper2D.simple(
      3,
      -340,
      -460,
      0.25,
      seed
    )
    this.metaNoiseGenerators = [
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
      harvestedNoise,
      treePineNoise,
      plantMatureNoise
    ]
  }
  flipMeta(x: number, y: number, meta: MetaTile, validate = true) {
    this.writeMeta(x, y, this.metaBitsFlip(this.sampleMeta(x, y), meta))
    if (validate) {
      this.validateLocalMeta(x, y)
    }
  }
  metaBitsHas(val: number, maskName: MetaTile) {
    return val & masks32[this.metaPropertyLookup.indexOf(maskName)]
  }

  metaBitsFlip(val: number, maskName: MetaTile) {
    return val ^ masks32[this.metaPropertyLookup.indexOf(maskName)]
  }

  visualBitsEnable(val: Uint8Array, maskName: string) {
    const i = this.visualPropertyLookup.indexOf(maskName)
    const ib = ~~(i / 8)
    const i8 = i % 8
    val[ib] |= masks8[i8]
  }
  localMetaBitsFlip(maskName: MetaTile) {
    this.localMetaProps = this.metaBitsFlip(this.localMetaProps, maskName)
  }
  localMetaBitsHas(maskName: MetaTile) {
    return this.metaBitsHas(this.localMetaProps, maskName)
  }
  writeMeta(x: number, y: number, meta: number) {
    const key = x + ':' + y
    if (this.metaCache.has(key) && this.metaCache.get(key)) {
      this.metaCache.set(key, meta)
    }
    this.dirtyMeta.add(key)
    this.localMetaProps = meta
  }
  sampleMeta(x: number, y: number) {
    const key = x + ':' + y
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key)!
    }
    this.localMetaProps = this.metaNoiseGenerators.reduce((accum, noise, j) => {
      return accum + (noise.getTreshold(x, y) << j)
    }, 0)
    return this.validateLocalMeta(x, y)
  }
  validateLocalMeta(x: number, y: number) {
    const key = x + ':' + y

    // this.localMetaProps = this.metaNoiseGenerators[2].getTreshold(x, y, 0.5) << 4

    if (!this.localMetaBitsHas('floor') && this.localMetaBitsHas('beam')) {
      this.localMetaBitsFlip('beam')
    }
    if (this.localMetaBitsHas('beam') && this.localMetaBitsHas('grass')) {
      this.localMetaBitsFlip('grass')
    }
    if (!this.localMetaBitsHas('beam') && this.localMetaBitsHas('bricks')) {
      this.localMetaBitsFlip('bricks')
    }
    if (this.localMetaBitsHas('floor') && this.localMetaBitsHas('grass')) {
      this.localMetaBitsFlip('grass')
    }
    if (this.localMetaBitsHas('floor') && this.localMetaBitsHas('bush')) {
      this.localMetaBitsFlip('bush')
    }
    if (!this.localMetaBitsHas('grass') && this.localMetaBitsHas('bush')) {
      this.localMetaBitsFlip('bush')
    }
    if (
      this.localMetaBitsHas('testObject') &&
      (this.localMetaBitsHas('bush') || this.localMetaBitsHas('pyramid'))
    ) {
      this.localMetaBitsFlip('testObject')
    }
    if (
      this.localMetaBitsHas('lampPost') &&
      (this.localMetaBitsHas('beam') ||
        this.localMetaBitsHas('bush') ||
        this.localMetaBitsHas('bricks') ||
        this.localMetaBitsHas('goldPile') ||
        this.localMetaBitsHas('testObject'))
    ) {
      this.localMetaBitsFlip('lampPost')
    }

    if (
      this.localMetaBitsHas('pyramid') &&
      (this.localMetaBitsHas('bush') ||
        this.localMetaBitsHas('beam') ||
        this.localMetaBitsHas('lampPost') ||
        this.localMetaBitsHas('lampPost') ||
        this.localMetaBitsHas('grass') ||
        !this.localMetaBitsHas('floor') ||
        this.localMetaBitsHas('goldPile'))
    ) {
      this.localMetaBitsFlip('pyramid')
    }

    if (
      this.localMetaBitsHas('rockyGround') &&
      (this.localMetaBitsHas('beam') ||
        this.localMetaBitsHas('bush') ||
        this.localMetaBitsHas('floor') ||
        this.localMetaBitsHas('grass') ||
        this.localMetaBitsHas('bricks') ||
        this.localMetaBitsHas('goldPile') ||
        this.localMetaBitsHas('testObject'))
    ) {
      this.localMetaBitsFlip('rockyGround')
    }

    if (this.localMetaBitsHas('rocks')) {
      const wasHarvested = this.localMetaBitsHas('harvested')
      const hasGold = this.localMetaBitsHas('goldOreForRocks')
      this.localMetaProps = 0
      this.localMetaBitsFlip('rocks')
      if (hasGold) {
        this.localMetaBitsFlip('goldOreForRocks')
      }
      if (wasHarvested) {
        this.localMetaBitsFlip('harvested')
      }
    }

    if (!this.localMetaBitsHas('grass') && this.localMetaBitsHas('treePine')) {
      this.localMetaBitsFlip('treePine')
    }
    if (this.localMetaBitsHas('treePine') && this.localMetaBitsHas('bush')) {
      this.localMetaBitsFlip('bush')
    }
    if (
      this.localMetaBitsHas('treePine') &&
      this.localMetaBitsHas('goldPile')
    ) {
      this.localMetaBitsFlip('goldPile')
    }
    if (
      this.localMetaBitsHas('treePine') &&
      this.localMetaBitsHas('testObject')
    ) {
      this.localMetaBitsFlip('testObject')
    }
    if (
      this.localMetaBitsHas('lampPost') &&
      this.localMetaBitsHas('treePine')
    ) {
      this.localMetaBitsFlip('treePine')
    }

    this.metaCache.set(key, this.localMetaProps)
    return this.localMetaProps
  }
  myVisualBitsEnable(maskName: string) {
    this.visualBitsEnable(this.visProps, maskName)
  }
  sampleVis(x: number, y: number) {
    const metaPropsN = this.sampleMeta(x, y - 1)
    const metaPropsNE = this.sampleMeta(x + 1, y - 1)
    const metaPropsE = this.sampleMeta(x + 1, y)
    const metaPropsSE = this.sampleMeta(x + 1, y + 1)
    const metaPropsS = this.sampleMeta(x, y + 1)
    const metaPropsSW = this.sampleMeta(x - 1, y + 1)
    const metaPropsW = this.sampleMeta(x - 1, y)
    const metaPropsNW = this.sampleMeta(x - 1, y - 1)

    const metaProps = this.sampleMeta(x, y)
    this.localMetaProps = metaProps

    this.visProps = new Uint8Array(this.bytesPerTile)

    this.myVisualBitsEnable(this.localMetaBitsHas('floor') ? 'floor' : 'ground')

    const propMaskGrass = masks32[this.metaPropertyLookup.indexOf('grass')]
    if (this.localMetaBitsHas('grass')) {
      this.myVisualBitsEnable('grassC')
      if (metaPropsN & propMaskGrass) {
        this.myVisualBitsEnable('grassN')
      }
      if (metaPropsE & propMaskGrass) {
        this.myVisualBitsEnable('grassE')
      }
      if (metaPropsS & propMaskGrass) {
        this.myVisualBitsEnable('grassS')
      }
      if (metaPropsW & propMaskGrass) {
        this.myVisualBitsEnable('grassW')
      }
      if (
        metaPropsNE & propMaskGrass &&
        metaPropsN & propMaskGrass &&
        metaPropsE & propMaskGrass
      ) {
        this.myVisualBitsEnable('grassNE')
      }
      if (
        metaPropsNW & propMaskGrass &&
        metaPropsN & propMaskGrass &&
        metaPropsW & propMaskGrass
      ) {
        this.myVisualBitsEnable('grassNW')
      }
      if (
        metaPropsSE & propMaskGrass &&
        metaPropsS & propMaskGrass &&
        metaPropsE & propMaskGrass
      ) {
        this.myVisualBitsEnable('grassSE')
      }
      if (
        metaPropsSW & propMaskGrass &&
        metaPropsS & propMaskGrass &&
        metaPropsW & propMaskGrass
      ) {
        this.myVisualBitsEnable('grassSW')
      }
    }
    const propMaskBush = masks32[this.metaPropertyLookup.indexOf('bush')]
    if (this.localMetaBitsHas('bush')) {
      this.myVisualBitsEnable('bushC')
      if (metaPropsN & propMaskBush) {
        this.myVisualBitsEnable('bushN')
      }
      if (metaPropsE & propMaskBush) {
        this.myVisualBitsEnable('bushE')
      }
      if (metaPropsS & propMaskBush) {
        this.myVisualBitsEnable('bushS')
      }
      if (metaPropsW & propMaskBush) {
        this.myVisualBitsEnable('bushW')
      }
      if (
        metaPropsNE & propMaskBush &&
        metaPropsN & propMaskBush &&
        metaPropsE & propMaskBush
      ) {
        this.myVisualBitsEnable('bushNE')
      }
      if (
        metaPropsNW & propMaskBush &&
        metaPropsN & propMaskBush &&
        metaPropsW & propMaskBush
      ) {
        this.myVisualBitsEnable('bushNW')
      }
      if (
        metaPropsSE & propMaskBush &&
        metaPropsS & propMaskBush &&
        metaPropsE & propMaskBush
      ) {
        this.myVisualBitsEnable('bushSE')
      }
      if (
        metaPropsSW & propMaskBush &&
        metaPropsS & propMaskBush &&
        metaPropsW & propMaskBush
      ) {
        this.myVisualBitsEnable('bushSW')
      }
    }
    const propMaskBeam = masks32[this.metaPropertyLookup.indexOf('beam')]
    const beamC = metaProps & propMaskBeam
    const beamN = metaPropsN & propMaskBeam
    const beamE = metaPropsE & propMaskBeam
    const beamS = metaPropsS & propMaskBeam
    const beamW = metaPropsW & propMaskBeam
    if (beamC) {
      if (beamE && beamW && !beamS && !beamN) {
        this.myVisualBitsEnable('beamEW')
      } else if (!beamE && !beamW && beamS && beamN) {
        this.myVisualBitsEnable('beamNS')
      } else {
        this.myVisualBitsEnable('beamCenter')
        if (beamE) {
          this.myVisualBitsEnable('beamE')
        }
        if (beamW) {
          this.myVisualBitsEnable('beamW')
        }
        if (beamN) {
          this.myVisualBitsEnable('beamN')
        }
        if (beamS) {
          this.myVisualBitsEnable('beamS')
        }
      }
    }
    const propMaskBricks = masks32[this.metaPropertyLookup.indexOf('bricks')]
    if (metaProps & propMaskBricks) {
      const bricksS = metaPropsN & propMaskBricks
      const bricksE = metaPropsE & propMaskBricks
      const bricksN = metaPropsS & propMaskBricks
      const bricksW = metaPropsW & propMaskBricks
      if (bricksN) {
        this.myVisualBitsEnable('bricks0')
        this.myVisualBitsEnable('bricks1')
      } else if (!(beamC && beamS)) {
        this.myVisualBitsEnable('bricks8')
      }
      if (bricksE) {
        this.myVisualBitsEnable('bricks2')
        this.myVisualBitsEnable('bricks3')
      } else if (!(beamC && beamE)) {
        this.myVisualBitsEnable('bricks9')
      }
      if (bricksW) {
        this.myVisualBitsEnable('bricks7')
        this.myVisualBitsEnable('bricks6')
      } else if (!(beamC && beamW)) {
        this.myVisualBitsEnable('bricks11')
      }
      if (bricksS) {
        this.myVisualBitsEnable('bricks4')
        this.myVisualBitsEnable('bricks5')
      } else if (!(beamC && beamN)) {
        this.myVisualBitsEnable('bricks10')
      }
    }
    const propMaskGold = masks32[this.metaPropertyLookup.indexOf('goldPile')]
    if (metaProps & propMaskGold) {
      this.myVisualBitsEnable('goldPile')
    }
    const propMaskLampPost =
      masks32[this.metaPropertyLookup.indexOf('lampPost')]
    if (metaProps & propMaskLampPost) {
      this.myVisualBitsEnable('lampPost')
    }
    const propMaskTestObject =
      masks32[this.metaPropertyLookup.indexOf('testObject')]
    if (metaProps & propMaskTestObject) {
      this.myVisualBitsEnable('testObject')
    }
    const propMaskPyramid = masks32[this.metaPropertyLookup.indexOf('pyramid')]
    if (metaProps & propMaskPyramid) {
      this.myVisualBitsEnable('pyramid')
    }
    const propMaskRockyGround =
      masks32[this.metaPropertyLookup.indexOf('rockyGround')]
    if (metaProps & propMaskRockyGround) {
      this.myVisualBitsEnable('rockyGround')
    }

    const propMaskRocks = masks32[this.metaPropertyLookup.indexOf('rocks')]
    const propMaskHarvested =
      masks32[this.metaPropertyLookup.indexOf('harvested')]

    const isRocksC = metaProps & propMaskRocks
    const isHarvestedC = metaProps & propMaskHarvested
    const isGoldOre = this.localMetaBitsHas('goldOreForRocks')
    if (isRocksC) {
      const isRocksN = metaPropsN & propMaskRocks
      const isHarvestedN = metaPropsN & propMaskHarvested
      const isRocksE = metaPropsE & propMaskRocks
      const isHarvestedE = metaPropsE & propMaskHarvested
      const isRocksS = metaPropsS & propMaskRocks
      const isHarvestedS = metaPropsS & propMaskHarvested
      const isRocksW = metaPropsW & propMaskRocks
      const isHarvestedW = metaPropsW & propMaskHarvested
      const isRocksNE = metaPropsNE & propMaskRocks
      const isHarvestedNE = metaPropsNE & propMaskHarvested
      const isRocksSE = metaPropsSE & propMaskRocks
      const isHarvestedSE = metaPropsSE & propMaskHarvested
      const isRocksSW = metaPropsSW & propMaskRocks
      const isHarvestedSW = metaPropsSW & propMaskHarvested
      const isRocksNW = metaPropsNW & propMaskRocks
      const isHarvestedNW = metaPropsNW & propMaskHarvested

      this.myVisualBitsEnable(isHarvestedC ? 'rockCrumbsC' : 'rocksC')
      if (isRocksN) {
        this.myVisualBitsEnable(
          isHarvestedN || isHarvestedC ? 'rockCrumbsN' : 'rocksN'
        )
      }
      if (isRocksS) {
        this.myVisualBitsEnable(
          isHarvestedS || isHarvestedC ? 'rockCrumbsS' : 'rocksS'
        )
      }
      if (isRocksE) {
        this.myVisualBitsEnable(
          isHarvestedE || isHarvestedC ? 'rockCrumbsE' : 'rocksE'
        )
      }
      if (isRocksW) {
        this.myVisualBitsEnable(
          isHarvestedW || isHarvestedC ? 'rockCrumbsW' : 'rocksW'
        )
      }

      if (isRocksW && isRocksN && isRocksNW) {
        this.myVisualBitsEnable(
          isHarvestedW || isHarvestedN || isHarvestedNW || isHarvestedC
            ? 'rockCrumbsNW'
            : 'rocksNW'
        )
      }
      if (isRocksE && isRocksN && isRocksNE) {
        this.myVisualBitsEnable(
          isHarvestedE || isHarvestedN || isHarvestedNE || isHarvestedC
            ? 'rockCrumbsNE'
            : 'rocksNE'
        )
      }
      if (isRocksW && isRocksS && isRocksSW) {
        this.myVisualBitsEnable(
          isHarvestedW || isHarvestedS || isHarvestedSW || isHarvestedC
            ? 'rockCrumbsSW'
            : 'rocksSW'
        )
      }
      if (isRocksE && isRocksS && isRocksSE) {
        this.myVisualBitsEnable(
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
          this.myVisualBitsEnable('rocksCBig')
          if (isGoldOre) {
            this.myVisualBitsEnable('goldOreForBigRocks')
          }
        } else {
          if (isGoldOre) {
            this.myVisualBitsEnable('goldOreForRocks')
          }
        }
      }
    }
    const propMaskTreePine =
      masks32[this.metaPropertyLookup.indexOf('treePine')]
    const propMaskMaturePlant =
      masks32[this.metaPropertyLookup.indexOf('maturePlant')]
    if (metaProps & propMaskTreePine && !(metaProps & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaProps & propMaskMaturePlant ? 'Mature' : '') + 'C'
      )
    }
    if (metaPropsE & propMaskTreePine && !(metaPropsE & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsE & propMaskMaturePlant ? 'Mature' : '') + 'E'
      )
    }
    if (metaPropsW & propMaskTreePine && !(metaPropsW & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsW & propMaskMaturePlant ? 'Mature' : '') + 'W'
      )
    }
    if (metaPropsN & propMaskTreePine && !(metaPropsN & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsN & propMaskMaturePlant ? 'Mature' : '') + 'N'
      )
    }
    if (metaPropsS & propMaskTreePine && !(metaPropsS & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsS & propMaskMaturePlant ? 'Mature' : '') + 'S'
      )
    }
    if (metaPropsNE & propMaskTreePine && !(metaPropsNE & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsNE & propMaskMaturePlant ? 'Mature' : '') + 'NE'
      )
    }
    if (metaPropsSW & propMaskTreePine && !(metaPropsSW & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsSW & propMaskMaturePlant ? 'Mature' : '') + 'SW'
      )
    }
    if (metaPropsNW & propMaskTreePine && !(metaPropsNW & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsNW & propMaskMaturePlant ? 'Mature' : '') + 'NW'
      )
    }
    if (metaPropsSE & propMaskTreePine && !(metaPropsSE & propMaskHarvested)) {
      this.myVisualBitsEnable(
        'treePine' + (metaPropsSE & propMaskMaturePlant ? 'Mature' : '') + 'SE'
      )
    }

    if (metaProps & propMaskTreePine && metaProps & propMaskHarvested) {
      this.myVisualBitsEnable('treePineStumpMature')
    }

    const idBottom = this._tileMaker.getTileId(this.visProps)
    const visProps2 = this.visProps.slice()
    visProps2[0] |= 1
    const idTop = this._tileMaker.getTileId(visProps2)
    // const indexBottomX = (idBottom * 8) % 256
    // const indexBottomY = ~~(idBottom / 32) * 8
    // const indexTopX = (idTop * 8) % 256
    // const indexTopY = ~~(idTop / 32) * 8
    return {
      idBottom,
      idTop
    }
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

    if (this.dirtyVis.size > 0) {
      const xyBottomAttr = bottomPointsGeo.getAttribute('xy')
      const xyBottomArr = xyBottomAttr.array as number[]
      const idBottomAttr = bottomPointsGeo.getAttribute('id')
      const idBottomArr = idBottomAttr.array as number[]
      const xyTopAttr = topPointsGeo.getAttribute('xy')
      const xyTopArr = xyTopAttr.array as number[]
      const idTopAttr = topPointsGeo.getAttribute('id')
      const idTopArr = idTopAttr.array as number[]
      this.dirtyVis.forEach((v) => {
        // console.log(v)
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
        const sampleDown = this.sampleVis(x, y - 1)
        const sampleCenter = this.sampleVis(x, y)
        const sampleUp = this.sampleVis(x, y + 1)
        // const sampleDown = this.sampleVis(rand(0, 1000), rand(0, 1000))
        // const sampleCenter = this.sampleVis(rand(0, 1000), rand(0, 1000))
        // const sampleUp = this.sampleVis(rand(0, 1000), rand(0, 1000))
        idBottomArr[i] = sampleCenter.idBottom
        idBottomArr[i + 1] = sampleUp.idBottom
        idTopArr[i] = sampleDown.idTop
        idTopArr[i + 1] = sampleCenter.idTop
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
