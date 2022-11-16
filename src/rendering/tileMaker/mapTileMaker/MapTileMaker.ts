import {
  BoxBufferGeometry,
  Mesh,
  Object3D,
  SphereGeometry,
  TorusKnotBufferGeometry,
  Vector4,
  WebGLRenderer
} from 'three'
import FibonacciSphereGeometry from '../../../geometries/FibonacciSphereGeometry'
import GrassGeometry from '../../../geometries/GrassGeometry'
import PyramidGeometry from '../../../geometries/PyramidGeometry'
import {
  changeMeshMaterials,
  getMeshMaterial,
  MaterialPassType
} from '../../../helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '../../../utils/geometry'
import { detRandRocks, detRandWoodPlanks } from '../../../utils/random'
import { makeRocks } from '../../../meshes/factoryRocks'
import { makeRockCrumbs } from '../../../meshes/factoryRockCrumbs'
import {
  makeTreePine,
  makeTreePineMature,
  makeTreePineStump,
  makeTreePineStumpMature
} from '../../../meshes/factoryTreePine'
import {
  makeTreeMaple,
  makeTreeMapleMature,
  makeTreeMapleStump,
  makeTreeMapleStumpMature
} from '../../../meshes/factoryTreeMaple'
import { makeGoldPile } from '../../../meshes/factoryGoldPile'
import { makeLampPost } from '../../../meshes/factoryLampPost'
import { verticalScale } from '../../../constants'
import { BushProps, makeRecursiveBush } from '../../../meshes/factoryBush'
import { memoize } from '../../../utils/memoizer'
import { makeBrickWall } from '../../../meshes/factoryBrickWall'
import DoubleCachedTileMaker from '../DoubleCachedTileMaker'
import { makeWater } from '../../../meshes/factoryWater'
import { CardinalStrings, makeGround } from '../../../meshes/factoryGround'
import NamedBitsInNumber from '../../../helpers/utils/NamedBitsInNumber'
import { lerp } from 'three/src/math/MathUtils'

