import {
  Color,
  DoubleSide,
  RawShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector3,
  Vector4
} from 'three'
import { lerp } from 'three/src/math/MathUtils'
import { sunOffset, sunSpeed } from '../../constants'
import { buildParameters } from '../../utils/jsUtils'
import { getTempTexture } from '../../utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  uvST: Vector4
  uvSTWorldOffset: Vector4
  textureColor: Texture
  textureNormals: Texture
  textureEmissive: Texture
  textureRoughnessMetalnessHeight: Texture
  textureTopDownHeight: Texture
  texturePointLights: Texture
  clipspaceMode: boolean
  sunDirection: Vector3
  sunDirectionForWater: Vector3
  sunShadowDirection: Vector3
  colorLightAmbient: Color
  colorDarkAmbient: Color
  colorSun: Color
  relativeTileSize: number
  relativePixelSize: number
  pixelsPerTile: number
  textureFog: Texture
  fogScroll: Vector2
  waterHeight: number
  useWater: boolean
}

const __defaultParams: Parameters = {
  uvST: new Vector4(1, 1, 0, 0),
  uvSTWorldOffset: new Vector4(1, 1, 0, 0),
  textureColor: getTempTexture(),
  textureNormals: getTempTexture(),
  textureEmissive: getTempTexture(),
  textureRoughnessMetalnessHeight: getTempTexture(),
  textureTopDownHeight: getTempTexture(),
  texturePointLights: getTempTexture(),
  clipspaceMode: false,
  sunDirection: new Vector3(0, 1, 0),
  sunDirectionForWater: new Vector3(0, 1, 0),
  sunShadowDirection: new Vector3(0, 1, 0),
  colorLightAmbient: new Color(0.2, 0.27, 0.7),
  colorDarkAmbient: new Color(0.1, 0.15, 0.4),
  colorSun: new Color(0.5, 0.45, 0.3),
  relativeTileSize: 1 / 16, //one over the number of tiles in view
  relativePixelSize: 1 / 512, //one over the number of pixels in view
  pixelsPerTile: 32,
  textureFog: getTempTexture(),
  fogScroll: new Vector2(),
  waterHeight: 0.5,
  useWater: false
}

