import {
  BackSide,
  BoxGeometry,
  LinearEncoding,
  Mesh,
  MeshDepthMaterial,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  Scene,
  WebGLRenderTarget
} from 'three'
import { MaterialPassType } from '../../helpers/materials/materialLib'
import { assertPowerOfTwo } from '../../utils/math'
import { verticalScale } from '../../constants'
import { memoize } from '../../utils/memoizer'

export default class TileMaker {
  protected _pivot: Object3D
  public get passes(): MaterialPassType[] {
    return this._passes
  }
  public set passes(value: MaterialPassType[]) {
    throw new Error('You cannot change passes during runtime.')
    // this._passes = value
  }
  protected _renderQueue: number[] = []
  protected _tileRegistry: Uint8Array[] = []
  protected _tileHashRegistry: string[] = []
  protected _scene = new Scene()
  protected _cameraTiltedBottom = new OrthographicCamera(
    -16,
    16,
    (0 * 32 + 16) * verticalScale,
    (0 * 32 - 16) * verticalScale,
    0,
    64
  )
  protected _cameraTiltedTop = new OrthographicCamera(
    -16,
    16,
    (1 * 32 + 16) * verticalScale,
    (1 * 32 - 16) * verticalScale,
    0,
    64
  )
  protected _cameraTopDown = new OrthographicCamera(-16, 16, 16, -16, -64, 64)
  protected _renderTargets: Map<MaterialPassType, WebGLRenderTarget> = new Map()
  protected _indexedMeshesVisibility: boolean[]
  protected _indexedMeshes: (() => Object3D)[]
  protected _tilesPerEdge: number
  protected _maxTiles: number
  constructor(
    protected _pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    protected _passes: MaterialPassType[] = ['beauty'],
    indexedMeshMakers: (() => Object3D)[]
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
    console.log('performance.now', performance.now())

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

    const pivot = new Object3D()
    scene.add(pivot)

    const memoScene = (generator: () => Object3D) => {
      const memodGenerator = memoize(generator)
      return function generatorAndAdder() {
        const obj = memodGenerator()
        if (!obj.parent) {
          pivot.add(obj)
          obj.updateWorldMatrix(false, true)
        }
        return obj
      }
    }

    this._pivot = pivot

    const zLimiter = new Mesh(
      new BoxGeometry(32, 32, 32),
      new MeshDepthMaterial({ side: BackSide, colorWrite: false })
    )
    zLimiter.position.y += 16
    scene.add(zLimiter)

    this._indexedMeshes = indexedMeshMakers.map(memoScene)
    this._indexedMeshesVisibility = new Array(indexedMeshMakers.length)
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
    }
    return index
  }
}
