import {
  BoxBufferGeometry,
  Material,
  Mesh,
  Object3D,
  Raycaster,
  SphereBufferGeometry,
  SphereGeometry,
  TorusKnotBufferGeometry,
  Vector3,
  Vector4,
  WebGLRenderer
} from 'three'
import FibonacciSphereGeometry from '../../../geometries/FibonacciSphereGeometry'
import GrassGeometry from '../../../geometries/GrassGeometry'
import PyramidGeometry from '../../../geometries/PyramidGeometry'
import {
  changeMeshMaterials,
  CuratedMaterialType,
  getMeshMaterial,
  isCuratedMaterial,
  MaterialPassType
} from '../../../helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '../../../utils/geometry'
import { detRandWoodPlanks } from '../../../utils/random'
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
import { makeSandQuad } from '../../../meshes/factorySand'
import { lerp } from 'three/src/math/MathUtils'
import { makeDirtQuad } from '../../../meshes/factoryDirt'
import { getCachedSphereGeometry } from '../../../utils/geometry'
import { findOnlyVisibleMeshes } from '../../../../test/utils/isVisible'
import { mergeMeshes } from '../../../utils/mergeMeshes'
import { getUrlFlag, getUrlParam } from '../../../../test/utils/location'
import { makeLog } from '../../../meshes/factoryLog'

const slicknessByName: { [K in CuratedMaterialType]: number } = {
  invisible: 0.3,
  ironBlack: 1,
  ground: 0.05,
  brick: 0.9,
  gold: 1,
  silver: 1,
  iron: 1,
  copper: 1,
  mortar: 1,
  drywall: 1,
  floor: 1,
  wood: 0.9,
  woodMaple: 0.9,
  bark: 0.9,
  barkMaple: 0.9,
  skin: 1,
  plastic: 0.8,
  grass: 0.9,
  bush: 0.95,
  leafMaple: 0.9,
  pineNeedle: 0.8,
  berry: 1,
  pants: 1,
  pantsRed: 1,
  rock: 0.94,
  cyberGlow: 1,
  cyberPanel: 1,
  water: 1,
  fleeceWhite: 1,
  fleeceBlack: 1,
  sheepNose: 1,
  shinyBlack: 1,
  pitchBlack: 1,
  zombieSkin: 1,
  bone: 1,
  snow: 1
}
function getSlickness(materialName: string) {
  if (isCuratedMaterial(materialName)) {
    return slicknessByName[materialName]
  } else {
    return 1
  }
}

