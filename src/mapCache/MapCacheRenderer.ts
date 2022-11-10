import {
  BufferAttribute,
  BufferGeometry,
  LinearEncoding,
  NearestFilter,
  OrthographicCamera,
  Points,
  RepeatWrapping,
  Scene,
  Uint16BufferAttribute,
  Uint8BufferAttribute,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { MaterialPassType } from '../helpers/materials/materialLib'
import { TileCacheWriterPointMaterial } from '../materials/TileCacheWriterPointMaterial'
import { wrap } from '../utils/math'

import JITTileSampler from '../rendering/tileMaker/mapTileMaker/JITTileSampler'

export default class MapCacheRenderer {
  onTileUpdated = (index: number) => {
    //
  }
  mapCache: Map<MaterialPassType, WebGLRenderTarget> = new Map()
  mapCacheScene: Scene
  mapCacheCamera: OrthographicCamera
  tileBottomPointsGeo: BufferGeometry
  tileTopPointsGeo: BufferGeometry
  private _pointsTopMaterial: TileCacheWriterPointMaterial
  private _pointsBottomMaterial: TileCacheWriterPointMaterial

  constructor(
    width: number,
    height: number,
    private _jitTileSampler: JITTileSampler,
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 1024
  ) {
    const totalTiles = width * height * 2
    const viewWidth = width * pixelsPerTile
    const viewHeight = height * pixelsPerTile
    const xyBottomArr = new Uint8Array(totalTiles * 2)
    const xyTopArr = new Uint8Array(totalTiles * 2)
    const idBottomArr = new Uint16Array(totalTiles)
    const idTopArr = new Uint16Array(totalTiles)

    for (let i = 0; i < totalTiles; i++) {
      const x = (i % width) + _jitTileSampler.offsetX
      const y = ~~(i / width) - _jitTileSampler.offsetY
      const i2 = i * 2
      const sample = _jitTileSampler.sampleVis(x, y)
      xyBottomArr[i2] = wrap(x, 0, width)
      xyBottomArr[i2 + 1] = wrap(y, 0, height)
      xyTopArr[i2] = wrap(x, 0, width)
      xyTopArr[i2 + 1] = wrap(y + 1, 0, height)
      idBottomArr[i] = sample.idBottom
      idTopArr[i] = sample.idTop
    }
    const tileBottomPointsGeo = new BufferGeometry()
    const xyBottomAttr = new Uint8BufferAttribute(xyBottomArr, 2)
    tileBottomPointsGeo.setAttribute('xy', xyBottomAttr)
    const idBottomAttr = new Uint16BufferAttribute(idBottomArr, 1)
    tileBottomPointsGeo.setAttribute('id', idBottomAttr)
    const tileTopPointsGeo = new BufferGeometry()
    const xyTopAttr = new Uint8BufferAttribute(xyTopArr, 2)
    tileTopPointsGeo.setAttribute('xy', xyTopAttr)
    const idTopAttr = new Uint16BufferAttribute(idTopArr, 1)
    tileTopPointsGeo.setAttribute('id', idTopAttr)
    const indexArr = new Uint16Array(totalTiles)
    for (let i = 0; i < totalTiles; i++) {
      indexArr[i] = i
    }
    tileBottomPointsGeo.setIndex(new BufferAttribute(indexArr, 1))
    tileTopPointsGeo.setIndex(new BufferAttribute(indexArr, 1))
    const pass = _jitTileSampler.tileMaker.passes[0]
    const pointsBottomMaterial = new TileCacheWriterPointMaterial({
      tileTex: _jitTileSampler.tileMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge
    })
    const pointsBottom = new Points(tileBottomPointsGeo, pointsBottomMaterial)
    this._pointsBottomMaterial = pointsBottomMaterial
    pointsBottom.frustumCulled = false
    const pointsTopMaterial = new TileCacheWriterPointMaterial({
      tileTex: _jitTileSampler.tileMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge
    })
    this._pointsTopMaterial = pointsTopMaterial
    const pointsTop = new Points(tileTopPointsGeo, pointsTopMaterial)
    pointsTop.frustumCulled = false
    pointsTop.renderOrder = 1

    for (const pass of _jitTileSampler.tileMaker.passes) {
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

    const mapCacheScene = new Scene()
    mapCacheScene.add(pointsBottom)
    mapCacheScene.add(pointsTop)
    const mapCacheCamera = new OrthographicCamera(
      -100,
      100,
      -100,
      100,
      100,
      -100
    )
    mapCacheScene.add(mapCacheCamera)
    this.mapCacheScene = mapCacheScene
    this.mapCacheCamera = mapCacheCamera
    this.tileBottomPointsGeo = tileBottomPointsGeo
    this.tileTopPointsGeo = tileTopPointsGeo
  }
  render(renderer: WebGLRenderer) {
    for (const pass of this._jitTileSampler.tileMaker.passes) {
      renderer.setRenderTarget(this.mapCache.get(pass)!)
      const passTileTex = this._jitTileSampler.tileMaker.getTexture(pass)
      this._pointsBottomMaterial.tileTexture = passTileTex
      this._pointsTopMaterial.tileTexture = passTileTex
      renderer.render(this.mapCacheScene, this.mapCacheCamera)
    }
    renderer.setRenderTarget(null)
  }
}
