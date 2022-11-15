import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LinearEncoding,
  NearestFilter,
  OrthographicCamera,
  Points,
  RepeatWrapping,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import {
  PointLightPointMaterial,
  PointLightPointMaterialParameters
} from '../materials/PointLightPointMaterial'
import MapWithSpritesCacheRenderer from './MapWithSpritesCacheRenderer'
import { wrap } from '../utils/math'
import { COLOR_BLACK } from '../utils/colorLibrary'

export class LightController {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public size: number,
    public color: Color
  ) {}
}

export default class PointLightRenderer {
  private _lights: LightController[] = []
  private _lightPointsGeo: BufferGeometry
  private _viewWidth: number
  private _viewHeight: number
  private _pixelsPerTile: number
  makeLight(x: number, y: number, z: number, size: number, color: Color) {
    const light = new LightController(x, y, z, size, color)
    this._lights.push(light)
    return light
  }
  private _renderTarget: WebGLRenderTarget
  get texture() {
    return this._renderTarget.texture
  }
  pointLightScene: Scene
  pointLightCamera: OrthographicCamera
  offsetX = 0
  offsetY = 0

  constructor(
    private _mapCacheRenderer: MapWithSpritesCacheRenderer,
    width: number,
    height: number,
    maxPointLights: number,
    pixelsPerTile = 32
  ) {
    const pixelsWidth = width * pixelsPerTile
    const pixelsHeight = height * pixelsPerTile
    const renderTarget = new WebGLRenderTarget(pixelsWidth, pixelsHeight, {
      depthBuffer: false,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      encoding: LinearEncoding,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      generateMipmaps: false
    })

    const lightPointsGeo = new BufferGeometry()
    const xyzSizeArr = new Float32Array(maxPointLights * 4)
    const xyzSizeAttr = new Float32BufferAttribute(xyzSizeArr, 4)
    lightPointsGeo.setAttribute('xyzSize', xyzSizeAttr)
    const colorArr = new Float32Array(maxPointLights * 3)
    const colorAttr = new Float32BufferAttribute(colorArr, 3)
    lightPointsGeo.setAttribute('color', colorAttr)
    const indexArr = new Uint16Array(maxPointLights)
    for (let i = 0; i < maxPointLights; i++) {
      indexArr[i] = i
    }
    lightPointsGeo.setIndex(new BufferAttribute(indexArr, 1))

    const matParams: Partial<PointLightPointMaterialParameters> = {
      viewWidth: pixelsWidth,
      viewHeight: pixelsHeight,
      pixelsPerTile,
      relativeTileSize: 1 / width,
      relativePixelSize: 1 / width / pixelsPerTile,
      mapCacheColorsTexture:
        this._mapCacheRenderer.mapCache.get('customColor')!.texture,
      mapCacheNormalsTexture:
        this._mapCacheRenderer.mapCache.get('normals')!.texture,
      mapCacheRoughnessMetalnessHeightTexture:
        this._mapCacheRenderer.mapCache.get('customRoughnessMetalnessHeight')!
          .texture,
      mapCacheDepthTopDownTexture: this._mapCacheRenderer.mapCache.get(
        'customTopDownHeight'
      )!.texture
    }
    const pointsBottomMaterial = new PointLightPointMaterial(matParams)
    const pointLightPoints = new Points(lightPointsGeo, pointsBottomMaterial)
    pointLightPoints.frustumCulled = false

    const pointLightScene = new Scene()
    pointLightScene.add(pointLightPoints)
    const pointLightCamera = new OrthographicCamera(
      -100,
      100,
      100,
      -100,
      100,
      -100
    )
    pointLightScene.add(pointLightCamera)

    this._renderTarget = renderTarget
    this.pointLightScene = pointLightScene
    this.pointLightCamera = pointLightCamera
    this._lightPointsGeo = lightPointsGeo
    this._viewWidth = width
    this._viewHeight = height
    this._pixelsPerTile = pixelsPerTile
  }
  render(renderer: WebGLRenderer) {
    if (this._lights.length > 0) {
      const ppt = this._pixelsPerTile
      const lightPointsGeo = this._lightPointsGeo
      const xyzSizeAttr = lightPointsGeo.getAttribute('xyzSize')
      const xyzSizeArr = xyzSizeAttr.array as number[]
      const colorAttr = lightPointsGeo.getAttribute('color')
      const colorArr = colorAttr.array as number[]
      lightPointsGeo.drawRange.count = 0
      let j = 0
      for (let i = 0; i < this._lights.length; i++) {
        const sprite = this._lights[i]
        const x = sprite.x - this.offsetX
        const y = sprite.y - this.offsetY
        if (x < 0 || x > this._viewWidth || y < 0 || y > this._viewHeight) {
          continue
        }
        const xSnap = Math.round(wrap(x, 0, this._viewWidth) * ppt) / ppt
        const ySnap = Math.round(wrap(y, 0, this._viewHeight) * ppt) / ppt
        const j3 = j * 3
        const j4 = j * 4
        xyzSizeArr[j4] = xSnap
        xyzSizeArr[j4 + 1] = ySnap
        xyzSizeArr[j4 + 2] = sprite.z
        xyzSizeArr[j4 + 3] = sprite.size
        const c = sprite.color
        colorArr[j3] = c.r
        colorArr[j3 + 1] = c.g
        colorArr[j3 + 2] = c.b
        j++
      }
      lightPointsGeo.drawRange.count = j
      if (j === 0) {
        renderer.setRenderTarget(this._renderTarget)
        renderer.setClearColor(COLOR_BLACK, 1)
        renderer.clear(true, true, false)
        renderer.setRenderTarget(null)
        return false
      }
      xyzSizeAttr.needsUpdate = true
      colorAttr.needsUpdate = true
      renderer.setRenderTarget(this._renderTarget)
      renderer.setClearColor(COLOR_BLACK, 1)
      renderer.clear(true, false, false)
      renderer.render(this.pointLightScene, this.pointLightCamera)
      renderer.setRenderTarget(null)
      return true
    } else {
      renderer.setRenderTarget(this._renderTarget)
      renderer.setClearColor(COLOR_BLACK, 1)
      renderer.clear(true, false, false)
      renderer.setRenderTarget(null)
      return false
    }
  }
}