export default class MapTileMaker extends DoubleCachedTileMaker {
  visualPropertyLookupStrings = [
    'layer2',
    'nothingness',
    'floor',
    'logWallCenter',
    'logWallN',
    'logWallE',
    'logWallS',
    'logWallW',
    'logWallNS',
    'logWallEW',
    'logDoorNS',
    'logDoorEW',
    'logWindowNS',
    'logWindowEW',
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
    'dirt0',
    'dirt1',
    'dirt2',
    'dirt3',
    'dirt4',
    'dirt5',
    'dirt6',
    'dirt7',
    'dirt8',
    'dirt9',
    'dirt10',
    'dirt11',
    'dirt12',
    'dirt13',
    'dirt14',
    'dirt15',
    'dirt16',
    'dirt17',
    'dirt18',
    'dirt19',
    'dirt20',
    'dirt21',
    'dirt22',
    'dirt23',
    'dirt24',
    'dirt25',
    'dirt26',
    'dirt27',
    'dirt28',
    'dirt29',
    'dirt30',
    'dirt31',
    'dirt32',
    'dirt33',
    'dirt34',
    'dirt35',
    'dirt36',
    'dirt37',
    'dirt38',
    'dirt39',
    'dirt40',
    'dirt41',
    'dirt42',
    'dirt43',
    'dirt44',
    'dirt45',
    'dirt46',
    'dirt47',
    'dirt48',
    'dirt49',
    'dirt50',
    'dirt51',
    'dirt52',
    'dirt53',
    'dirt54',
    'dirt55',
    'dirt56',
    'dirt57',
    'dirt58',
    'dirt59',
    'dirt60',
    'dirt61',
    'dirt62',
    'dirt63',
    'sand0',
    'sand1',
    'sand2',
    'sand3',
    'sand4',
    'sand5',
    'sand6',
    'sand7',
    'sand8',
    'sand9',
    'sand10',
    'sand11',
    'sand12',
    'sand13',
    'sand14',
    'sand15',
    'sand16',
    'sand17',
    'sand18',
    'sand19',
    'sand20',
    'sand21',
    'sand22',
    'sand23',
    'sand24',
    'sand25',
    'sand26',
    'sand27',
    'sand28',
    'sand29',
    'sand30',
    'sand31',
    'sand32',
    'sand33',
    'sand34',
    'sand35',
    'sand36',
    'sand37',
    'sand38',
    'sand39',
    'sand40',
    'sand41',
    'sand42',
    'sand43',
    'sand44',
    'sand45',
    'sand46',
    'sand47',
    'sand48',
    'sand49',
    'sand50',
    'sand51',
    'sand52',
    'sand53',
    'sand54',
    'sand55',
    'sand56',
    'sand57',
    'sand58',
    'sand59',
    'sand60',
    'sand61',
    'sand62',
    'sand63',
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
    const grassMat = getMeshMaterial(getUrlFlag('snow') ? 'invisible' : 'grass')
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
      floor.position.y = 0
      return floor
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

    //wooden logWalls, struts and studs

    const woodLogGeo = getChamferedBoxGeometry(6, 32, 6, 2)

    const logWallCenter = () => {
      const height = 32 * 1.2
      const obj = new Object3D()
      for (let iy = -1; iy <= 1; iy += 2) {
        for (let ix = -1; ix <= 1; ix += 2) {
          const logWallCenter = makeLog(logWallLogRadius, height)
          logWallCenter.rotation.x = Math.PI * 0.5
          logWallCenter.position.x = logWallLogRadius * ix
          logWallCenter.position.z = logWallLogRadius * iy
          logWallCenter.position.y = height * 0.5
          obj.add(logWallCenter)
        }
      }
      return obj
    }

    const logWallHeight = 5
    const logWallLogRadius = 4
    const makeLogWallFullSectionEW = () => {
      const logWallFullSectionEW = new Object3D()
      for (let i = 1; i < logWallHeight; i++) {
        const log = makeLog(logWallLogRadius, 32)
        log.rotation.y = Math.PI * 0.5
        logWallFullSectionEW.add(log)
        log.position.y = i * logWallLogRadius * 2
      }
      return logWallFullSectionEW
    }
    const logWallFullSectionEW = makeLogWallFullSectionEW

    const logWallFullSectionNS = () => {
      const obj = logWallFullSectionEW().clone(true)
      obj.rotation.y += Math.PI * 0.5
      obj.position.y -= logWallLogRadius
      return obj
    }

    const excludeLogDoorIds = [1, 2, 3]
    const makeLogWallDoorSectionEW = () => {
      const logWallFullSectionEW = new Object3D()
      for (let i = 1; i < logWallHeight; i++) {
        if (excludeLogDoorIds.includes(i)) {
          continue
        }
        const log = makeLog(logWallLogRadius, 32)
        log.rotation.y = Math.PI * 0.5
        logWallFullSectionEW.add(log)
        log.position.y = i * logWallLogRadius * 2
      }
      return logWallFullSectionEW
    }
    const logWallDoorSectionEW = makeLogWallDoorSectionEW

    const logWallDoorSectionNS = () => {
      const obj = logWallDoorSectionEW().clone(true)
      obj.rotation.y += Math.PI * 0.5
      obj.position.y -= logWallLogRadius
      return obj
    }

    const excludeLogWindowIds = [2, 3]
    const makeLogWallWindowSectionEW = () => {
      const logWallFullSectionEW = new Object3D()
      for (let i = 1; i < logWallHeight; i++) {
        if (excludeLogWindowIds.includes(i)) {
          continue
        }
        const log = makeLog(logWallLogRadius, 32)
        log.rotation.y = Math.PI * 0.5
        logWallFullSectionEW.add(log)
        log.position.y = i * logWallLogRadius * 2
      }
      return logWallFullSectionEW
    }
    const logWallWindowSectionEW = makeLogWallWindowSectionEW

    const logWallWindowSectionNS = () => {
      const obj = logWallWindowSectionEW().clone(true)
      obj.rotation.y += Math.PI * 0.5
      obj.position.y -= logWallLogRadius
      return obj
    }

    const makeShortLogWall = memoize(() => {
      const shortLogWall = new Object3D()
      for (let i = 1; i < logWallHeight; i++) {
        const log = makeLog(logWallLogRadius, 24)
        log.rotation.y = Math.PI * 0.5
        shortLogWall.add(log)
        log.position.y = i * logWallLogRadius * 2
      }
      return shortLogWall
    })
    const logWallE = () => {
      const obj = new Object3D()
      obj.add(makeShortLogWall().clone())
      obj.position.x = 4
      return obj
    }
    const logWallS = () => {
      const obj = new Object3D()
      obj.add(makeShortLogWall().clone())
      obj.rotation.y = Math.PI * 0.5
      obj.position.z = -4
      obj.position.y -= logWallLogRadius
      return obj
    }
    const logWallW = () => {
      const obj = new Object3D()
      obj.add(makeShortLogWall().clone())
      obj.rotation.y = Math.PI
      obj.position.x = -4
      return obj
    }
    const logWallN = () => {
      const obj = new Object3D()
      obj.add(makeShortLogWall().clone())
      obj.rotation.y = Math.PI * -0.5
      obj.position.z = 4
      obj.position.y -= logWallLogRadius
      return obj
    }

    const woodBeamGeo = getChamferedBoxGeometry(6, 32, 6, 1)

    const makeStud = memoize(() => {
      const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1)
      const stud = new Mesh(woodStudGeo, woodMat)
      stud.position.y = 16
      return stud
    })

