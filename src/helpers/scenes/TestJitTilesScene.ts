import {
  DataTexture,
  Mesh,
  NearestFilter,
  PlaneGeometry,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
  UVMapping,
  Vector3,
  WebGLRenderer
} from 'three'
import { getMouseBoundViewTransform } from '~/helpers/viewTransformMouse'
import { BasicFullScreenMaterial } from '~/materials/BasicFullScreenMaterial'

import { BaseTestScene } from './BaseTestScene'
import JITTileSampler from './tileMaker/JITTileSampler'
import TileMaker from './tileMaker/TileMaker'

export default class TestJitTilesScene extends BaseTestScene {
  protected _transform: Vector3
  private _tileMaker = new TileMaker()
  constructor() {
    super()

    const scene = this.scene
    const tileMaker = this._tileMaker
    const transform = getMouseBoundViewTransform()
    const tileTex = this._tileMaker.getTexture('customColor')
    async function initMapRenderer() {
      const width = 64
      const height = 64
      const totalTiles = width * height
      const data = new Uint8Array(width * height * 4)

      const jitTileSampler = new JITTileSampler(tileMaker, width, height)
      for (let i = 0; i < totalTiles; i++) {
        const i4 = i * 4
        const sample = jitTileSampler.sampleVis(i % width, ~~(i / width))

        const indexBottomX = (sample.idBottom * 8) % 256
        const indexBottomY = ~~(sample.idBottom / 32) * 8
        const indexTopX = (sample.idTop * 8) % 256
        const indexTopY = ~~(sample.idTop / 32) * 8
        data[i4] = indexBottomX
        data[i4 + 1] = indexBottomY
        data[i4 + 2] = indexTopX
        data[i4 + 3] = indexTopY
        // data[i4] = ~~rand2(0, 255)
        // data[i4+1] = ~~rand2(0, 255)
        // data[i4+2] = ~~rand2(0, 255)
        // data[i4+3] = ~~rand2(0, 255)
        // const testSrt = visualProperties[0].toString(16)
      }

      const mapTex = new DataTexture(
        data,
        width,
        height,
        RGBAFormat,
        UnsignedByteType,
        UVMapping,
        RepeatWrapping,
        RepeatWrapping,
        NearestFilter,
        NearestFilter
      )
      mapTex.needsUpdate = true

      const material = new BasicFullScreenMaterial({
        mapTex,
        tileTex,
        transform
      })

      const mapPreview = new Mesh(new PlaneGeometry(2, 2, 1, 1), material)
      scene.add(mapPreview)
    }
    initMapRenderer()
    this._transform = transform
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    this._tileMaker.render(renderer)
    super.render(renderer, dt)
  }
}
