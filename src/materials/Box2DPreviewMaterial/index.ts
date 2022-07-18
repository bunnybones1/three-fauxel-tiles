import { RawShaderMaterial } from 'three'

import fragmentShader from './frag.glsl'
import vertexShader from './vert.glsl'

export class Box2DPreviewMaterial extends RawShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
  }
}
