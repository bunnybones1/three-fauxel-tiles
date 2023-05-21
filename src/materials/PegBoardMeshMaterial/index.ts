import {
  DoubleSide,
  LinearFilter,
  MaterialParameters,
  NearestFilter,
  RawShaderMaterial,
  Uniform,
  Vector4
} from 'three'
import { buildParameters } from '../../utils/jsUtils'

import { getTempTexture } from '../../utils/threeUtils'

import { loadTexture } from '../../loaders/assetLoader'

function url(name: string, ext: string) {
  return `fonts/${name}.${ext}`
}
import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  data: Vector4
}

const __defaultParams: Parameters = {
  data: new Vector4(0.5, 0.5, 0.5, 0.5)
}

export default class PegboardMeshMaterial extends RawShaderMaterial {
  constructor(
    options: Partial<Parameters> = {},
    matOptions: MaterialParameters = {}
  ) {
    const params = buildParameters(__defaultParams, options)
    const uTexture = new Uniform(getTempTexture())
    loadTexture('game/tilemaps/test-blocks.png').then((tex) => {
      uTexture.value = tex
      tex.magFilter = tex.minFilter = NearestFilter
    })
    const uniforms = {
      texture: uTexture,
      color: new Uniform(params.data)
    }

    const defines = {} as any

    super({
      defines,
      uniforms,
      vertexShader,
      fragmentShader,
      // alphaTest: 0.5,
      // transparent: true,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      ...matOptions
    })
  }
}
