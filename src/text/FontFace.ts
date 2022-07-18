import { LinearFilter, Texture } from 'three'
import { loadJson, loadTexture } from '~/loaders/assetLoader'

function url(name: string, ext: string) {
  return `fonts/${name}.${ext}`
}
export default class FontFace {
  font?: BMFont
  msdfTexture?: Texture
  private name: string
  private initd: boolean
  constructor(name: string) {
    this.name = name
  }
  async init() {
    if (this.initd) {
      return
    }
    this.initd = true

    this.msdfTexture = await loadTexture(url(this.name, 'png'))
    this.msdfTexture.minFilter = LinearFilter
    this.msdfTexture.magFilter = LinearFilter

    this.font = (await loadJson(url(this.name, 'json'))) as BMFont
  }
}

export const fontFaces = {
  CourierPrimeRegular: new FontFace('CourierPrime-Regular'),
  CourierPrimeBold: new FontFace('CourierPrime-Bold'),
  GothicA1Black: new FontFace('GothicA1-Black'),
  GothicA1Bold: new FontFace('GothicA1-Bold'),
  GothicA1ExtraBold: new FontFace('GothicA1-ExtraBold'),
  GothicA1ExtraLight: new FontFace('GothicA1-ExtraLight'),
  GothicA1Light: new FontFace('GothicA1-Light'),
  GothicA1Medium: new FontFace('GothicA1-Medium'),
  GothicA1Regular: new FontFace('GothicA1-Regular'),
  GothicA1SemiBold: new FontFace('GothicA1-SemiBold'),
  GothicA1Thin: new FontFace('GothicA1-Thin')
}