export default class MapTileMaker extends DoubleCachedTileMaker {
  visualPropertyLookupStrings = [
    'layer2',
    'nothingness',
    'floor',
    'water00',
    'water10',
    'water20',
    'water30',
    'water01',
    'water11',
    'water21',
    'water31',
    'water02',
    'water12',
    'water22',
    'water32',
    'water03',
    'water13',
    'water23',
    'water33',
    'water04',
    'water14',
    'water24',
    'water34',
    'water05',
    'water15',
    'water25',
    'water35',
    'water06',
    'water16',
    'water26',
    'water36',
    'water07',
    'water17',
    'water27',
    'water37',
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
    'silverOreForRocks',
    'silverOreForBigRocks',
    'ironOreForRocks',
    'ironOreForBigRocks',
    'copperOreForRocks',
    'copperOreForBigRocks',
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
    'treePineStump',
    'treePineStumpMature',
    'treeMapleC',
    'treeMapleN',
    'treeMapleNE',
    'treeMapleE',
    'treeMapleSE',
    'treeMapleS',
    'treeMapleSW',
    'treeMapleW',
    'treeMapleNW',
    'treeMapleMatureC',
    'treeMapleMatureN',
    'treeMapleMatureNE',
    'treeMapleMatureE',
    'treeMapleMatureSE',
    'treeMapleMatureS',
    'treeMapleMatureSW',
    'treeMapleMatureW',
    'treeMapleMatureNW',
    'treeMapleStump',
    'treeMapleStumpMature',
    'ground0',
    'ground1',
    'ground2',
    'ground3',
    'ground4',
    'ground5',
    'ground6',
    'ground7',
    'ground8',
    'ground9',
    'ground10',
    'ground11',
    'ground12',
    'ground13',
    'ground14',
    'ground15',
    'ground16',
    'ground17',
    'ground18',
    'ground19',
    'ground20',
    'ground21',
    'ground22',
    'ground23',
    'ground24',
    'ground25',
    'ground26',
    'ground27',
    'ground28',
    'ground29',
    'ground30',
    'ground31',
    'ground32',
    'ground33',
    'ground34',
    'ground35',
    'ground36',
    'ground37',
    'ground38',
    'ground39',
    'ground40',
    'ground41',
    'ground42',
    'ground43',
    'ground44',
    'ground45',
    'ground46',
    'ground47',
    'ground48',
    'ground49',
    'ground50',
    'ground51',
    'ground52',
    'ground53',
    'ground54',
    'ground55',
    'ground56',
    'ground57',
    'ground58',
    'ground59',
    'ground60',
    'ground61',
    'ground62',
    'ground63',
    'ground64',
    'ground65',
    'ground66',
    'ground67',
    'ground68',
    'ground69',
    'ground70',
    'ground71',
    'ground72',
    'ground73',
    'ground74',
    'ground75',
    'ground76',
    'ground77',
    'ground78',
    'ground79',
    'ground80',
    'ground81',
    'ground82',
    'ground83',
    'ground84',
    'ground85',
    'ground86',
    'ground87',
    'ground88',
    'ground89',
    'ground90',
    'ground91',
    'ground92',
    'ground93',
    'ground94',
    'ground95',
    'ground96',
    'ground97',
    'ground98',
    'ground99',
    'ground100',
    'ground101',
    'ground102',
    'ground103',
    'ground104',
    'ground105',
    'ground106',
    'ground107',
    'ground108',
    'ground109',
    'ground110',
    'ground111',
    'ground112',
    'ground113',
    'ground114',
    'ground115',
    'ground116',
    'ground117',
    'ground118',
    'ground119',
    'ground120',
    'ground121',
    'ground122',
    'ground123',
    'ground124',
    'ground125',
    'ground126',
    'ground127',
    'ground128',
    'ground129',
    'ground130',
    'ground131',
    'ground132',
    'ground133',
    'ground134',
    'ground135',
    'ground136',
    'ground137',
    'ground138',
    'ground139',
    'ground140',
    'ground141',
    'ground142',
    'ground143',
    'ground144',
    'ground145',
    'ground146',
    'ground147',
    'ground148',
    'ground149',
    'ground150',
    'ground151',
    'ground152',
    'ground153',
    'ground154',
    'ground155',
    'ground156',
    'ground157',
    'ground158',
    'ground159',
    'ground160',
    'ground161',
    'ground162',
    'ground163',
    'ground164',
    'ground165',
    'ground166',
    'ground167',
    'ground168',
    'ground169',
    'ground170',
    'ground171',
    'ground172',
    'ground173',
    'ground174',
    'ground175',
    'ground176',
    'ground177',
    'ground178',
    'ground179',
    'ground180',
    'ground181',
    'ground182',
    'ground183',
    'ground184',
    'ground185',
    'ground186',
    'ground187',
    'ground188',
    'ground189',
    'ground190',
    'ground191',
    'ground192',
    'ground193',
    'ground194',
    'ground195',
    'ground196',
    'ground197',
    'ground198',
    'ground199',
    'ground200',
    'ground201',
    'ground202',
    'ground203',
    'ground204',
    'ground205',
    'ground206',
    'ground207',
    'ground208',
    'ground209',
    'ground210',
    'ground211',
    'ground212',
    'ground213',
    'ground214',
    'ground215',
    'ground216',
    'ground217',
    'ground218',
    'ground219',
    'ground220',
    'ground221',
    'ground222',
    'ground223',
    'ground224',
    'ground225',
    'ground226',
    'ground227',
    'ground228',
    'ground229',
    'ground230',
    'ground231',
    'ground232',
    'ground233',
    'ground234',
    'ground235',
    'ground236',
    'ground237',
    'ground238',
    'ground239',
    'ground240',
    'ground241',
    'ground242',
    'ground243',
    'ground244',
    'ground245',
    'ground246',
    'ground247',
    'ground248',
    'ground249',
    'ground250',
    'ground251',
    'ground252',
    'ground253',
    'ground254',
    'ground255',
    'ground256',
    'ground257',
    'ground258',
    'ground259',
    'ground260',
    'ground261',
    'ground262',
    'ground263',
    'ground264',
    'ground265',
    'ground266',
    'ground267',
    'ground268',
    'ground269',
    'ground270',
    'ground271',
    'ground272',
    'ground273',
    'ground274',
    'ground275',
    'ground276',
    'ground277',
    'ground278',
    'ground279',
    'ground280',
    'ground281',
    'ground282',
    'ground283',
    'ground284',
    'ground285',
    'ground286',
    'ground287',
    'ground288',
    'ground289',
    'ground290',
    'ground291',
    'ground292',
    'ground293',
    'ground294',
    'ground295',
    'ground296',
    'ground297',
    'ground298',
    'ground299',
    'ground300',
    'ground301',
    'ground302',
    'ground303',
    'ground304',
    'ground305',
    'ground306',
    'ground307',
    'ground308',
    'ground309',
    'ground310',
    'ground311',
    'ground312',
    'ground313',
    'ground314',
    'ground315',
    'ground316',
    'ground317',
    'ground318',
    'ground319',
    'ground320',
    'ground321',
    'ground322',
    'ground323',
    'ground324',
    'ground325',
    'ground326',
    'ground327',
    'ground328',
    'ground329',
    'ground330',
    'ground331',
    'ground332',
    'ground333',
    'ground334',
    'ground335',
    'ground336',
    'ground337',
    'ground338',
    'ground339',
    'ground340',
    'ground341',
    'ground342',
    'ground343',
    'ground344',
    'ground345',
    'ground346',
    'ground347',
    'ground348',
    'ground349',
    'ground350',
    'ground351',
    'ground352',
    'ground353',
    'ground354',
    'ground355',
    'ground356',
    'ground357',
    'ground358',
    'ground359',
    'ground360',
    'ground361',
    'ground362',
    'ground363',
    'ground364',
    'ground365',
    'ground366',
    'ground367',
    'ground368',
    'ground369',
    'ground370',
    'ground371',
    'ground372',
    'ground373',
    'ground374',
    'ground375',
    'ground376',
    'ground377',
    'ground378',
    'ground379',
    'ground380',
    'ground381',
    'ground382',
    'ground383',
    'ground384',
    'ground385',
    'ground386',
    'ground387',
    'ground388',
    'ground389',
    'ground390',
    'ground391',
    'ground392',
    'ground393',
    'ground394',
    'ground395',
    'ground396',
    'ground397',
    'ground398',
    'ground399',
    'ground400',
    'ground401',
    'ground402',
    'ground403',
    'ground404',
    'ground405',
    'ground406',
    'ground407',
    'ground408',
    'ground409',
    'ground410',
    'ground411',
    'ground412',
    'ground413',
    'ground414',
    'ground415',
    'ground416',
    'ground417',
    'ground418',
    'ground419',
    'ground420',
    'ground421',
    'ground422',
    'ground423',
    'ground424',
    'ground425',
    'ground426',
    'ground427',
    'ground428',
    'ground429',
    'ground430',
    'ground431',
    'ground432',
    'ground433',
    'ground434',
    'ground435',
    'ground436',
    'ground437',
    'ground438',
    'ground439',
    'ground440',
    'ground441',
    'ground442',
    'ground443',
    'ground444',
    'ground445',
    'ground446',
    'ground447',
    'ground448',
    'ground449',
    'ground450',
    'ground451',
    'ground452',
    'ground453',
    'ground454',
    'ground455',
    'ground456',
    'ground457',
    'ground458',
    'ground459',
    'ground460',
    'ground461',
    'ground462',
    'ground463',
    'ground464',
    'ground465',
    'ground466',
    'ground467',
    'ground468',
    'ground469',
    'ground470',
    'ground471',
    'ground472',
    'ground473',
    'ground474',
    'ground475',
    'ground476',
    'ground477',
    'ground478',
    'ground479',
    'ground480',
    'ground481',
    'ground482',
    'ground483',
    'ground484',
    'ground485',
    'ground486',
    'ground487',
    'ground488',
    'ground489',
    'ground490',
    'ground491',
    'ground492',
    'ground493',
    'ground494',
    'ground495',
    'ground496',
    'ground497',
    'ground498',
    'ground499',
    'ground500',
    'ground501',
    'ground502',
    'ground503',
    'ground504',
    'ground505',
    'ground506',
    'ground507',
    'ground508',
    'ground509',
    'ground510',
    'ground511',
    'testObject'
  ] as const
  private _listenersForUpdatedTiles: ((index: number) => void)[] = []
  public isIndexStillOnScreen: ((index: number) => boolean) | undefined
  constructor(
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    passes: MaterialPassType[] = ['beauty']
  ) {
    const dummy = memoize(() => new Object3D())

    const cyberGlowMat = getMeshMaterial('cyberGlow')
    const cyberPanelMat = getMeshMaterial('cyberPanel')
    const nothingness = () => {
      const obj = new Mesh(new BoxBufferGeometry(32, 2, 32), cyberGlowMat)
      obj.position.y = -1

      const protoPanel = new Mesh(
        getChamferedBoxGeometry(15, 4, 15, 1),
        cyberPanelMat
      )
      for (let ix = -1; ix <= 1; ix += 2) {
        for (let iy = -1; iy <= 1; iy += 2) {
          const panel = protoPanel.clone()
          obj.add(panel)
          panel.position.x = 8 * ix + 0.5
          panel.position.z = 8 * iy + 0.5
        }
      }

      return obj
    }

    const brickMat = getMeshMaterial('brick')
    const mortarMat = getMeshMaterial('mortar')
    const drywallMat = getMeshMaterial('drywall')
    const floorMat = getMeshMaterial('floor')
    const groundMat = getMeshMaterial('ground')
    const plasticMat = getMeshMaterial('plastic')
    const waterMat = getMeshMaterial('water')
    const grassMat = getMeshMaterial('grass')
    const rocksMat = getMeshMaterial('rock')
    const bushMat = getMeshMaterial('bush')
    const berryMat = getMeshMaterial('berry')
    const woodMat = getMeshMaterial('wood')
    const ball = new Mesh(new SphereGeometry(16, 32, 16), plasticMat)
    ball.scale.y = Math.SQRT1_2
    // ball.position.y = Math.SQRT1_2 * 14

    const floor = () => {
      const floorBoard = new Mesh(
        getChamferedBoxGeometry(8, 4, 32, 1),
        floorMat
      )
      const floorBoardPair = new Object3D()
      floorBoardPair.add(floorBoard)
      const floorBoard2 = floorBoard.clone()
      floorBoardPair.add(floorBoard2)
      floorBoard.position.z = -16
      floorBoard2.position.z = 16
      const floor = new Mesh(new BoxBufferGeometry(32, 2, 32), floorMat)
      detRandWoodPlanks()
      for (let i = 0; i < 4; i++) {
        const c = floorBoardPair.clone()
        c.position.x = i * 8 - 12
        c.position.z = ~~detRandWoodPlanks(-14, 14)
        floor.add(c)
      }
      floor.position.y = -1
      return floor
    }

    const timeVariations = [0, 1, 2, 3].map((v) => v / 4)
    const strengths: number[] = []
    const maxWater = 8
    for (let i = 0; i < maxWater; i++) {
      const ratio = i / (maxWater - 1)
      strengths.push(lerp(0.15, 1.2, ratio))
    }

    const water00 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[0])
    }
    const water10 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[0])
    }
    const water20 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[0])
    }
    const water30 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[0])
    }

    const water01 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[1])
    }
    const water11 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[1])
    }
    const water21 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[1])
    }
    const water31 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[1])
    }

    const water02 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[2])
    }
    const water12 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[2])
    }
    const water22 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[2])
    }
    const water32 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[2])
    }

    const water03 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[3])
    }
    const water13 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[3])
    }
    const water23 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[3])
    }
    const water33 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[3])
    }

    const water04 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[4])
    }
    const water14 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[4])
    }
    const water24 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[4])
    }
    const water34 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[4])
    }

    const water05 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[5])
    }
    const water15 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[5])
    }
    const water25 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[5])
    }
    const water35 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[5])
    }

    const water06 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[6])
    }
    const water16 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[6])
    }
    const water26 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[6])
    }
    const water36 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[6])
    }

    const water07 = () => {
      return makeWater(waterMat, timeVariations[0], strengths[7])
    }
    const water17 = () => {
      return makeWater(waterMat, timeVariations[1], strengths[7])
    }
    const water27 = () => {
      return makeWater(waterMat, timeVariations[2], strengths[7])
    }
    const water37 = () => {
      return makeWater(waterMat, timeVariations[3], strengths[7])
    }

    //brick walls

    const drywall = new Mesh(new BoxBufferGeometry(32, 32, 2), drywallMat)
    const getBrickWall = memoize(() =>
      makeBrickWall(brickMat, mortarMat, -1, 1)
    )
    const brickWallSectionSC = memoize(() => {
      const obj = getBrickWall().clone()
      obj.position.z = 8
      obj.position.x = 0
      return obj
    })
    const brickWallSectionEC = memoize(() => {
      const obj = getBrickWall().clone()
      obj.position.x = 8
      obj.rotation.y = Math.PI * 0.5
      return obj
    })
    const brickWallSectionNC = memoize(() => {
      const obj = getBrickWall().clone()
      obj.position.z = -8
      obj.rotation.y = Math.PI
      return obj
    })
    const brickWallSectionWC = memoize(() => {
      const obj = getBrickWall().clone()
      obj.position.x = -8
      obj.rotation.y = Math.PI * -0.5
      return obj
    })
    const moveRelX = (brickWall: Object3D, amt: number) => {
      brickWall.position.x += Math.cos(brickWall.rotation.y) * amt
      brickWall.position.z += Math.sin(brickWall.rotation.y) * amt
    }
    // const makeBrickWallSectionsLR = (brickWallC: Object3D) => {
    //   const brickWallL = brickWallC.clone(true)
    //   const brickWallR = brickWallC.clone(true)

    //   moveRelX(brickWallL, -16)
    //   moveRelX(brickWallR, 16)
    //   return { brickWallL, brickWallR }
    // }
    const makeBrickWallSectionsL = (brickWallC: Object3D) => {
      brickWallC.updateMatrixWorld()
      const brickWallL = brickWallC.clone(true)
      moveRelX(brickWallL, -16)
      return brickWallL
    }
    const makeBrickWallSectionsR = (brickWallC: Object3D) => {
      const brickWallR = brickWallC.clone(true)
      moveRelX(brickWallR, 16)
      return brickWallR
    }
    const brickWallSectionSL = () =>
      makeBrickWallSectionsL(brickWallSectionSC())
    const brickWallSectionSR = () =>
      makeBrickWallSectionsR(brickWallSectionSC())
    const brickWallSectionWL = () =>
      makeBrickWallSectionsL(brickWallSectionWC())
    const brickWallSectionWR = () =>
      makeBrickWallSectionsR(brickWallSectionWC())
    const brickWallSectionNL = () =>
      makeBrickWallSectionsL(brickWallSectionNC())
    const brickWallSectionNR = () =>
      makeBrickWallSectionsR(brickWallSectionNC())
    const brickWallSectionEL = () =>
      makeBrickWallSectionsL(brickWallSectionEC())
    const brickWallSectionER = () =>
      makeBrickWallSectionsR(brickWallSectionEC())

    //wooden beams, struts and studs

    const woodBeamGeo = getChamferedBoxGeometry(6, 32, 6, 1)
    const beamCenter = () => {
      const beamCenter = new Mesh(woodBeamGeo, woodMat)
      beamCenter.position.y = 16
      return beamCenter
    }

    const makeStud = memoize(() => {
      const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1)
      const stud = new Mesh(woodStudGeo, woodMat)
      stud.position.y = 16
      return stud
    })
    const makeBeamFullSectionEW = () => {
      const woodPlateGeo = getChamferedBoxGeometry(36, 3, 6, 1)
      const bottomPlate = new Mesh(woodPlateGeo, woodMat)
      bottomPlate.position.y = 1.5
      const topPlate = new Mesh(woodPlateGeo, woodMat)
      topPlate.position.y = 32 - 1.5
      const beamFullSectionEW = new Object3D()
      beamFullSectionEW.add(bottomPlate)
      beamFullSectionEW.add(topPlate)
      const stud = makeStud().clone()
      beamFullSectionEW.add(stud)
      const stud2 = stud.clone()
      stud2.position.x -= 16
      beamFullSectionEW.add(stud2)
      const stud3 = stud.clone()
      stud3.position.x += 16
      beamFullSectionEW.add(stud3)
      return beamFullSectionEW
    }
    const beamFullSectionEW = makeBeamFullSectionEW

    const beamFullSectionNS = () => {
      const obj = beamFullSectionEW().clone(true)
      obj.rotation.y = Math.PI * 0.5
      return obj
    }

    const makeShortBeam = memoize(() => {
      const woodPlateShortGeo = getChamferedBoxGeometry(15, 3, 6, 1)
      const bottomShortPlate = new Mesh(woodPlateShortGeo, woodMat)
      bottomShortPlate.position.x = 1
      bottomShortPlate.position.y = 1.5
      const topShortPlate = new Mesh(woodPlateShortGeo, woodMat)
      topShortPlate.position.x = 1
      topShortPlate.position.y = 32 - 1.5
      const shortBeam = new Object3D()
      shortBeam.add(topShortPlate)
      shortBeam.add(bottomShortPlate)
      const stud4 = makeStud().clone()
      stud4.position.x = -4.5
      const stud5 = makeStud().clone()
      stud5.position.x = 6.5
      shortBeam.add(stud4)
      shortBeam.add(stud5)
      shortBeam.position.x = 16 - 13 * 0.5
      return shortBeam
    })
    const beamE = () => {
      const obj = new Object3D()
      obj.add(makeShortBeam().clone())
      return obj
    }
    const beamS = () => {
      const obj = new Object3D()
      obj.add(makeShortBeam().clone())
      obj.rotation.y = Math.PI * 0.5
      return obj
    }
    const beamW = () => {
      const obj = new Object3D()
      obj.add(makeShortBeam().clone())
      obj.rotation.y = Math.PI
      return obj
    }
    const beamN = () => {
      const obj = new Object3D()
      obj.add(makeShortBeam().clone())
      obj.rotation.y = Math.PI * -0.5
      return obj
    }

    // brick.rotation.y = Math.PI * 0.25
    drywall.position.y = 16
    drywall.position.z = -4
    // ball.position.y = 14
    // this._camera.position.y = 16
    // this._camera.rotateY(Math.PI * -0.25)
    // pivot.add(drywall)
    // scene.add(ball)

    const grassGeoA = memoize(() => new GrassGeometry())
    const grassGeoH = memoize(() => new GrassGeometry())
    const grassGeoV = memoize(() => new GrassGeometry())
    const grassGeoCorner = memoize(() => new GrassGeometry())
    //grass
    const grassC = () => new Mesh(grassGeoA(), grassMat)
    const grassN = () => {
      const obj = new Mesh(grassGeoV(), grassMat)
      obj.position.set(0, 0, 16)
      return obj
    }
    const grassNE = () => {
      const obj = new Mesh(grassGeoCorner(), grassMat)
      obj.position.set(16, 0, 16)
      return obj
    }
    const grassE = () => {
      const obj = new Mesh(grassGeoH(), grassMat)
      obj.position.set(16, 0, 0)
      return obj
    }
    const grassSE = () => {
      const obj = new Mesh(grassGeoCorner(), grassMat)
      obj.position.set(16, 0, -16)
      return obj
    }
    const grassS = () => {
      const obj = new Mesh(grassGeoV(), grassMat)
      obj.position.set(0, 0, -16)
      return obj
    }
    const grassSW = () => {
      const obj = new Mesh(grassGeoCorner(), grassMat)
      obj.position.set(-16, 0, -16)
      return obj
    }
    const grassW = () => {
      const obj = new Mesh(grassGeoH(), grassMat)
      obj.position.set(-16, 0, 0)
      return obj
    }
    const grassNW = () => {
      const obj = new Mesh(grassGeoCorner(), grassMat)
      obj.position.set(-16, 0, 16)
      return obj
    }

    const bushC = () => makeRecursiveBush(bushMat, berryMat)
    const bushVProto = memoize(() => makeRecursiveBush(bushMat, berryMat))
    const bushHProto = memoize(() => makeRecursiveBush(bushMat, berryMat))
    const bushCornerProto = memoize(() =>
      makeRecursiveBush(bushMat, berryMat, new BushProps(16, 8, 24, 60, 22))
    )
    const bushN = () => {
      const obj = bushVProto().clone(true)
      obj.position.set(0, 0, 16)
      return obj
    }
    const bushNE = () => {
      const obj = bushCornerProto().clone(true)
      obj.position.set(16, 0, 16)
      return obj
    }
    const bushE = () => {
      const obj = bushHProto().clone(true)
      obj.position.set(16, 0, 0)
      return obj
    }
    const bushSE = () => {
      const obj = bushNE().clone(true)
      obj.position.set(16, 0, -16)
      return obj
    }
    const bushS = () => {
      const obj = bushN().clone(true)
      obj.position.set(0, 0, -16)
      return obj
    }
    const bushSW = () => {
      const obj = bushNE().clone(true)
      obj.position.set(-16, 0, -16)
      return obj
    }
    const bushW = () => {
      const obj = bushHProto().clone(true)
      obj.position.set(-16, 0, 0)
      return obj
    }
    const bushNW = () => {
      const obj = bushNE().clone(true)
      obj.position.set(-16, 0, 16)
      return obj
    }

    const goldMat = getMeshMaterial('gold')
    const silverMat = getMeshMaterial('silver')
    const ironMat = getMeshMaterial('iron')
    const copperMat = getMeshMaterial('copper')
    const goldChunkGeo = new FibonacciSphereGeometry(4, 17)
    const goldPile = () => makeGoldPile(goldChunkGeo, goldMat)

    const ironBlackMat = getMeshMaterial('ironBlack')

    const lampPost = () => makeLampPost(ironBlackMat)

    const testObject = () => {
      const obj = new Mesh(
        new TorusKnotBufferGeometry(10, 2, 48, 8),
        getMeshMaterial('plastic')
      )
      obj.position.y = 12
      obj.rotation.x = Math.PI * 0.5
      obj.scale.y *= verticalScale
      return obj
    }

    const pyramid = () => {
      const pyramidGeo = new PyramidGeometry()
      const obj = new Mesh(pyramidGeo, getMeshMaterial('floor'))
      const pyramidTop = new Mesh(pyramidGeo, getMeshMaterial('gold'))
      obj.add(pyramidTop)
      pyramidTop.scale.setScalar(0.2)
      pyramidTop.position.y = 0.82
      obj.scale.set(30, 16, 30)
      return obj
    }

    const rockyGround = () => {
      return makeRockCrumbs(getMeshMaterial('rock'))
    }

    const rocksA = memoize(() => makeRocks(rocksMat, 0))
    const rocksABig = memoize(() => makeRocks(rocksMat, 0))
    const rocksH = memoize(() => makeRocks(rocksMat, 4))
    const rocksV = memoize(() => makeRocks(rocksMat, 4))
    const rocksCorner = memoize(() => makeRocks(rocksMat, 8))
    //rocks

    const rocksC = () => rocksA()
    const rocksN = () => {
      const obj = rocksV().clone()
      obj.position.set(0, 0, 16)
      return obj
    }
    const rocksNE = () => {
      const obj = rocksCorner().clone()
      obj.position.set(16, 0, 16)
      return obj
    }
    const rocksE = () => {
      const obj = rocksH().clone()
      obj.position.set(16, 0, 0)
      return obj
    }
    const rocksSE = () => {
      const obj = rocksCorner().clone()
      obj.position.set(16, 0, -16)
      return obj
    }
    const rocksS = () => {
      const obj = rocksV().clone()
      obj.position.set(0, 0, -16)
      return obj
    }
    const rocksSW = () => {
      const obj = rocksCorner().clone()
      obj.position.set(-16, 0, -16)
      return obj
    }
    const rocksW = () => {
      const obj = rocksH().clone()
      obj.position.set(-16, 0, 0)
      return obj
    }
    const rocksNW = () => {
      const obj = rocksCorner().clone()
      obj.position.set(-16, 0, 16)
      return obj
    }
    const rocksCBig = () => {
      const obj = rocksABig().clone()
      obj.position.y += 12
      return obj
    }

    const goldOreForRocks = () => makeRocks(goldMat, 0, 2)
    const goldOreForBigRocks = () => makeRocks(goldMat, 10, 2)

    const silverOreForRocks = () => makeRocks(silverMat, 0, 2)
    const silverOreForBigRocks = () => makeRocks(silverMat, 10, 2)

    const ironOreForRocks = () => makeRocks(ironMat, 0, 2)
    const ironOreForBigRocks = () => makeRocks(ironMat, 10, 2)

    const copperOreForRocks = () => makeRocks(copperMat, 0, 2)
    const copperOreForBigRocks = () => makeRocks(copperMat, 10, 2)

    const rockCrumbsA = memoize(() => makeRockCrumbs(rocksMat))
    const rockCrumbsH = memoize(() => makeRockCrumbs(rocksMat))
    const rockCrumbsV = memoize(() => makeRockCrumbs(rocksMat))
    const rockCrumbsCorner = memoize(() => makeRockCrumbs(rocksMat))
    //rockCrumbs

    const rockCrumbsC = () => {
      const obj = rockCrumbsA().clone()
      return obj
    }
    const rockCrumbsN = () => {
      const obj = rockCrumbsV().clone()
      obj.position.set(0, 0, 16)
      return obj
    }
    const rockCrumbsNE = () => {
      const obj = rockCrumbsCorner().clone()
      obj.position.set(16, 0, 16)
      return obj
    }
    const rockCrumbsE = () => {
      const obj = rockCrumbsH().clone()
      obj.position.set(16, 0, 0)
      return obj
    }
    const rockCrumbsSE = () => {
      const obj = rockCrumbsCorner().clone()
      obj.position.set(16, 0, -16)
      return obj
    }
    const rockCrumbsS = () => {
      const obj = rockCrumbsV().clone()
      obj.position.set(0, 0, -16)
      return obj
    }
    const rockCrumbsSW = () => {
      const obj = rockCrumbsCorner().clone()
      obj.position.set(-16, 0, -16)
      return obj
    }
    const rockCrumbsW = () => {
      const obj = rockCrumbsH().clone()
      obj.position.set(-16, 0, 0)
      return obj
    }
    const rockCrumbsNW = () => {
      const obj = rockCrumbsCorner().clone()
      obj.position.set(-16, 0, 16)
      return obj
    }

    const treePine = memoize(() =>
      makeTreePine(getMeshMaterial('bark'), getMeshMaterial('pineNeedle'))
    )

    const treePineC = () => {
      const obj = treePine().clone()
      return obj
    }
    const treePineN = () => {
      const obj = treePine().clone()
      obj.position.set(0, 0, 32)
      return obj
    }
    const treePineS = () => {
      const obj = treePine().clone()
      obj.position.set(0, 0, -32)
      return obj
    }
    const treePineE = () => {
      const obj = treePine().clone()
      obj.position.set(32, 0, 0)
      return obj
    }
    const treePineW = () => {
      const obj = treePine().clone()
      obj.position.set(-32, 0, 0)
      return obj
    }
    const treePineNE = () => {
      const obj = treePine().clone()
      obj.position.set(32, 0, 32)
      return obj
    }
    const treePineSE = () => {
      const obj = treePine().clone()
      obj.position.set(32, 0, -32)
      return obj
    }
    const treePineNW = () => {
      const obj = treePine().clone()
      obj.position.set(-32, 0, 32)
      return obj
    }
    const treePineSW = () => {
      const obj = treePine().clone()
      obj.position.set(-32, 0, -32)
      return obj
    }

    const treePineMature = memoize(() =>
      makeTreePineMature(
        getMeshMaterial('bark'),
        getMeshMaterial('pineNeedle'),
        getMeshMaterial('wood')
      )
    )
    const treePineMatureC = () => {
      const obj = treePineMature().clone()
      return obj
    }
    const treePineMatureN = () => {
      const obj = treePineMature().clone()
      obj.position.set(0, 0, 32)
      return obj
    }
    const treePineMatureS = () => {
      const obj = treePineMature().clone()
      obj.position.set(0, 0, -32)
      return obj
    }
    const treePineMatureE = () => {
      const obj = treePineMature().clone()
      obj.position.set(32, 0, 0)
      return obj
    }
    const treePineMatureW = () => {
      const obj = treePineMature().clone()
      obj.position.set(-32, 0, 0)
      return obj
    }
    const treePineMatureNE = () => {
      const obj = treePineMature().clone()
      obj.position.set(32, 0, 32)
      return obj
    }
    const treePineMatureSE = () => {
      const obj = treePineMature().clone()
      obj.position.set(32, 0, -32)
      return obj
    }
    const treePineMatureNW = () => {
      const obj = treePineMature().clone()
      obj.position.set(-32, 0, 32)
      return obj
    }
    const treePineMatureSW = () => {
      const obj = treePineMature().clone()
      obj.position.set(-32, 0, -32)
      return obj
    }

    const treePineStump = memoize(() =>
      makeTreePineStump(getMeshMaterial('bark'), getMeshMaterial('wood'))
    )

    const treePineStumpMature = memoize(() =>
      makeTreePineStumpMature(getMeshMaterial('bark'), getMeshMaterial('wood'))
    )

    const treeMaple = memoize(() =>
      makeTreeMaple(getMeshMaterial('barkMaple'), getMeshMaterial('leafMaple'))
    )

    const treeMapleC = () => {
      const obj = treeMaple().clone()
      return obj
    }
    const treeMapleN = () => {
      const obj = treeMaple().clone()
      obj.position.set(0, 0, 32)
      return obj
    }
    const treeMapleS = () => {
      const obj = treeMaple().clone()
      obj.position.set(0, 0, -32)
      return obj
    }
    const treeMapleE = () => {
      const obj = treeMaple().clone()
      obj.position.set(32, 0, 0)
      return obj
    }
    const treeMapleW = () => {
      const obj = treeMaple().clone()
      obj.position.set(-32, 0, 0)
      return obj
    }
    const treeMapleNE = () => {
      const obj = treeMaple().clone()
      obj.position.set(32, 0, 32)
      return obj
    }
    const treeMapleSE = () => {
      const obj = treeMaple().clone()
      obj.position.set(32, 0, -32)
      return obj
    }
    const treeMapleNW = () => {
      const obj = treeMaple().clone()
      obj.position.set(-32, 0, 32)
      return obj
    }
    const treeMapleSW = () => {
      const obj = treeMaple().clone()
      obj.position.set(-32, 0, -32)
      return obj
    }

    const treeMapleMature = memoize(() =>
      makeTreeMapleMature(
        getMeshMaterial('barkMaple'),
        getMeshMaterial('leafMaple'),
        getMeshMaterial('woodMaple')
      )
    )
    const treeMapleMatureC = () => {
      const obj = treeMapleMature().clone()
      return obj
    }
    const treeMapleMatureN = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(0, 0, 32)
      return obj
    }
    const treeMapleMatureS = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(0, 0, -32)
      return obj
    }
    const treeMapleMatureE = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(32, 0, 0)
      return obj
    }
    const treeMapleMatureW = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(-32, 0, 0)
      return obj
    }
    const treeMapleMatureNE = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(32, 0, 32)
      return obj
    }
    const treeMapleMatureSE = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(32, 0, -32)
      return obj
    }
    const treeMapleMatureNW = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(-32, 0, 32)
      return obj
    }
    const treeMapleMatureSW = () => {
      const obj = treeMapleMature().clone()
      obj.position.set(-32, 0, -32)
      return obj
    }

    const treeMapleStump = () =>
      makeTreeMapleStump(
        getMeshMaterial('barkMaple'),
        getMeshMaterial('woodMaple')
      )

    const treeMapleStumpMature = () =>
      makeTreeMapleStumpMature(
        getMeshMaterial('barkMaple'),
        getMeshMaterial('woodMaple')
      )

    const indexedMeshes: (() => Object3D)[] = [
      dummy,
      nothingness,
      floor,
      water00,
      water10,
      water20,
      water30,
      water01,
      water11,
      water21,
      water31,
      water02,
      water12,
      water22,
      water32,
      water03,
      water13,
      water23,
      water33,
      water04,
      water14,
      water24,
      water34,
      water05,
      water15,
      water25,
      water35,
      water06,
      water16,
      water26,
      water36,
      water07,
      water17,
      water27,
      water37,
      beamCenter,
      beamN,
      beamE,
      beamS,
      beamW,
      beamFullSectionNS,
      beamFullSectionEW,
      brickWallSectionWR,
      brickWallSectionEL,
      brickWallSectionNR,
      brickWallSectionSR,
      brickWallSectionER,
      brickWallSectionWL,
      brickWallSectionSL,
      brickWallSectionNL,
      brickWallSectionNC,
      brickWallSectionEC,
      brickWallSectionSC,
      brickWallSectionWC,
      grassC,
      grassN,
      grassNE,
      grassE,
      grassSE,
      grassS,
      grassSW,
      grassW,
      grassNW,
      bushC,
      bushN,
      bushNE,
      bushE,
      bushSE,
      bushS,
      bushSW,
      bushW,
      bushNW,
      goldPile,
      lampPost,
      pyramid,
      rockyGround,
      rocksC,
      rocksCBig,
      rocksN,
      rocksNE,
      rocksE,
      rocksSE,
      rocksS,
      rocksSW,
      rocksW,
      rocksNW,
      goldOreForRocks,
      goldOreForBigRocks,
      silverOreForRocks,
      silverOreForBigRocks,
      ironOreForRocks,
      ironOreForBigRocks,
      copperOreForRocks,
      copperOreForBigRocks,
      rockCrumbsC,
      rockCrumbsN,
      rockCrumbsNE,
      rockCrumbsE,
      rockCrumbsSE,
      rockCrumbsS,
      rockCrumbsSW,
      rockCrumbsW,
      rockCrumbsNW,
      treePineC,
      treePineN,
      treePineNE,
      treePineE,
      treePineSE,
      treePineS,
      treePineSW,
      treePineW,
      treePineNW,
      treePineMatureC,
      treePineMatureN,
      treePineMatureNE,
      treePineMatureE,
      treePineMatureSE,
      treePineMatureS,
      treePineMatureSW,
      treePineMatureW,
      treePineMatureNW,
      treePineStump,
      treePineStumpMature,
      treeMapleC,
      treeMapleN,
      treeMapleNE,
      treeMapleE,
      treeMapleSE,
      treeMapleS,
      treeMapleSW,
      treeMapleW,
      treeMapleNW,
      treeMapleMatureC,
      treeMapleMatureN,
      treeMapleMatureNE,
      treeMapleMatureE,
      treeMapleMatureSE,
      treeMapleMatureS,
      treeMapleMatureSW,
      treeMapleMatureW,
      treeMapleMatureNW,
      treeMapleStump,
      treeMapleStumpMature
    ]

    const total = Math.pow(2, 9)
    for (let i = 0; i < total; i++) {
      const index = i
      indexedMeshes.push(() => {
        const bits = new NamedBitsInNumber(index, CardinalStrings)
        return makeGround(groundMat, bits)
      })
    }

    indexedMeshes.push(testObject)
    // ].map((f) => {
    //   return () => mergeMeshes(f())
    // })

    super(pixelsPerTile, pixelsPerCacheEdge, passes, indexedMeshes)
  }

  render(renderer: WebGLRenderer) {
    if (this._renderQueue.length > 0) {
      const oldViewport = new Vector4()
      const oldScissor = new Vector4()
      renderer.setClearAlpha(0)
      renderer.getViewport(oldViewport)
      renderer.getScissor(oldScissor)
      let duration = 0
      let count = 0
      for (const index of this._renderQueue) {
        count++
        const startTime = performance.now()
        const iCol = index % this._tilesPerEdge
        const iRow = ~~(index / this._tilesPerEdge)
        const visualProps = this._tileRegistry[index]
        const layer2 = !!(visualProps[0] & 1)

        for (let j = 0; j < this._indexedMeshes.length; j++) {
          const jb = ~~(j / 8)
          const j8 = j % 8
          const shouldShow = !!(visualProps[jb] & (1 << j8))
          if (this._indexedMeshesVisibility[j] && !shouldShow) {
            this._indexedMeshes[j]().visible = false
          } else if (!this._indexedMeshesVisibility[j] && shouldShow) {
            this._indexedMeshes[j]().visible = true
          }
          this._indexedMeshesVisibility[j] = shouldShow
        }
        // this._scene.updateMatrixWorld(true)

        for (const pass of this._passes) {
          renderer.setRenderTarget(this._renderTargets.get(pass)!)
          const p = this._pixelsPerTile / renderer.getPixelRatio()
          const depthPass = pass === 'customTopDownHeight'
          if (layer2 && depthPass) {
            continue
          }
          renderer.setViewport(iCol * p, iRow * p, p, p)
          renderer.setScissor(iCol * p, iRow * p, p, p)
          renderer.setScissorTest(true)
          changeMeshMaterials(this._scene, pass, true)
          renderer.clear(true, true, false)
          renderer.render(
            this._scene,
            layer2
              ? this._cameraTiltedTop
              : depthPass
              ? this._cameraTopDown
              : this._cameraTiltedBottom
          )
        }
        duration += performance.now() - startTime
        this.notifyThatNewTileIsMade(index)
        if (duration > 100) {
          break
        }
      }
      console.log(duration)
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setRenderTarget(null)
      renderer.setClearAlpha(1)
      renderer.setScissorTest(false)
      this._renderQueue.splice(0, count)
    }
  }
  notifyThatNewTileIsMade(index: number) {
    for (const l of this._listenersForUpdatedTiles) {
      l(index)
    }
  }
  listenForMadeTiles(listener: (index: number) => void) {
    this._listenersForUpdatedTiles.push(listener)
  }
  update(dt: number) {
    //
  }
}
