import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  LinearEncoding,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneBufferGeometry,
  Points,
  RepeatWrapping,
  Scene,
  Uint16BufferAttribute,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { MaterialPassType } from '../helpers/materials/materialLib'
import {
  TileCacheWriterPointMaterial,
  TileCacheWriterPointMaterialParameters
} from '../materials/TileCacheWriterPointMaterial'

import JITSpriteSampler from '../rendering/tileMaker/spriteMaker/JITSpriteSampler'
import MapCacheRenderer from '../mapCache/MapCacheRenderer'
import { getTempTexture } from '../utils/threeUtils'
import { BasicTextureMaterial } from '../materials/BasicTextureMaterial'

export default class MapWithSpritesCacheRenderer {
  mapCache: Map<MaterialPassType, WebGLRenderTarget> = new Map()
  mapCacheScene: Scene
  mapCacheCamera: OrthographicCamera
  mapCacheBackdropMaterial: BasicTextureMaterial
  spriteBottomPointsGeo: BufferGeometry
  spriteTopPointsGeo: BufferGeometry
  private _pointsTopMaterial: TileCacheWriterPointMaterial
  private _pointsBottomMaterial: TileCacheWriterPointMaterial
  backdrop: Mesh<PlaneBufferGeometry, BasicTextureMaterial>
  offsetX = 0
  offsetY = 0
  private _backdropUvST: Vector4
  private _tilesInViewWidth: number
  private _tilesInViewHeight: number

  constructor(
    private _mapCacheRenderer: MapCacheRenderer,
    width: number,
    height: number,
    maxSprites: number,
    private _jitSpriteSampler: JITSpriteSampler,
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 1024
  ) {
    const viewWidth = width * pixelsPerTile
    const viewHeight = height * pixelsPerTile
    const xyBottomArr = new Float32Array(maxSprites * 2)
    const xyTopArr = new Float32Array(maxSprites * 2)
    const idBottomArr = new Uint16Array(maxSprites)
    const idTopArr = new Uint16Array(maxSprites)

    const tileBottomPointsGeo = new BufferGeometry()
    const xyBottomAttr = new Float32BufferAttribute(xyBottomArr, 2)
    tileBottomPointsGeo.setAttribute('xy', xyBottomAttr)
    const idBottomAttr = new Uint16BufferAttribute(idBottomArr, 1)
    tileBottomPointsGeo.setAttribute('id', idBottomAttr)
    const tileTopPointsGeo = new BufferGeometry()
    const xyTopAttr = new Float32BufferAttribute(xyTopArr, 2)
    tileTopPointsGeo.setAttribute('xy', xyTopAttr)
    const idTopAttr = new Uint16BufferAttribute(idTopArr, 1)
    tileTopPointsGeo.setAttribute('id', idTopAttr)
    const indexArr = new Uint16Array(maxSprites)
    for (let i = 0; i < maxSprites; i++) {
      indexArr[i] = i
    }
    tileBottomPointsGeo.setIndex(new BufferAttribute(indexArr, 1))
    tileTopPointsGeo.setIndex(new BufferAttribute(indexArr, 1))
    const spriteMaker = _jitSpriteSampler.spriteMaker
    const pass = _jitSpriteSampler.spriteMaker.passes[0]

    for (const pass of spriteMaker.passes) {
      const mapCache = new WebGLRenderTarget(viewWidth, viewHeight, {
        magFilter: NearestFilter,
        minFilter: NearestFilter,
        encoding: LinearEncoding,
        generateMipmaps: false,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping
      })
      this.mapCache.set(pass, mapCache)
    }

    const uvST = new Vector4(1, 1, 0, 0)
    const matParams: Partial<TileCacheWriterPointMaterialParameters> = {
      tileTex: spriteMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge,
      mapDepthCacheTexture: this._mapCacheRenderer.mapCache.get(
        'customRoughnessMetalnessHeight'
      )!.texture,
      mapDepthCacheUvST: uvST,
      alternateDepthTileTex: spriteMaker.getTexture(
        'customRoughnessMetalnessHeight'
      ),
      depthSortByY: true
    }
    const pointsBottomMaterial = new TileCacheWriterPointMaterial(matParams)
    const pointsBottom = new Points(tileBottomPointsGeo, pointsBottomMaterial)
    this._pointsBottomMaterial = pointsBottomMaterial
    pointsBottom.frustumCulled = false
    matParams.z = -0.1
    const pointsTopMaterial = new TileCacheWriterPointMaterial(matParams)
    this._pointsTopMaterial = pointsTopMaterial
    const pointsTop = new Points(tileTopPointsGeo, pointsTopMaterial)
    pointsTop.frustumCulled = false
    pointsTop.renderOrder = 1

    const mapCacheScene = new Scene()
    mapCacheScene.add(pointsBottom)
    mapCacheScene.add(pointsTop)
    const mapCacheCamera = new OrthographicCamera(
      -100,
      100,
      100,
      -100,
      100,
      -100
    )
    mapCacheScene.add(mapCacheCamera)
    const backdropMaterial = new BasicTextureMaterial({
      texture: getTempTexture(),
      uvST
    })
    backdropMaterial.depthTest = false
    backdropMaterial.depthWrite = false

    const backdrop = new Mesh(
      new PlaneBufferGeometry(200, 200),
      backdropMaterial
    )
    mapCacheScene.add(backdrop)
    backdrop.position.z = -1
    backdrop.renderOrder = -1
    this.backdrop = backdrop
    this.mapCacheScene = mapCacheScene
    this.mapCacheCamera = mapCacheCamera
    this.mapCacheBackdropMaterial = backdropMaterial
    this.spriteBottomPointsGeo = tileBottomPointsGeo
    this.spriteTopPointsGeo = tileTopPointsGeo
    this._backdropUvST = uvST
    this._tilesInViewWidth = width
    this._tilesInViewHeight = height
  }
  render(renderer: WebGLRenderer) {
    this._backdropUvST.z = this.offsetX / this._tilesInViewWidth
    this._backdropUvST.w = this.offsetY / this._tilesInViewHeight
    for (const pass of this._jitSpriteSampler.spriteMaker.passes) {
      this.mapCacheBackdropMaterial.texture =
        this._mapCacheRenderer.mapCache.get(pass)!.texture
      renderer.setRenderTarget(this.mapCache.get(pass)!)
      const passTileTex = this._jitSpriteSampler.spriteMaker.getTexture(pass)
      const passDepthTileTex = this._jitSpriteSampler.spriteMaker.getTexture(
        pass === 'customTopDownHeight'
          ? 'customTopDownHeight'
          : 'customRoughnessMetalnessHeight'
      )
      this._pointsBottomMaterial.tileTexture = passTileTex
      this._pointsBottomMaterial.alternateDepthTileTexture = passDepthTileTex
      this._pointsTopMaterial.tileTexture = passTileTex
      this._pointsTopMaterial.alternateDepthTileTexture = passDepthTileTex
      renderer.clearDepth()
      renderer.render(this.mapCacheScene, this.mapCacheCamera)
    }
    renderer.setRenderTarget(null)
  }
}
