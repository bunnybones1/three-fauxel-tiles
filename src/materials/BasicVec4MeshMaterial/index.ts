import { DoubleSide, RawShaderMaterial, Uniform, Vector4 } from 'three'
import { buildParameters } from '~/utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  data: Vector4
  wireframe?: boolean
  vertexColors?: boolean
}

const __defaultParams: Parameters = {
  data: new Vector4(0.5, 0.5, 0.5, 0.5)
}

export default class BasicVec4MeshMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uniforms = {
      color: new Uniform(params.data)
    }

    const defines = {} as any
    if (params.vertexColors) {
      defines.USE_VERTEX_COLOR = true
    }

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
      wireframe: params.wireframe || false
    })
  }
}
