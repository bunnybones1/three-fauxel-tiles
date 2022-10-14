import {
  BackSide,
  BoxBufferGeometry,
  BoxGeometry,
  Color,
  CylinderBufferGeometry,
  DirectionalLight,
  HemisphereLight,
  LinearEncoding,
  Mesh,
  MeshDepthMaterial,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  TorusBufferGeometry,
  TorusKnotBufferGeometry,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import FibonacciSphereGeometry from '../geometries/FibonacciSphereGeometry'
import GrassGeometry from '../geometries/GrassGeometry'
import PyramidGeometry from '../geometries/PyramidGeometry'
import {
  changeMaterials,
  getMaterial,
  MaterialPassType
} from '../helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '../utils/geometry'
import {
  assertPowerOfTwo,
  longLatToXYZ,
  pointOnSphereFibonacci,
  rand2
} from '../utils/math'
import {
  detRandGraphics,
  detRandRocks,
  detRandWoodPlanks
} from '../utils/random'
import Rocks from '../meshes/Rocks'
import { makeRocks } from '../meshes/factoryRocks'
import { makeRockCrumbs } from '../meshes/factoryRockCrumbs'
import {
  makeTreePine,
  makeTreePineMature,
  makeTreePineStump,
  makeTreePineStumpMature
} from '../meshes/factoryTreePine'

// const scale = 1
const scale = Math.SQRT2 / 2
export default class TileMaker {
  public get passes(): MaterialPassType[] {
    return this._passes
  }
  public set passes(value: MaterialPassType[]) {
    throw new Error('You cannot change passes during runtime.')
    this._passes = value
  }
  private _renderQueue: number[] = []
  private _tileRegistry: Uint8Array[] = []
  private _tileHashRegistry: string[] = []
  private _scene = new Scene()
  private _cameraTiltedBottom = new OrthographicCamera(
    -16,
    16,
    (0 * 32 + 16) * scale,
    (0 * 32 - 16) * scale,
    0,
    64
  )
  private _cameraTiltedTop = new OrthographicCamera(
    -16,
    16,
    (1 * 32 + 16) * scale,
    (1 * 32 - 16) * scale,
    0,
    64
  )
  private _cameraTopDown = new OrthographicCamera(-16, 16, 16, -16, -64, 64)
  private _renderTargets: Map<MaterialPassType, WebGLRenderTarget> = new Map()
  private _tileTexNeedsUpdate = true
  private _indexedMeshes: Object3D[]
  private _tilesPerEdge: number
  private _maxTiles: number
  constructor(
    private _pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    private _passes: MaterialPassType[] = ['beauty']
  ) {
    assertPowerOfTwo(_pixelsPerTile)
    assertPowerOfTwo(pixelsPerCacheEdge)
    this._tilesPerEdge = pixelsPerCacheEdge / _pixelsPerTile
    this._maxTiles = Math.pow(this._tilesPerEdge, 2)
    for (const pass of _passes) {
      this._renderTargets.set(
        pass,
        new WebGLRenderTarget(pixelsPerCacheEdge, pixelsPerCacheEdge, {
          minFilter: NearestFilter,
          magFilter: NearestFilter,
          encoding: LinearEncoding,
          generateMipmaps: false
        })
      )
    }
    const scene = this._scene
    scene.autoUpdate = false
    this._cameraTiltedBottom.rotateX(Math.PI * -0.25)
    this._cameraTiltedBottom.position.set(0, 32, 32)
    scene.add(this._cameraTiltedBottom)
    this._cameraTiltedTop.rotateX(Math.PI * -0.25)
    this._cameraTiltedTop.position.set(0, 32, 32)
    scene.add(this._cameraTiltedTop)
    this._cameraTopDown.rotateX(Math.PI * -0.5)
    this._cameraTopDown.position.set(0, 0, 0)
    scene.add(this._cameraTopDown)
    const ambient = new HemisphereLight(
      new Color(0.4, 0.6, 0.9),
      new Color(0.6, 0.25, 0)
    )
    scene.add(ambient)
    const light = new DirectionalLight(new Color(1, 0.9, 0.7), 1)
    light.position.set(-0.25, 1, 0.25).normalize()
    scene.add(light)
    const brickMat = getMaterial('brick')
    const mortarMat = getMaterial('mortar')
    const drywallMat = getMaterial('drywall')
    const floorMat = getMaterial('floor')
    const groundMat = getMaterial('ground')
    const ballMat = getMaterial('plastic')
    const grassMat = getMaterial('grass')
    const rocksMat = getMaterial('rock')
    const bushMat = getMaterial('bush')
    const berryMat = getMaterial('berry')
    const woodMat = getMaterial('wood')
    const ball = new Mesh(new SphereGeometry(16, 32, 16), ballMat)
    ball.scale.y = Math.SQRT1_2
    // ball.position.y = Math.SQRT1_2 * 14
    const pivot = new Object3D()
    // pivot.rotation.y = Math.PI * 0.25
    const floorBoard = new Mesh(getChamferedBoxGeometry(8, 4, 32, 1), floorMat)
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

    const ground = new Mesh(new BoxBufferGeometry(32, 2, 32), groundMat)

    //brick walls

    const drywall = new Mesh(new BoxBufferGeometry(32, 32, 2), drywallMat)
    const brickWidth = 7
    const brickHeight = 3
    const brickGap = 1
    const brickSpacingX = brickWidth + brickGap
    const brickSpacingY = brickHeight
    const brickGeo = getChamferedBoxGeometry(brickWidth, brickHeight, 4.5, 1)
    function makeBrickWall(colStart: number, colEnd: number) {
      const brickWallRoot = new Object3D()
      for (let iRow = 0; iRow < 11; iRow++) {
        for (let iCol = -1; iCol < 1; iCol++) {
          const budge = (iRow % 2) * 0.5 - 0.25
          const brick = new Mesh(brickGeo, brickMat)
          brick.position.set(
            (iCol + budge) * brickSpacingX + brickWidth * 0.5,
            (iRow + 0.5) * brickSpacingY,
            0
          )
          brickWallRoot.add(brick)
        }
      }
      const mortar = new Mesh(
        new BoxBufferGeometry((colEnd - colStart) * brickSpacingX - 1, 32, 1),
        mortarMat
      )
      mortar.position.x = -1
      mortar.position.y = 16
      mortar.position.z = -0.75
      brickWallRoot.add(mortar)
      return brickWallRoot
    }
    const brickWallSectionSC = makeBrickWall(-1, 1)
    const brickWallSectionEC = brickWallSectionSC.clone(true)
    const brickWallSectionNC = brickWallSectionSC.clone(true)
    const brickWallSectionWC = brickWallSectionSC.clone(true)
    brickWallSectionSC.position.z = 8
    brickWallSectionSC.position.x = 0
    brickWallSectionEC.position.x = 8
    brickWallSectionEC.rotation.y = Math.PI * 0.5
    brickWallSectionWC.position.x = -8
    brickWallSectionWC.rotation.y = Math.PI * -0.5
    brickWallSectionNC.position.z = -8
    brickWallSectionNC.rotation.y = Math.PI
    function makeBrickWallSectionsLR(brickWallC: Object3D) {
      const brickWallL = brickWallC.clone(true)
      const brickWallR = brickWallC.clone(true)
      function moveRelX(brickWall: Object3D, amt: number) {
        brickWall.position.x += Math.cos(brickWall.rotation.y) * amt
        brickWall.position.z += Math.sin(brickWall.rotation.y) * amt
      }
      moveRelX(brickWallL, -16)
      moveRelX(brickWallR, 16)
      return { brickWallL, brickWallR }
    }
    const { brickWallL: brickWallSectionSL, brickWallR: brickWallSectionSR } =
      makeBrickWallSectionsLR(brickWallSectionSC)
    const { brickWallL: brickWallSectionWL, brickWallR: brickWallSectionWR } =
      makeBrickWallSectionsLR(brickWallSectionWC)
    const { brickWallL: brickWallSectionNL, brickWallR: brickWallSectionNR } =
      makeBrickWallSectionsLR(brickWallSectionNC)
    const { brickWallL: brickWallSectionEL, brickWallR: brickWallSectionER } =
      makeBrickWallSectionsLR(brickWallSectionEC)

    //wooden beams, struts and studs

    const woodPlateGeo = getChamferedBoxGeometry(36, 3, 6, 1)
    const bottomPlate = new Mesh(woodPlateGeo, woodMat)
    bottomPlate.position.y = 1.5
    const topPlate = new Mesh(woodPlateGeo, woodMat)
    topPlate.position.y = 32 - 1.5
    const woodBeamGeo = getChamferedBoxGeometry(6, 32, 6, 1)
    const beamCenter = new Mesh(woodBeamGeo, woodMat)
    beamCenter.position.y = 16

    const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1)
    const stud = new Mesh(woodStudGeo, woodMat)
    const beamFullSectionEW = new Object3D()
    beamFullSectionEW.add(bottomPlate)
    beamFullSectionEW.add(topPlate)
    beamFullSectionEW.add(stud)
    stud.position.y = 16
    const stud2 = stud.clone()
    stud2.position.x -= 16
    const stud3 = stud.clone()
    stud3.position.x += 16
    beamFullSectionEW.add(stud2)
    beamFullSectionEW.add(stud3)
    const beamFullSectionNS = beamFullSectionEW.clone(true)
    beamFullSectionNS.rotation.y = Math.PI * 0.5

    const woodPlateShortGeo = getChamferedBoxGeometry(15, 3, 6, 1)
    const bottomShortPlate = new Mesh(woodPlateShortGeo, woodMat)
    bottomShortPlate.position.x = 1
    bottomShortPlate.position.y = 1.5
    const topShortPlate = new Mesh(woodPlateShortGeo, woodMat)
    topShortPlate.position.x = 1
    topShortPlate.position.y = 32 - 1.5

    const beamW = new Object3D()
    const shortBeam = new Object3D()
    shortBeam.add(topShortPlate)
    shortBeam.add(bottomShortPlate)
    const stud4 = stud.clone()
    stud4.position.x = -4.5
    const stud5 = stud.clone()
    stud5.position.x = 6.5
    shortBeam.add(stud4)
    shortBeam.add(stud5)
    shortBeam.position.x = 16 - 13 * 0.5
    beamW.add(shortBeam)
    const beamS = beamW.clone()
    beamS.rotation.y = Math.PI * 0.5
    const beamE = beamW.clone()
    beamW.rotation.y = Math.PI
    const beamN = beamW.clone()
    beamN.rotation.y = Math.PI * -0.5

    // brick.rotation.y = Math.PI * 0.25
    drywall.position.y = 16
    drywall.position.z = -4
    // ball.position.y = 14
    // this._camera.position.y = 16
    // this._camera.rotateY(Math.PI * -0.25)
    pivot.add(brickWallSectionNC)
    pivot.add(brickWallSectionWC)
    pivot.add(brickWallSectionSC)
    pivot.add(brickWallSectionEC)
    pivot.add(brickWallSectionNL)
    pivot.add(brickWallSectionWL)
    pivot.add(brickWallSectionSL)
    pivot.add(brickWallSectionEL)
    pivot.add(brickWallSectionNR)
    pivot.add(brickWallSectionWR)
    pivot.add(brickWallSectionSR)
    pivot.add(brickWallSectionER)
    pivot.add(beamCenter)
    pivot.add(beamW)
    pivot.add(beamS)
    pivot.add(beamE)
    pivot.add(beamN)
    pivot.add(beamFullSectionEW)
    pivot.add(beamFullSectionNS)
    // pivot.add(drywall)
    floor.position.y = -1
    scene.add(floor)
    ground.position.y = -1
    scene.add(ground)
    // scene.add(ball)
    scene.add(pivot)

    const grassGeoA = new GrassGeometry()
    const grassGeoH = new GrassGeometry()
    const grassGeoV = new GrassGeometry()
    const grassGeoCorner = new GrassGeometry()
    //grass
    const grassC = new Mesh(grassGeoA, grassMat)
    scene.add(grassC)
    const grassN = new Mesh(grassGeoV, grassMat)
    scene.add(grassN)
    grassN.position.set(0, 0, 16)
    const grassNE = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassNE)
    grassNE.position.set(16, 0, 16)
    const grassE = new Mesh(grassGeoH, grassMat)
    scene.add(grassE)
    grassE.position.set(16, 0, 0)
    const grassSE = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassSE)
    grassSE.position.set(16, 0, -16)
    const grassS = new Mesh(grassGeoV, grassMat)
    scene.add(grassS)
    grassS.position.set(0, 0, -16)
    const grassSW = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassSW)
    grassSW.position.set(-16, 0, -16)
    const grassW = new Mesh(grassGeoH, grassMat)
    scene.add(grassW)
    grassW.position.set(-16, 0, 0)
    const grassNW = new Mesh(grassGeoCorner, grassMat)
    scene.add(grassNW)
    grassNW.position.set(-16, 0, 16)

    const bushGeoA3 = new FibonacciSphereGeometry(2, 8)
    const berryGeo = new FibonacciSphereGeometry(3, 15)
    function makeRecursiveBush(
      radius1 = 7,
      radius2 = 4,
      knobs = 16,
      knobs2 = 30,
      y = 11
    ) {
      //bush
      const bushC = new Object3D()
      const bushC2Proto = new Object3D()
      const bushC3Proto = new Mesh(bushGeoA3, bushMat)

      for (let i = 0; i < knobs2; i++) {
        const bushC3 = bushC3Proto.clone()
        bushC3.position.fromArray(
          longLatToXYZ(pointOnSphereFibonacci(i, knobs2), radius2)
        )
        bushC3.rotation.set(
          detRandGraphics(-Math.PI, Math.PI),
          detRandGraphics(-Math.PI, Math.PI),
          detRandGraphics(-Math.PI, Math.PI)
        )
        bushC2Proto.add(bushC3)
      }
      for (let i = 0; i < knobs; i++) {
        const bushC2 = bushC2Proto.clone(true)
        bushC2.position.fromArray(
          longLatToXYZ(pointOnSphereFibonacci(i, knobs), radius1)
        )
        bushC.add(bushC2)
        // bushC2.scale.multiplyScalar(rand2(0.8, 1.2))
      }
      bushC.traverse((obj) => {
        if (detRandGraphics() > 0.975 && obj instanceof Mesh) {
          obj.geometry = berryGeo
          obj.material = berryMat
          // obj.scale.multiplyScalar(5.75) //do not scale for now, this will mess up (weaken) normals for some reason
          obj.position.multiplyScalar(1.15)
        }
      })
      bushC.rotation.set(
        detRandGraphics(-Math.PI, Math.PI),
        detRandGraphics(-Math.PI, Math.PI),
        detRandGraphics(-Math.PI, Math.PI)
      )
      const bushBase = new Object3D()
      bushBase.add(bushC)
      bushBase.scale.y *= scale
      bushC.position.y += y
      return bushBase
    }
    // bushC.material.visible = false
    const bushC = makeRecursiveBush()
    const bushVProto = makeRecursiveBush()
    const bushHProto = makeRecursiveBush()
    const bushCornerProto = makeRecursiveBush(16, 8, 24, 60, 22)
    scene.add(bushC)
    const bushN = bushVProto.clone(true)
    scene.add(bushN)
    bushN.position.set(0, 0, 16)
    const bushNE = bushCornerProto.clone(true)
    scene.add(bushNE)
    bushNE.position.set(16, 0, 16)
    const bushE = bushHProto.clone(true)
    scene.add(bushE)
    bushE.position.set(16, 0, 0)
    const bushSE = bushNE.clone(true)
    scene.add(bushSE)
    bushSE.position.set(16, 0, -16)
    const bushS = bushN.clone(true)
    scene.add(bushS)
    bushS.position.set(0, 0, -16)
    const bushSW = bushNE.clone(true)
    scene.add(bushSW)
    bushSW.position.set(-16, 0, -16)
    const bushW = bushHProto.clone(true)
    scene.add(bushW)
    bushW.position.set(-16, 0, 0)
    const bushNW = bushNE.clone(true)
    scene.add(bushNW)
    bushNW.position.set(-16, 0, 16)

    const goldMat = getMaterial('gold')
    const goldChunkGeo = new FibonacciSphereGeometry(4, 17)
    function makeGoldPile(radius = 16, knobs = 170, y = -12) {
      const goldPile = new Object3D()
      const goldChunk = new Mesh(goldChunkGeo, goldMat)
      const pos = new Vector3()
      for (let i = 0; i < knobs; i++) {
        pos.fromArray(longLatToXYZ(pointOnSphereFibonacci(i, knobs), radius))
        if (pos.y > -y) {
          const goldCoin = goldChunk.clone()
          goldCoin.scale.y *= 0.2
          goldCoin.position.copy(pos)
          goldCoin.rotation.set(rand2(0.2), rand2(0.2), rand2(0.2))
          goldPile.add(goldCoin)
        }
      }
      goldPile.position.y += y
      return goldPile
    }
    const goldPile = makeGoldPile()
    scene.add(goldPile)

    const ironBlackMat = getMaterial('ironBlack')
    function makeLampPost() {
      const lampPost = new Object3D()
      const ironCylinder = new Mesh(
        new CylinderBufferGeometry(0.5, 0.5, 1, 16, 1),
        ironBlackMat
      )
      const cylPosArr = ironCylinder.geometry.attributes.position
        .array as number[]
      for (let i = 1; i < cylPosArr.length; i += 3) {
        cylPosArr[i] += 0.5
      }
      const ring = new Mesh(
        new TorusBufferGeometry(0.45, 0.1, 32, 16),
        ironBlackMat
      )
      const lampPole = ironCylinder.clone()
      lampPost.add(lampPole)
      lampPole.scale.set(6, 12, 6)
      const lampPole2 = ironCylinder.clone()
      lampPole2.scale.set(3, 39, 3)
      lampPost.add(lampPole2)
      const middleRing = ring.clone()
      middleRing.scale.set(8, 8, 8)
      middleRing.position.y = 12
      middleRing.rotation.x = Math.PI * 0.5
      lampPost.add(middleRing)
      const middleRing2 = middleRing.clone()
      middleRing2.position.y = 2
      lampPost.add(middleRing2)
      // const middleRing3 = middleRing.clone()
      // middleRing3.position.y = 32
      // lampPost.add(middleRing3)
      const lampPole3 = lampPole2.clone()
      lampPole3.scale.set(2, 9, 2)
      lampPole3.position.y = 38
      lampPole3.rotation.z = Math.PI * -0.25
      lampPost.add(lampPole3)
      const lampPole4 = lampPole2.clone()
      lampPole4.scale.set(2, 6, 2)
      lampPole4.position.x = 6
      lampPole4.position.y = 44
      lampPole4.rotation.z = Math.PI * -0.5
      lampPost.add(lampPole4)
      const lampShade = new Mesh(
        getChamferedBoxGeometry(8, 4, 8, 2),
        ironBlackMat
      )
      lampShade.position.set(12, 43, 0)
      lampPost.add(lampShade)
      // const middleRing4 = middleRing.clone()
      // middleRing4.position.y = 44
      // lampPost.add(middleRing4)
      // const topper = new Mesh(new ConeBufferGeometry(10, 4, 6), ironBlackMat)
      // topper.position.y = 42
      // lampPost.add(topper)
      return lampPost
    }
    const lampPost = makeLampPost()
    scene.add(lampPost)

    const testObject = new Mesh(
      new TorusKnotBufferGeometry(10, 2, 48, 8),
      getMaterial('plastic')
    )
    testObject.position.y = 12
    testObject.rotation.x = Math.PI * 0.5
    testObject.scale.y *= scale
    scene.add(testObject)

    const pyramidGeo = new PyramidGeometry()

    const pyramid = new Mesh(pyramidGeo, getMaterial('floor'))
    const pyramidTop = new Mesh(pyramidGeo, getMaterial('gold'))
    pyramid.add(pyramidTop)
    pyramidTop.scale.setScalar(0.2)
    pyramidTop.position.y = 0.82
    pyramid.scale.set(30, 16, 30)
    scene.add(pyramid)

    const rockyGroundProto = new Mesh(pyramidGeo, getMaterial('ground'))

    const rockyGround = new Object3D()
    for (let i = 0; i < 12; i++) {
      const rocky = rockyGroundProto.clone()
      rockyGround.add(rocky)
      rocky.scale.set(
        detRandRocks(3, 10),
        detRandRocks(0.25, 0.5),
        detRandRocks(3, 10)
      )
      rocky.rotation.y = detRandRocks(0, Math.PI * 2)
      rocky.position.set(detRandRocks(-12, 12), 0, detRandRocks(-12, 12))
    }
    scene.add(rockyGround)

    const rocksA = makeRocks(rocksMat, 0)
    const rocksABig = makeRocks(rocksMat, 0)
    const rocksH = makeRocks(rocksMat, 4)
    const rocksV = makeRocks(rocksMat, 4)
    const rocksCorner = makeRocks(rocksMat, 8)
    //rocks

    const rocksC = rocksA.clone()
    scene.add(rocksC)
    const rocksN = rocksV.clone()
    scene.add(rocksN)
    rocksN.position.set(0, 0, 16)
    const rocksNE = rocksCorner.clone()
    scene.add(rocksNE)
    rocksNE.position.set(16, 0, 16)
    const rocksE = rocksH.clone()
    scene.add(rocksE)
    rocksE.position.set(16, 0, 0)
    const rocksSE = rocksCorner.clone()
    scene.add(rocksSE)
    rocksSE.position.set(16, 0, -16)
    const rocksS = rocksV.clone()
    scene.add(rocksS)
    rocksS.position.set(0, 0, -16)
    const rocksSW = rocksCorner.clone()
    scene.add(rocksSW)
    rocksSW.position.set(-16, 0, -16)
    const rocksW = rocksH.clone()
    scene.add(rocksW)
    rocksW.position.set(-16, 0, 0)
    const rocksNW = rocksCorner.clone()
    scene.add(rocksNW)
    rocksNW.position.set(-16, 0, 16)

    const rocksCBig = rocksABig.clone()
    rocksCBig.position.y += 12
    scene.add(rocksCBig)

    const goldOreForRocks = makeRocks(goldMat, 0, 2)
    scene.add(goldOreForRocks)
    const goldOreForBigRocks = makeRocks(goldMat, 10, 2)
    scene.add(goldOreForBigRocks)

    const rockCrumbsA = makeRockCrumbs(rocksMat)
    const rockCrumbsH = makeRockCrumbs(rocksMat)
    const rockCrumbsV = makeRockCrumbs(rocksMat)
    const rockCrumbsCorner = makeRockCrumbs(rocksMat)
    //rockCrumbs

    const rockCrumbsC = rockCrumbsA.clone()
    scene.add(rockCrumbsC)
    const rockCrumbsN = rockCrumbsV.clone()
    scene.add(rockCrumbsN)
    rockCrumbsN.position.set(0, 0, 16)
    const rockCrumbsNE = rockCrumbsCorner.clone()
    scene.add(rockCrumbsNE)
    rockCrumbsNE.position.set(16, 0, 16)
    const rockCrumbsE = rockCrumbsH.clone()
    scene.add(rockCrumbsE)
    rockCrumbsE.position.set(16, 0, 0)
    const rockCrumbsSE = rockCrumbsCorner.clone()
    scene.add(rockCrumbsSE)
    rockCrumbsSE.position.set(16, 0, -16)
    const rockCrumbsS = rockCrumbsV.clone()
    scene.add(rockCrumbsS)
    rockCrumbsS.position.set(0, 0, -16)
    const rockCrumbsSW = rockCrumbsCorner.clone()
    scene.add(rockCrumbsSW)
    rockCrumbsSW.position.set(-16, 0, -16)
    const rockCrumbsW = rockCrumbsH.clone()
    scene.add(rockCrumbsW)
    rockCrumbsW.position.set(-16, 0, 0)
    const rockCrumbsNW = rockCrumbsCorner.clone()
    scene.add(rockCrumbsNW)
    rockCrumbsNW.position.set(-16, 0, 16)

    const zLimiter = new Mesh(
      new BoxGeometry(32, 32, 32),
      new MeshDepthMaterial({ side: BackSide, colorWrite: false })
    )
    zLimiter.position.y += 16
    scene.add(zLimiter)
    const dummy = new Object3D()

    const treePine = makeTreePine(
      getMaterial('bark'),
      getMaterial('pineNeedle')
    )

    const treePineC = treePine.clone()
    scene.add(treePineC)
    const treePineN = treePine.clone()
    treePineN.position.set(0, 0, 32)
    scene.add(treePineN)
    const treePineS = treePine.clone()
    treePineS.position.set(0, 0, -32)
    scene.add(treePineS)
    const treePineE = treePine.clone()
    treePineE.position.set(32, 0, 0)
    scene.add(treePineE)
    const treePineW = treePine.clone()
    treePineW.position.set(-32, 0, 0)
    scene.add(treePineW)
    const treePineNE = treePine.clone()
    treePineNE.position.set(32, 0, 32)
    scene.add(treePineNE)
    const treePineSE = treePine.clone()
    treePineSE.position.set(32, 0, -32)
    scene.add(treePineSE)
    const treePineNW = treePine.clone()
    treePineNW.position.set(-32, 0, 32)
    scene.add(treePineNW)
    const treePineSW = treePine.clone()
    treePineSW.position.set(-32, 0, -32)
    scene.add(treePineSW)

    const treePineMature = makeTreePineMature(
      getMaterial('bark'),
      getMaterial('pineNeedle'),
      getMaterial('wood')
    )
    const treePineMatureC = treePineMature.clone()
    scene.add(treePineMatureC)
    const treePineMatureN = treePineMature.clone()
    treePineMatureN.position.set(0, 0, 32)
    scene.add(treePineMatureN)
    const treePineMatureS = treePineMature.clone()
    treePineMatureS.position.set(0, 0, -32)
    scene.add(treePineMatureS)
    const treePineMatureE = treePineMature.clone()
    treePineMatureE.position.set(32, 0, 0)
    scene.add(treePineMatureE)
    const treePineMatureW = treePineMature.clone()
    treePineMatureW.position.set(-32, 0, 0)
    scene.add(treePineMatureW)
    const treePineMatureNE = treePineMature.clone()
    treePineMatureNE.position.set(32, 0, 32)
    scene.add(treePineMatureNE)
    const treePineMatureSE = treePineMature.clone()
    treePineMatureSE.position.set(32, 0, -32)
    scene.add(treePineMatureSE)
    const treePineMatureNW = treePineMature.clone()
    treePineMatureNW.position.set(-32, 0, 32)
    scene.add(treePineMatureNW)
    const treePineMatureSW = treePineMature.clone()
    treePineMatureSW.position.set(-32, 0, -32)
    scene.add(treePineMatureSW)

    const treePineStump = makeTreePineStump(
      getMaterial('bark'),
      getMaterial('wood')
    )
    scene.add(treePineStump)

    const treePineStumpMature = makeTreePineStumpMature(
      getMaterial('bark'),
      getMaterial('wood')
    )
    scene.add(treePineStumpMature)

    const indexedMeshes = [
      dummy,
      floor,
      beamCenter,
      beamN, // 'beamN',
      beamE, // 'beamE',
      beamS, // 'beamS',
      beamW, // 'beamW',
      beamFullSectionNS, // 'beamNS',
      beamFullSectionEW, // 'beamEW',
      brickWallSectionWR, // 0
      brickWallSectionEL, // 1
      brickWallSectionNR, // 2
      brickWallSectionSR, // 3
      brickWallSectionER, // 4
      brickWallSectionWL, // 5
      brickWallSectionSL, // 6
      brickWallSectionNL, // 7
      brickWallSectionNC, // 8
      brickWallSectionEC, // 9
      brickWallSectionSC, // 10
      brickWallSectionWC, // 11
      ground,
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
      testObject,
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
      treePineStumpMature
    ]

    this._indexedMeshes = indexedMeshes
  }

  getTexture(pass: MaterialPassType = 'beauty') {
    if (this._renderTargets.has(pass)) {
      return this._renderTargets.get(pass)!.texture
    } else {
      debugger
      throw new Error(`pass "${pass}" not supported`)
    }
  }
  getTileId(tileDescription: Uint8Array) {
    // const hash = Buffer.from(tileDescription).toString('utf-8')
    const hash = tileDescription.toString()
    let index = this._tileHashRegistry.indexOf(hash)
    if (index === -1) {
      index = this._tileRegistry.length
      if (index >= this._maxTiles) {
        console.error(`no more room for tiles! (${index})`)
      }
      this._tileRegistry.push(tileDescription)
      this._tileHashRegistry.push(hash)
      this._renderQueue.push(index)
      this._tileTexNeedsUpdate = true
    }
    return index
  }
  render(renderer: WebGLRenderer) {
    if (this._tileTexNeedsUpdate) {
      const oldViewport = new Vector4()
      const oldScissor = new Vector4()
      renderer.getViewport(oldViewport)
      renderer.getScissor(oldScissor)
      this._tileTexNeedsUpdate = false
      this._scene.updateMatrixWorld(true)
      for (const pass of this._passes) {
        renderer.setRenderTarget(this._renderTargets.get(pass)!)
        const p = this._pixelsPerTile / renderer.getPixelRatio()
        const depthPass = pass === 'customTopDownHeight'
        for (const index of this._renderQueue) {
          const iCol = index % this._tilesPerEdge
          const iRow = ~~(index / this._tilesPerEdge)
          const visualProps = this._tileRegistry[index]
          const layer2 = !!(visualProps[0] & 1)
          if (layer2 && depthPass) {
            continue
          }
          for (let j = 0; j < this._indexedMeshes.length; j++) {
            const jb = ~~(j / 8)
            const j8 = j % 8
            this._indexedMeshes[j].visible = !!(visualProps[jb] & (1 << j8))
          }

          renderer.setViewport(iCol * p, iRow * p, p, p)
          renderer.setScissor(iCol * p, iRow * p, p, p)
          changeMaterials(this._scene, pass, true)
          renderer.render(
            this._scene,
            layer2
              ? this._cameraTiltedTop
              : depthPass
              ? this._cameraTopDown
              : this._cameraTiltedBottom
          )
        }
      }
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setRenderTarget(null)
      this._renderQueue.length = 0
    }
  }
}
