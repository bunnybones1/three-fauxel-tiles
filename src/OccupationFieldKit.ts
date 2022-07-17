import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Uniform,
  WebGLRenderer
} from 'three'

import fragmentShader2 from './occupationField.frag.glsl'
import vertexShader2 from './occupationField.vert.glsl'
import fadeFragmentShader from './fade.frag.glsl'
import fadeVertexShader from './fullclip.vert.glsl'
import RTKit from './RTKit'
import { timeFractUniform } from '../test/uniforms'

const COLOR_BLACK = new Color(0, 0, 0)

export default class OccupationFieldKit extends RTKit {
  constructor(
    edgeSize3d: number,
    pointGeo: BufferGeometry,
    positionsTextureUniform: Uniform
  ) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3))
    super(edgeSize2d, fadeVertexShader, fadeFragmentShader, {}, true)

    const points = new Points(
      pointGeo,
      new ShaderMaterial({
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        uniforms: {
          uPositionsTexture: positionsTextureUniform,
          uTimeFract: timeFractUniform
        },
        depthTest: true,
        depthWrite: true
      })
    )
    this.scene.add(points)
    this.plane.material.visible = false
    this.plane.renderOrder = -1
  }
  render(renderer: WebGLRenderer, dt: number) {
    renderer.setRenderTarget(this.outputRt)
    renderer.setClearColor(COLOR_BLACK, 1)
    renderer.clearColor()
    renderer.render(this.scene, this.camera)
    renderer.setRenderTarget(null)
  }
}