    const beamCenter = () => {
      const beamCenter = new Mesh(woodBeamGeo, woodMat)
      beamCenter.position.y = 16
      return beamCenter
    }

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
    // const useGrass = false
    const useGrass = !getUrlFlag('snow')
    grassMat.visible = !useGrass

    const grassGeoA = memoize(
      () => new GrassGeometry(useGrass ? 200 : 20, !useGrass)
    )
    const grassGeoH = memoize(
      () => new GrassGeometry(useGrass ? 200 : 20, !useGrass)
    )
    const grassGeoV = memoize(
      () => new GrassGeometry(useGrass ? 200 : 20, !useGrass)
    )
    const grassGeoCorner = memoize(
      () => new GrassGeometry(useGrass ? 200 : 20, !useGrass)
    )
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
      logWallCenter,
      logWallN,
      logWallE,
      logWallS,
      logWallW,
      logWallFullSectionNS,
      logWallFullSectionEW,
      logWallDoorSectionNS,
      logWallDoorSectionEW,
      logWallWindowSectionNS,
      logWallWindowSectionEW,
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

    //water
    const timeVariations = [0, 1, 2, 3].map((v) => v / 4)
    const maxWater = 8
    for (let i = 0; i < maxWater; i++) {
      const ratio = i / (maxWater - 1)
      const strength = lerp(0.15, 1.2, ratio)
      for (const timeVariation of timeVariations) {
        indexedMeshes.push(() => makeWater(waterMat, timeVariation, strength))
      }
    }
    for (const quadMaker of [makeSandQuad, makeDirtQuad]) {
      const total = Math.pow(2, 6)
      for (let i = 0; i < total; i++) {
        const quadId = ~~(i / 16)
        const tl = i % 2
        const tr = ~~(i / 2) % 2
        const bl = ~~(i / 4) % 2
        const br = ~~(i / 8) % 2
        const quads = [tl === 1, tr === 1, bl === 1, br === 1]
        indexedMeshes.push(() => quadMaker(quadId, quads, groundMat))
      }
    }

    indexedMeshes.push(testObject)

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
      const backupPixelRatio = renderer.getPixelRatio()
      renderer.setPixelRatio(1)
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

        let mergedSnow: Object3D | undefined
        if (getUrlFlag('snow') && index > 0) {
          const snowPivot = new Object3D()
          const matSnow = getMeshMaterial('snow')
          const snowBallProto = new Mesh(
            getCachedSphereGeometry(2.5, 7, 5),
            matSnow
          )
          snowBallProto.scale.y = (1 / Math.sqrt(2)) * 0.5
          const snowBalls: Mesh[] = []
          const origin = new Vector3(0, 64, 0)
          const direction = new Vector3(0, -1, 0)
          const ray = new Raycaster(origin, direction)
          this._scene.updateMatrixWorld()
          const colliders: Mesh[] = findOnlyVisibleMeshes(this._scene)
          for (let ix = -18; ix <= 18; ix += 1) {
            for (let iz = -24; iz <= 24; iz += 1) {
              origin.x = ix
              origin.z = iz
              const intersections = ray.intersectObjects(colliders, true)
              for (const intersection of intersections) {
                if (intersection.object instanceof Mesh) {
                  const slickness = getSlickness(
                    intersection.object.material.name
                  )
                  if (
                    intersection.point.y > 0.5 &&
                    intersection.face &&
                    intersection.face.normal.y > slickness
                  ) {
                    const snowBall = snowBallProto.clone()
                    snowBall.position.copy(intersection.point)
                    snowBalls.push(snowBall)
                  }
                  break
                }
              }
            }
          }
          for (const snowBall of snowBalls) {
            snowPivot.add(snowBall)
          }

          mergedSnow = mergeMeshes(snowPivot)
          this._scene.add(mergedSnow)
          mergedSnow.updateMatrix()
          mergedSnow.updateWorldMatrix(false, true)
        }

        // this._scene.updateMatrixWorld(true)
        for (const pass of this._passes) {
          renderer.setRenderTarget(this._renderTargets.get(pass)!)
          const p = this._pixelsPerTile
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
        if (mergedSnow) {
          this._scene.remove(mergedSnow)
        }
        duration += performance.now() - startTime
        this.notifyThatNewTileIsMade(index)
        if (duration > 100) {
          break
        }
      }
      renderer.setPixelRatio(backupPixelRatio)
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
