import { RawShaderMaterial, Texture, Uniform, Vector3 } from 'three'
import { pixelAspectRatioUniform } from '~/uniforms'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  spriteTex: Texture
  paletteTex: undefined | Texture
  transform: Vector3
}

const __defaultParams: Parameters = {
  spriteTex: getTempTexture(),
  paletteTex: undefined,
  transform: new Vector3(0, 0, 1 / 2048)
}

export class SpritesPointMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uniforms: { [key: string]: Uniform } = {
      uSpriteTex: new Uniform(params.spriteTex),
      uTransform: new Uniform(params.transform),
      uAspectRatio: pixelAspectRatioUniform
    }
    const defines: { [key: string]: boolean | string | number } = {}

    if (params.paletteTex) {
      uniforms.uPaletteTex = new Uniform(params.paletteTex)
      defines.USE_PALETTE = true
    }

    super({
      uniforms,
      defines,
      vertexShader,
      fragmentShader,
      // alphaTest: 0.5,
      // transparent: true,
      depthWrite: true,
      depthTest: true
    })
  }
  set usePalette(val: boolean) {
    this.defines.USE_PALETTE = val
    this.needsUpdate = true
  }
}
