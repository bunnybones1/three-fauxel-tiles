import { PCFShadowMap, sRGBEncoding, WebGLRenderer } from 'three'
import { RESET_USER_SETTINGS_TO_DEFAULTS } from '~/constants'

import device from './device'
import {
  devicePixelRatioUniform,
  pixelSizeInClipSpaceUniform
} from './uniforms'
import { NiceParameter } from './utils/NiceParameter'

const canvas = document.createElement('canvas')
const context = canvas.getContext('webgl2', {
  alpha: false,
  antialias: false,
  premultipliedAlpha: false,
  powerPreference: 'high-performance'
}) as WebGL2RenderingContext
const renderer = new WebGLRenderer({
  canvas,
  context,
  antialias: false,
  premultipliedAlpha: false,
  powerPreference: 'high-performance'
  // powerPreference: "low-power"
})
document.body.append(canvas)
const attributeValues: string[] = [
  '-moz-crisp-edges',
  '-webkit-crisp-edges',
  'pixelated',
  'crisp-edges'
]

attributeValues.forEach((v) => {
  const canvas = renderer.getContext().canvas
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.setProperty('image-rendering', v)
  }
})
renderer.shadowMap.enabled = false
renderer.shadowMap.type = PCFShadowMap
renderer.outputEncoding = sRGBEncoding
// renderer.gammaOutput = true
// renderer.gammaFactor = 2.2
renderer.autoClear = false

const downsample = new NiceParameter(
  'pixel-down-sample',
  'Graphics Quality',
  6,
  0,
  10,
  (v) => v,
  (v) => v + '',
  true,
  RESET_USER_SETTINGS_TO_DEFAULTS,
  1
)

let __downsample = 1
function updatePixelRatio() {
  const pixelRatio = device.pixelRatio / __downsample
  devicePixelRatioUniform.value = pixelRatio
  renderer.setPixelRatio(pixelRatio)
}

downsample.listen((downsample) => {
  __downsample = Math.round(downsample + 1)
  updatePixelRatio()
})

device.onChange(() => {
  updatePixelRatio()
  const { width, height } = device
  renderer.setSize(width, height)
  devicePixelRatioUniform.value = device.pixelRatio
  pixelSizeInClipSpaceUniform.value.set(2 / width, 2 / height)
}, true)
export const maxTextureSize = Math.min(
  8192,
  renderer.capabilities.maxTextureSize
)

export default renderer
