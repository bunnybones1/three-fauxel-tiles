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
  setSunAngle: (sunAngle: number) => void
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

    const sunDirection = params.sunDirection
    const uSunDirection = new Uniform(sunDirection)
    const sunDirectionForWater = params.sunDirectionForWater
    const uSunDirectionForWater = new Uniform(sunDirectionForWater)
    const sunShadowDirection = params.sunShadowDirection
    const uSunShadowDirection = new Uniform(sunShadowDirection)
    const originalColorLightAmbient = params.colorLightAmbient.clone()
    const nightColorLightAmbient = new Color(0.05, 0.1, 0.4).multiplyScalar(0.1)
    const colorLightAmbient = params.colorLightAmbient
    const uColorLightAmbient = new Uniform(colorLightAmbient)
    const originalColorDarkAmbient = params.colorDarkAmbient.clone()
    const nightColorDarkAmbient = new Color(0, 0.05, 0.2).multiplyScalar(0.1)
    const colorDarkAmbient = params.colorDarkAmbient
    const uColorDarkAmbient = new Uniform(colorDarkAmbient)
    const colorSun = params.colorSun
    const uColorSun = new Uniform(colorSun)
    const uTextureFog = new Uniform(params.textureFog)
    const uFogScroll = new Uniform(params.fogScroll)
    const uWaterHeight = new Uniform(params.waterHeight)

    const waterSunAngleY = 0.9
    __sunDirectionForWaterFake.set(
      0,
      Math.cos(waterSunAngleY),
      Math.sin(waterSunAngleY)
    )
    sunDirectionForWater.copy(__sunDirectionForWaterFake)
    sunDirectionForWater.x += params.sunDirection.x * 0.4
    __tempVec3.copy(sunDirectionForWater).normalize()
    sunDirectionForWater.lerp(__tempVec3, 0.4)
    sunDirectionForWater.multiplyScalar(
      lerp(0.97, 1, 1 - Math.abs(sunDirection.x))
    )
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

    this.setSunAngle = (sunAngle: number) => {
      sunDirection.set(Math.cos(sunAngle), 0.75, Math.sin(sunAngle))
      sunDirection.normalize()

      sunShadowDirection.copy(sunDirection)
      sunShadowDirection.x *= -1
      sunShadowDirection.y = 0
      sunShadowDirection.multiplyScalar(2)

      const bDay = Math.max(0, Math.sin(sunAngle))
      colorLightAmbient.lerpColors(
        nightColorLightAmbient,
        originalColorLightAmbient,
        bDay
      )
      colorDarkAmbient.lerpColors(
        nightColorDarkAmbient,
        originalColorDarkAmbient,
        bDay
      )
      colorSun.setRGB(Math.pow(bDay, 0.5), Math.pow(bDay, 1), Math.pow(bDay, 2))
    }
  }
}
