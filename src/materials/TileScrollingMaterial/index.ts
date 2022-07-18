import { DoubleSide, RawShaderMaterial, Texture, Uniform, Vector2 } from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  scroll: Vector2
  texture: Texture
}

const __defaultParams: Parameters = {
  scroll: new Vector2(0, 0),
  texture: getTempTexture()
}

export class TileScrollingMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uniforms = {
      uScroll: new Uniform(params.scroll),
      uTexture: new Uniform(params.texture)
    } as const
    const defines: { [key: string]: boolean | string | number } = {}

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
