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

class LightGroup {
  update(
    ppt: number,
    offsetX: number,
    offsetY: number,
    viewWidth: number,
    viewHeight: number
  ) {
    const lightPointsGeo = this._lightPointsGeo
    const xyzSizeAttr = lightPointsGeo.getAttribute('xyzSize')
    const xyzSizeArr = xyzSizeAttr.array as number[]
    const colorAttr = lightPointsGeo.getAttribute('color')
    const colorArr = colorAttr.array as number[]
    lightPointsGeo.drawRange.count = 0
    let j = 0
    for (let i = 0; i < this._lights.length; i++) {
      const sprite = this._lights[i]
      const x = sprite.x - offsetX
      const y = sprite.y - offsetY
      if (x < 0 || x > viewWidth || y < 0 || y > viewHeight) {
        continue
      }
      const xSnap = Math.round(wrap(x, 0, viewWidth) * ppt) / ppt
      const ySnap = Math.round(wrap(y, 0, viewHeight) * ppt) / ppt
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
    if (j > 0) {
      xyzSizeAttr.needsUpdate = true
      colorAttr.needsUpdate = true
    }
    return j
  }
  private _lights: LightController[] = []
  private _lightPointsGeo: BufferGeometry
  pointLightPoints: Points<BufferGeometry, PointLightPointMaterial>
  constructor(
    public useShadows: boolean,
    maxPointLights: number,
    matParams: Partial<PointLightPointMaterialParameters>
  ) {
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

    const pointsBottomMaterial = new PointLightPointMaterial(matParams)
    const pointLightPoints = new Points(lightPointsGeo, pointsBottomMaterial)
    pointLightPoints.frustumCulled = false
    this._lightPointsGeo = lightPointsGeo
    this.pointLightPoints = pointLightPoints
  }
  makeLight(x: number, y: number, z: number, size: number, color: Color) {
    const light = new LightController(x, y, z, size, color)
    this._lights.push(light)
    return light
  }
}

export default class PointLightRenderer {
  private _lightGroups: LightGroup[] = []
  private _lightGroupsLookup: Map<string, LightGroup> = new Map()
  private _pixelsWidth: number
  private _pixelsHeight: number
  getLightGroup(useShadows = true, shadowResolution = 128) {
    const key = `${useShadows ? shadowResolution : 'n'}`
    if (!this._lightGroupsLookup.has(key)) {
      const matParams: Partial<PointLightPointMaterialParameters> = {
        viewWidth: this._pixelsWidth,
        viewHeight: this._pixelsHeight,
        pixelsPerTile: this._pixelsPerTile,
        relativeTileSize: 1 / this._viewWidth,
        relativePixelSize: 1 / this._viewWidth / this._pixelsPerTile,
        mapCacheColorsTexture:
          this._mapCacheRenderer.mapCache.get('customColor')!.texture,
        mapCacheNormalsTexture:
          this._mapCacheRenderer.mapCache.get('normals')!.texture,
        mapCacheRoughnessMetalnessHeightTexture:
          this._mapCacheRenderer.mapCache.get('customRoughnessMetalnessHeight')!
            .texture,
        mapCacheDepthTopDownTexture: this._mapCacheRenderer.mapCache.get(
          'customTopDownHeight'
        )!.texture,
        useShadows,
        shadowResolution
      }

      const lightGroup = new LightGroup(
        useShadows,
        this._maxPointLights,
        matParams
      )
      this.pointLightScene.add(lightGroup.pointLightPoints)

      this._lightGroups.push(lightGroup)
      this._lightGroupsLookup.set(key, lightGroup)
    }
    return this._lightGroupsLookup.get(key)!
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
    private _viewWidth: number,
    private _viewHeight: number,
    private _maxPointLights: number,
    private _pixelsPerTile = 32,
    useShadows = true
  ) {
    const pixelsWidth = _viewWidth * _pixelsPerTile
    const pixelsHeight = _viewHeight * _pixelsPerTile
    const renderTarget = new WebGLRenderTarget(pixelsWidth, pixelsHeight, {
      depthBuffer: false,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      encoding: LinearEncoding,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      generateMipmaps: false
    })

    const pointLightScene = new Scene()
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
    this._pixelsWidth = pixelsWidth
    this._pixelsHeight = pixelsHeight
  }
  render(renderer: WebGLRenderer) {
    let jt = 0
    for (const lightGroup of this._lightGroups) {
      jt += lightGroup.update(
        this._pixelsPerTile,
        this.offsetX,
        this.offsetY,
        this._viewWidth,
        this._viewHeight
      )
    }
    if (jt === 0) {
      renderer.setRenderTarget(this._renderTarget)
      renderer.setClearColor(COLOR_BLACK, 1)
      renderer.clear(true, true, false)
      renderer.setRenderTarget(null)
    } else {
      renderer.setRenderTarget(this._renderTarget)
      renderer.setClearColor(COLOR_BLACK, 1)
      renderer.clear(true, false, false)
      renderer.render(this.pointLightScene, this.pointLightCamera)
      renderer.setRenderTarget(null)
    }
  }
}
