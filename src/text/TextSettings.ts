import { Color, Vector2 } from 'three'
import { COLOR_BLACK, COLOR_WHITE } from '~/utils/colorLibrary'

import FontFace, { fontFaces } from './FontFace'
import { textLayouts } from './TextLayout'
import { Gradient } from './TextMesh'

export interface TextSettings {
  fontFace: FontFace
  size: number
  align: 'left' | 'center' | 'right'
  vAlign: 'top' | 'center' | 'bottom'
  width?: number
  lineHeight?: number
  letterSpacing: number
  color: Color | Gradient | string | number
  strokeWidth: number
  strokeBias: number
  strokeColor: Color | string | number
  alphaTest: number
  scaleDownToPhysicalSize: boolean
  shadow: boolean
  screenSpace: boolean
  constantSizeOnScreen?: boolean
  offset?: Vector2
  bakedOffset?: Vector2
  prescale?: number
}

const generic: TextSettings = {
  fontFace: fontFaces.GothicA1Regular,
  size: 24,
  align: 'center',
  vAlign: 'center',
  letterSpacing: 0,
  color: COLOR_WHITE,
  strokeWidth: 0,
  strokeBias: 1.0,
  alphaTest: 0,
  strokeColor: COLOR_BLACK,
  scaleDownToPhysicalSize: true,
  shadow: false,
  screenSpace: false,
  constantSizeOnScreen: false,
  prescale: 1
}
const title: TextSettings = {
  ...generic,
  ...textLayouts.title,
  lineHeight: 1.175,
  size: 72,
  color: 0xd2d0b8,
  strokeWidth: 0.5,
  strokeBias: 0.5,
  strokeColor: 0x2c3a49,
  fontFace: fontFaces.GothicA1ExtraBold
}
const keyLabel: TextSettings = {
  ...generic,
  lineHeight: 1.175,
  size: 24,
  color: COLOR_BLACK,
  fontFace: fontFaces.GothicA1Regular
}
const keyLabelDouble: TextSettings = {
  ...keyLabel,
  lineHeight: 1.2,
  fontFace: fontFaces.GothicA1Bold,
  size: 14
}
const keyLabelSmall: TextSettings = {
  ...keyLabel,
  fontFace: fontFaces.GothicA1Bold,
  size: 10
}
const code: TextSettings = {
  ...generic,
  align: 'left',
  fontFace: fontFaces.CourierPrimeRegular,
  size: 32
}

export const textSettings = {
  generic,
  title,
  keyLabel,
  keyLabelDouble,
  keyLabelSmall,
  code
}
