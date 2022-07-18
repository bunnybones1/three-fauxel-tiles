import {
  BackSide,
  BoxGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  LinearEncoding,
  Material,
  Mesh,
  MeshDepthMaterial,
  NearestFilter,
  Object3D,
  OrthographicCamera,
  Scene,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import {
  changeMaterials,
  getMaterial,
  MaterialPassType
} from '../helpers/materials/materialLib'
import { getChamferedBoxGeometry } from '../utils/geometry'
import { assertPowerOfTwo } from '../utils/math'

// const scale = 1
const scale = Math.SQRT2 / 2
export default class SpriteMaker {
  private _pivot: Object3D
  public get passes(): MaterialPassType[] {
    return this._passes
  }
  public set passes(value: MaterialPassType[]) {
    throw new Error('You cannot change passes during runtime.')
    this._passes = value
  }
  private _renderQueue: number[] = []
  private _tileRegistry: Uint8Array[] = []
  private _angleRegistry: number[] = []
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
    const pivot = new Object3D()
    pivot.scale.multiplyScalar(0.5)
    scene.add(pivot)

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
    const bodyGeo = getChamferedBoxGeometry(20, 14, 10, 3)
    const body = new Mesh(bodyGeo, getMaterial('pants'))
    body.position.y = 17
    pivot.add(body)
    const headGeo = getChamferedBoxGeometry(16, 16 * scale, 16, 4)
    const head = new Mesh(headGeo, getMaterial('skin'))
    head.position.y = 16
    body.add(head)
    const legGeo = getChamferedBoxGeometry(6, 12 * scale, 6, 2)
    const leg = new Mesh(legGeo, getMaterial('pants'))
    leg.position.x = -6
    leg.position.y = -12
    body.add(leg)
    const leg2 = leg.clone()
    leg2.position.x *= -1
    body.add(leg2)

    const armGeo = getChamferedBoxGeometry(4, 20 * scale, 4, 1.25)
    const arm = new Mesh(armGeo, getMaterial('pants'))
    arm.position.x = -12
    arm.rotation.z = Math.PI * -0.125
    arm.position.y = -1
    body.add(arm)
    const arm2 = arm.clone()
    arm2.rotation.z *= -1
    arm2.position.x *= -1
    body.add(arm2)

    const body2 = body.clone(true)
    body2.traverse((node) => {
      if (
        node instanceof Mesh &&
        node.material instanceof Material &&
        node.material.name === 'pants'
      ) {
        node.material = getMaterial('pantsRed')
      }
    })
    pivot.add(body2)

    const hat = new Mesh(
      getChamferedBoxGeometry(18, 16 * scale, 16, 3),
      getMaterial('gold')
    )
    hat.position.z = -4
    hat.position.y = 35
    hat.scale.y *= scale
    pivot.add(hat)

    const sword = new Mesh(
      getChamferedBoxGeometry(2, 4, 16, 2),
      getMaterial('gold')
    )
    sword.position.x = -14
    sword.position.z = 10
    sword.position.y = 11
    pivot.add(sword)

    const shield = new Mesh(
      getChamferedBoxGeometry(12, 12, 2, 2),
      getMaterial('gold')
    )
    shield.position.x = 12
    shield.position.y = 16
    shield.position.z = 6
    shield.rotation.y = Math.PI * 0.125
    pivot.add(shield)

    const zLimiter = new Mesh(
      new BoxGeometry(32, 32, 32),
      new MeshDepthMaterial({ side: BackSide, colorWrite: false })
    )
    zLimiter.position.y += 16
    scene.add(zLimiter)

    const dummy = new Object3D()
    scene.add(dummy)
    const indexedMeshes = [dummy, body, body2, hat, sword, shield]

    this._pivot = pivot

    this._indexedMeshes = indexedMeshes
  }

  getTexture(pass: MaterialPassType = 'beauty') {
    if (this._renderTargets.has(pass)) {
      return this._renderTargets.get(pass)!.texture
    } else {
      throw new Error(`pass "${pass}" not supported`)
    }
  }
  getTileId(tileDescription: Uint8Array, angle: number) {
    // const hash = Buffer.from(tileDescription).toString('utf-8')
    const hash = `${tileDescription.toString()}@${angle}`
    let index = this._tileHashRegistry.indexOf(hash)
    if (index === -1) {
      index = this._tileRegistry.length
      if (index >= this._maxTiles) {
        console.error(`no more room for tiles! (${index})`)
      }
      this._tileRegistry.push(tileDescription)
      this._angleRegistry.push(angle)
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
          const angle = this._angleRegistry[index]
          if (this._pivot.rotation.y !== angle) {
            this._pivot.rotation.y = angle
            this._pivot.updateMatrixWorld(true)
          }
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