// const axis = new Vector3(0, 0, 1)
const fakeA = 0
const __sunDirectionForWaterFake = new Vector3(
  0,
  Math.cos(fakeA),
  Math.sin(fakeA)
)
const __tempVec3 = new Vector3()
export class FauxelMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uUvST = new Uniform(params.uvST)
    const uUvSTWorldOffset = new Uniform(params.uvSTWorldOffset)
    const uTextureColor = new Uniform(params.textureColor)
    const uTextureNormals = new Uniform(params.textureNormals)
    const uTextureEmissive = new Uniform(params.textureEmissive)
    const uTextureRoughnessMetalnessHeight = new Uniform(
      params.textureRoughnessMetalnessHeight
    )
    const uTextureTopDownHeight = new Uniform(params.textureTopDownHeight)
    const uTexturePointLights = new Uniform(params.texturePointLights)

    const uSunDirection = new Uniform(params.sunDirection)
    const uSunDirectionForWater = new Uniform(params.sunDirectionForWater)
    const uSunShadowDirection = new Uniform(params.sunShadowDirection)
    const originalColorLightAmbient = params.colorLightAmbient.clone()
    const nightColorLightAmbient = new Color(0.05, 0.1, 0.4)
    const uColorLightAmbient = new Uniform(params.colorLightAmbient)
    const originalColorDarkAmbient = params.colorDarkAmbient.clone()
    const nightColorDarkAmbient = new Color(0, 0.05, 0.2)
    const uColorDarkAmbient = new Uniform(params.colorDarkAmbient)
    const uColorSun = new Uniform(params.colorSun)
    const uTextureFog = new Uniform(params.textureFog)
    const uFogScroll = new Uniform(params.fogScroll)
    const uWaterHeight = new Uniform(params.waterHeight)

    // const temp = getMouseBoundViewTransform('waterReflAngle')
    // const sunAngleY = temp.y
    const sunAngleY = 0.9
    setInterval(() => {
      // console.log(sunAngleY)
      __sunDirectionForWaterFake.set(
        0,
        Math.cos(sunAngleY),
        Math.sin(sunAngleY)
      )

      // const a = 2.5
      // const a = performance.now() * 0.001
      const a = 0.1 + performance.now() * sunSpeed + sunOffset * Math.PI * 2
      params.sunDirection.set(Math.cos(a), 0.75, Math.sin(a))
      // params.sunDirection.y += 0.75
      // params.sunDirection.applyAxisAngle(axis, Math.PI * -1)
      // params.sunDirection.set(0, 1, 0)
      params.sunDirection.normalize()
      params.sunDirectionForWater.copy(__sunDirectionForWaterFake)
      params.sunDirectionForWater.x += params.sunDirection.x * 0.4
      __tempVec3.copy(params.sunDirectionForWater).normalize()
      params.sunDirectionForWater.lerp(__tempVec3, 0.4)
      params.sunDirectionForWater.multiplyScalar(
        lerp(0.97, 1, 1 - Math.abs(params.sunDirection.x))
      )
      params.sunShadowDirection.copy(params.sunDirection)
      // params.sunShadowDirection.multiplyScalar(params.pixelsPerTile*params.relativePixelSize*16)
      // params.sunShadowDirection.y = 0.1
      // params.sunShadowDirection.applyAxisAngle(axis, Math.PI * 0.5)
      params.sunShadowDirection.x *= -1
      // params.sunDirection.y *= -1
      // params.sunDirection.applyAxisAngle(axis, Math.PI * -0.5)
      // params.sunDirection.multiplyScalar(-1)

      params.sunShadowDirection.y = 0
      params.sunShadowDirection.multiplyScalar(2)
      params.fogScroll.x = performance.now() * 0.00001
      const bDay = Math.max(0, Math.sin(a))
      params.colorLightAmbient.lerpColors(
        nightColorLightAmbient,
        originalColorLightAmbient,
        bDay
      )
      params.colorDarkAmbient.lerpColors(
        nightColorDarkAmbient,
        originalColorDarkAmbient,
        bDay
      )
      params.colorSun.setRGB(
        Math.pow(bDay, 0.5),
        Math.pow(bDay, 1),
        Math.pow(bDay, 2)
      )
      uWaterHeight.value = Math.sin(3 + performance.now() * 0.001) * 0.5 + 0.4
      // params.sunShadowDirection.x = 1
      // params.sunShadowDirection.z = 1
      // params.sunShadowDirection.multiplyScalar(2)
    }, 50)
    const uniforms = {
      uUvST,
      uUvSTWorldOffset,
      uTextureColor,
      uTextureNormals,
      uTextureEmissive,
      uTextureRoughnessMetalnessHeight,
      uTextureTopDownHeight,
      uTexturePointLights,
      uSunDirection,
      uSunDirectionForWater,
      uSunShadowDirection,
      uColorLightAmbient,
      uColorDarkAmbient,
      uColorSun,
      uTextureFog,
      uFogScroll,
      uWaterHeight
    }
    const defines: { [key: string]: boolean | string | number } = {
      CLIPSPACE_MODE: params.clipspaceMode,
      RELATIVE_TILE_SIZE: params.relativeTileSize,
      RELATIVE_PIXEL_SIZE: params.relativePixelSize,
      RELATIVE_TILE_PIXEL_SIZE:
        params.relativePixelSize / params.relativeTileSize,
      USE_WATER: params.useWater
    }

    super({
      uniforms,
      defines,
      vertexShader,
      fragmentShader,
      // alphaTest: 0.5,
      // transparent: true,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide
    })
  }
}
