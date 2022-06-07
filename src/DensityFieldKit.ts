import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Uniform,
  WebGLRenderer
} from 'three'

import fragmentShader2 from './densityField.frag.glsl'
import vertexShader2 from './densityField.vert.glsl'
import fadeFragmentShader from './fade.frag.glsl'
import fadeVertexShader from './fullclip.vert.glsl'
import RTKit from './RTKit'

const COLOR_BLACK = new Color(0, 0, 0)

export default class DensityFieldKit extends RTKit {
  constructor(
    edgeSize3d: number,
    pointGeo: BufferGeometry,
    positionsTextureUniform: Uniform
  ) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3))
    super(edgeSize2d, fadeVertexShader, fadeFragmentShader, {})

    const points = new Points(
      pointGeo,
      new ShaderMaterial({
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        uniforms: {
          uPositionsTexture: positionsTextureUniform
        },
        depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending
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
