import { DoubleSide, Matrix3, RawShaderMaterial, Uniform } from 'three'
import { buildParameters } from '../../utils/jsUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  wireframe?: boolean
  visible?: boolean
}

const __defaultParams: Parameters = {
  wireframe: false,
  visible: true
}

export class WorldNormalMeshMaterial extends RawShaderMaterial {
  modelNormalMatrix: Matrix3
  constructor(options: Partial<Parameters> = {}) {
    const modelNormalMatrix = new Matrix3()
    modelNormalMatrix.elements[0] = Math.random()
    modelNormalMatrix.elements[1] = Math.random()
    modelNormalMatrix.elements[2] = Math.random()
    modelNormalMatrix.elements[3] = Math.random()
    modelNormalMatrix.elements[4] = Math.random()
    const params = buildParameters(__defaultParams, options)
    const uniforms = {
      uModelNormalMatrix: new Uniform(modelNormalMatrix)
    }
    super({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      wireframe: params.wireframe,
      visible: params.visible
    })
    this.modelNormalMatrix = this.uniforms.uModelNormalMatrix.value
  }
}
