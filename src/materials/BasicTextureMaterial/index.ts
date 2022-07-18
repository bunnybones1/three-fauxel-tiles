import { DoubleSide, RawShaderMaterial, Texture, Uniform, Vector4 } from 'three'
import { buildParameters } from '~/utils/jsUtils'
import { getTempTexture } from '~/utils/threeUtils'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

interface Parameters {
  uvST: Vector4
  texture: Texture
  clipspaceMode: boolean
}

const __defaultParams: Parameters = {
  uvST: new Vector4(1, 1, 0, 0),
  texture: getTempTexture(),
  clipspaceMode: false
}

export class BasicTextureMaterial extends RawShaderMaterial {
  public get texture(): Texture {
    return this._uTexture.value
  }
  public set texture(value: Texture) {
    this._uTexture.value = value
  }
  private _uTexture: Uniform
  constructor(options: Partial<Parameters> = {}) {
    const params = buildParameters(__defaultParams, options)
    const uUvST = new Uniform(params.uvST)
    const uTexture = new Uniform(params.texture)
    const uniforms = {
      uUvST,
      uTexture
    }
    const defines: { [key: string]: boolean | string | number } = {
      CLIPSPACE_MODE: params.clipspaceMode
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
    this._uTexture = uTexture
  }
}
