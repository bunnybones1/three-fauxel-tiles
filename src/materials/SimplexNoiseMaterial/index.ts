import { Color, DoubleSide, RawShaderMaterial, Uniform, Vector4 } from 'three'
import { buildParameters } from '~/utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  mode: 'normals' | 'simple'
  uvST: Vector4
  color: Color
}

const __defaultParams: Parameters = {
  mode: 'normals',
  uvST: new Vector4(0.2, 0.2, 0, 0),
  color: new Color(1, 1, 1)
}

export class SimplexNoiseMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uUvST = new Uniform(params.uvST)
    const uColor = new Uniform(params.color)
    const uniforms = {
      uUvST,
      uColor
    }
    const defines: { [key: string]: boolean | string | number } = {
      MODE_NORMALS: params.mode === 'normals'
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
