import { DoubleSide, RawShaderMaterial, Uniform, Vector4 } from 'three'
import { buildParameters } from '../../utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  data: Vector4
  heightChannel: 'r' | 'g' | 'b'
  wireframe?: boolean
  visible?: boolean
}

const __defaultParams: Parameters = {
  data: new Vector4(0.5, 0.5, 0.5, 0.5),
  heightChannel: 'b',
  wireframe: false,
  visible: true
}

export class HeightMeshMaterial extends RawShaderMaterial {
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uniforms = {
      color: new Uniform(params.data)
    }
    const defines = {
      HEIGHT_CHANNEL: params.heightChannel
    }

    super({
      uniforms,
      defines,
      vertexShader,
      fragmentShader,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      wireframe: params.wireframe,
      visible: params.visible
    })
  }
}
