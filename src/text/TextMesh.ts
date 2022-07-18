import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  Group,
  IUniform,
  Material,
  Matrix4,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector4,
  WebGLRenderer
} from 'three'
import createGeometry from 'three-bmfont-text'
import { pixelSizeInClipSpaceUniform } from '~/uniforms'
import { getHorizontalBias, getVerticalBias } from '~/utils/font'
import { PPM } from '~/utils/measurements'
import { onNextFrame } from '~/utils/onNextFrame'
import {
  listenToProperty,
  stopListeningToProperty
} from '~/utils/propertyListeners'

import FontFace from './FontFace'
import fragmentShader from './frag.glsl'
import { TextSettings, textSettings } from './TextSettings'
import vertexShader from './vert.glsl'

const DEFAULT_FONT_WEIGHT = 1.0
const DEFAULT_ITALIC_SKEW = 0.0

export interface TextSegment {
  text: string
  color: Color | Gradient | string | number
  fontWeight?: number
  italicSkew?: number
  xOffset?: number
  yOffset?: number
}

interface GradientOptions {
  topLeft?: Color | string | number
  topRight?: Color | string | number
  bottomLeft?: Color | string | number
  bottomRight?: Color | string | number
  top?: Color | string | number
  bottom?: Color | string | number
  left?: Color | string | number
  right?: Color | string | number
}

export class Gradient {
  topLeft: Color
  topRight: Color
  bottomLeft: Color
  bottomRight: Color

  constructor(options: GradientOptions) {
    Object.keys(options).forEach(
      (key: Extract<keyof GradientOptions, string>) => {
        const option = options[key]
        if (option) {
          const color = toColor(option)
          this[key] = color
        }
      }
    )
  }

  set top(value: Color | number | string) {
    this.topLeft = toColor(value)
    this.topRight = toColor(value)
  }

  set bottom(value: Color | number | string) {
    this.bottomLeft = toColor(value)
    this.bottomRight = toColor(value)
  }

  set left(value: Color | number | string) {
    this.topLeft = toColor(value)
    this.bottomLeft = toColor(value)
  }

  set right(value: Color | number | string) {
    this.topRight = toColor(value)
    this.bottomRight = toColor(value)
  }
}

export const reduceTextSegments = (text: string | TextSegment[]) =>
  Array.isArray(text)
    ? text.reduce((acc, segment) => {
        return acc.concat(segment.text)
      }, '')
    : String(text)

const __mat = new Matrix4()

const trackedFontFaceTextures: Texture[] = []
function getFontFaceSubOrder(texture?: Texture) {
  if (!texture) {
    return -1
  }
  const index = trackedFontFaceTextures.indexOf(texture)
  if (index === -1) {
    trackedFontFaceTextures.push(texture)
    return trackedFontFaceTextures.length - 1
  } else {
    return index
  }
}

export default class TextMesh extends Mesh {
  settings: TextSettings
  onMeasurementsUpdated?: (mesh: TextMesh) => void

  width: number
  height: number

  dirty: boolean
  livePropObject?: object
  livePropName?: string
  optimizeRenderOrder: boolean

  material: ShaderMaterial

  private _text: string | TextSegment[]
  private _globalColor: Color | Gradient
  private _fontFace: FontFace
  private newTexture?: Texture

  constructor(
    text: string | TextSegment[] = '',
    settings: TextSettings = textSettings.generic,
    livePropObject?: any,
    livePropName?: string,
    onMeasurementsUpdated?: (mesh: TextMesh) => void,
    optimizeRenderOrder = true
  ) {
    super(tryCreateTextGeometry(text, settings), initMaterial(settings))

    this.onMeasurementsUpdated = onMeasurementsUpdated
    this.optimizeRenderOrder = optimizeRenderOrder

    listenToProperty(settings, 'fontFace', this.onFontFaceChange, true)

    this._text = text
    this.updateMeasurements()

    this.userData.isFrontFacing = true
    this.userData.doNotBillboard = true

    this.settings = settings

    this.livePropObject = livePropObject
    this.livePropName = livePropName
    this.frustumCulled = false
  }

  set text(text: string | TextSegment[]) {
    if (typeof text === 'number') {
      text = String(text)
    }

    if (this._text !== text) {
      this._text = text
      this.dirty = true
    }
  }

  set color(value: Color | Gradient | string | number) {
    if (typeof value !== 'object') {
      value = toColor(value)
    }

    this._globalColor = value

    const { topLeft, topRight, bottomLeft, bottomRight } = toVertexColors(value)
    const colorBufferAttribute = (this.geometry as BufferGeometry).getAttribute(
      'color'
    ) as BufferAttribute

    if (colorBufferAttribute) {
      const colors = colorBufferAttribute.array as Float32Array

      for (let i = 0; i < colors.length; i += 12) {
        colors.set(topLeft, i + 0)
        colors.set(bottomLeft, i + 3)
        colors.set(bottomRight, i + 6)
        colors.set(topRight, i + 9)
      }

      colorBufferAttribute.needsUpdate = true
    }
  }

  set strokeWidth(value: number) {
    const mat = this.material as ShaderMaterial
    if (mat.uniforms.strokeWidth.value !== value) {
      mat.uniforms.strokeWidth.value = value
      const needsStrokeShader = value > 0
      if (needsStrokeShader !== mat.defines.USE_STROKE) {
        mat.defines.USE_STROKE = needsStrokeShader
        mat.needsUpdate = true
      }
    }
  }

  get opacity() {
    return (this.material as ShaderMaterial).uniforms.opacity.value
  }

  set opacity(value: number) {
    const m = this.material as ShaderMaterial
    m.uniforms.opacity.value = value
  }

  onFontFaceChange = (newFontFace: FontFace, oldFontFace: FontFace) => {
    if (oldFontFace) {
      stopListeningToProperty(
        oldFontFace,
        'msdfTexture',
        this.onFontTextureUpdate
      )
      stopListeningToProperty(oldFontFace, 'font', this.onFontUpdate)
    }
    listenToProperty(newFontFace, 'msdfTexture', this.onFontTextureUpdate)
    listenToProperty(newFontFace, 'font', this.onFontUpdate)

    newFontFace.init()
    this._fontFace = newFontFace
  }

  onFontTextureUpdate = (texture: Texture) => {
    this.newTexture = texture
    this.dirty = true
  }

  onFontUpdate = (font: BMFont) => {
    this.dirty = true
  }

  onBeforeRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    if (this.settings.screenSpace) {
      const clipPos = this.material.uniforms.clipSpacePosition.value as Vector4
      __mat
        .multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld)
        .premultiply(camera.projectionMatrix) //.multiply(camera.projectionMatrix)
      clipPos.set(0, 0, 0, 1).applyMatrix4(__mat)
    }
    if (this.dirty) {
      this.dirty = false
      this.regenerateGeometry()
      if (this.newTexture) {
        if (this.optimizeRenderOrder) {
          this.renderOrder =
            this.renderOrder || 100 + getFontFaceSubOrder(this.newTexture)
        }
        const m = this.material as ShaderMaterial
        m.uniforms.msdf.value = this.newTexture
        this.newTexture = undefined
      }
    }
  }

  updateText = (value: any = '') => {
    this.text = `${value}`
  }

  onAdd() {
    if (this.livePropObject && this.livePropName) {
      listenToProperty(
        this.livePropObject,
        this.livePropName,
        this.updateText,
        true
      )
    }
  }

  onRemove() {
    stopListeningToProperty(this.settings, 'fontFace', this.onFontFaceChange)
    if (this.livePropObject && this.livePropName) {
      stopListeningToProperty(
        this.livePropObject,
        this.livePropName,
        this.updateText
      )
    }
    if (this._fontFace) {
      stopListeningToProperty(
        this._fontFace,
        'msdfTexture',
        this.onFontTextureUpdate
      )
      stopListeningToProperty(this._fontFace, 'font', this.onFontUpdate)
    }
  }

  setSize(width: number, height: number) {
    //
  }

  private regenerateGeometry() {
    if (this.geometry && this.geometry !== tempBlankGeo) {
      onNextFrame(() => this.geometry.dispose())
    }
    this.geometry = tryCreateTextGeometry(
      this._text,
      this.settings,
      this._globalColor
    )

    this.updateMeasurements()
  }

  private updateMeasurements() {
    const bb = this.geometry.boundingBox!
    this.width = bb.max.x - bb.min.x
    this.height = Math.abs(bb.max.y - bb.min.y)
    this.userData.resolution = new Vector2(this.width, this.height)
    if (this.onMeasurementsUpdated) {
      this.onMeasurementsUpdated(this)
    }
  }
}

interface MSDFShaderUniforms {
  msdf: IUniform<Texture>
  alphaTest: IUniform<number>
  strokeWidth: IUniform<number>
  strokeBias: IUniform<number>
  strokeColor: IUniform<Color>
  opacity: IUniform<number>
  clipSpacePosition?: IUniform<Vector4>
  pixelSizeInClipSpace?: IUniform<Vector2>
  offset?: IUniform<Vector2>
  prescale?: IUniform<number>
}

const initMaterial = (settings: TextSettings) => {
  const uniforms = {
    msdf: new Uniform(settings.fontFace.msdfTexture),
    alphaTest: new Uniform(settings.alphaTest),
    strokeWidth: new Uniform(settings.strokeWidth),
    strokeBias: new Uniform(settings.strokeBias),
    strokeColor: new Uniform(new Color(settings.strokeColor)),
    opacity: new Uniform(1.0)
  }
  const safeUniforms: MSDFShaderUniforms = uniforms

  if (settings.screenSpace) {
    safeUniforms.offset = new Uniform(settings.offset)
    safeUniforms.clipSpacePosition = new Uniform(new Vector4())
    safeUniforms.pixelSizeInClipSpace = pixelSizeInClipSpaceUniform
    safeUniforms.prescale = new Uniform(settings.prescale)
  }

  const hardText =
    settings.alphaTest > 0 && settings.alphaTest < 1 && !settings.shadow
  const material = new ShaderMaterial({
    defines: {
      USE_STROKE: settings.strokeWidth > 0,
      USE_ALPHATEST: hardText,
      USE_SHADOW: settings.shadow,
      USE_SCREENSPACE: settings.screenSpace,
      CONSTANT_SIZE_ON_SCREEN: settings.constantSizeOnScreen
    },
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: hardText
  })

  Object.defineProperty(material, 'opacity', {
    get: () => material.uniforms.opacity.value,
    set: (value: number) => (material.uniforms.opacity.value = value)
  })

  return material
}

const tempBlankGeo = new PlaneBufferGeometry(0.001, 0.001)
tempBlankGeo.computeBoundingBox()

const tryCreateTextGeometry = (
  text: string | TextSegment[],
  settings: TextSettings,
  overrideColor?: Color | Gradient
): BufferGeometry => {
  if (settings.fontFace.font && text) {
    return createTextGeometry(text, settings, overrideColor)
  } else {
    return tempBlankGeo
  }
}

const createTextGeometry = (
  text: string | TextSegment[],
  settings: TextSettings,
  overrideColor?: Color | Gradient
): BufferGeometry => {
  const font = settings.fontFace.font!
  const textStr = reduceTextSegments(text)
  const geometry = createGeometry({
    text: `${textStr}`,
    font,
    align: settings.align,
    width:
      settings.width !== undefined
        ? (settings.width / settings.size) * font.info.size
        : undefined,
    lineHeight:
      settings.lineHeight !== undefined
        ? settings.lineHeight * font.info.size
        : undefined,
    letterSpacing: settings.letterSpacing
  })
  const positions = geometry.getAttribute('position').array as Float32Array
  const vertCount = positions.length / 2
  //const charCount = vertCount / 4
  const defaultColor = toGradient(overrideColor || settings.color)
  const segments: TextSegment[] = Array.isArray(text)
    ? text
    : [
        {
          text: textStr,
          color: defaultColor
        }
      ]
  const { base } = font.common
  const colors = new Float32Array(vertCount * 3)
  const weights = new Float32Array(vertCount)

  let charIdx = 0

  segments.forEach((segment) => {
    const { topLeft, topRight, bottomLeft, bottomRight } = toVertexColors(
      segment.color
    )
    const fontWeight = segment.fontWeight || DEFAULT_FONT_WEIGHT
    const italicSkew = segment.italicSkew || DEFAULT_ITALIC_SKEW
    const xOffset = segment.xOffset || 0
    const yOffset = segment.yOffset || 0
    const stripped = segment.text.replace(/\s+/g, '')
    const start = charIdx
    const end = charIdx + stripped.length

    for (let i = start; i < end; i++) {
      const colorIdx = i * 12
      const weightIdx = i * 4
      const vertIdx = weightIdx * 2
      const char = stripped[i - charIdx]
      const charMeta = font.chars.find((x) => String(x.char) === char)!

      // Color gradient
      colors.set(topLeft, colorIdx + 0)
      colors.set(bottomLeft, colorIdx + 3)
      colors.set(bottomRight, colorIdx + 6)
      colors.set(topRight, colorIdx + 9)

      // Weight - need to adjust position to account for additional font width weighting applies.
      weights[weightIdx + 0] = fontWeight
      weights[weightIdx + 1] = fontWeight
      weights[weightIdx + 2] = fontWeight
      weights[weightIdx + 3] = fontWeight

      // Italics skew - adjust the position geometry attribute directly to save calculations in shader
      const skew = base * italicSkew
      const descender = charMeta.height + charMeta.yoffset - base
      const italicSkewForward = ((base - charMeta.yoffset) / base) * skew
      const italicSkewBack = descender > 0 ? (descender / base) * -skew : 0.0

      // Top verts
      positions[vertIdx + 0] += italicSkewForward
      positions[vertIdx + 6] += italicSkewForward

      //Bottom verts
      positions[vertIdx + 2] += italicSkewBack
      positions[vertIdx + 4] += italicSkewBack

      // Add Offsets
      positions[vertIdx + 0] += xOffset
      positions[vertIdx + 1] += yOffset
      positions[vertIdx + 2] += xOffset
      positions[vertIdx + 3] += yOffset
      positions[vertIdx + 4] += xOffset
      positions[vertIdx + 5] += yOffset
      positions[vertIdx + 6] += xOffset
      positions[vertIdx + 7] += yOffset
    }

    charIdx = end
  })

  geometry.addAttribute('color', new BufferAttribute(colors, 3))
  geometry.addAttribute('weight', new BufferAttribute(weights, 1))

  const x = settings.bakedOffset ? settings.bakedOffset.x : 0
  const y = settings.bakedOffset ? settings.bakedOffset.y : 0

  geometry.computeBoundingBox()
  const bb = geometry.boundingBox!
  if (settings.width) {
    const layoutWidth = geometry.layout.width
    bb.max.x = layoutWidth - bb.min.x
  }
  const bbMin = bb.min
  const bbMax = bb.max

  const posAttr = geometry.attributes.position
  const itemSize = posAttr.itemSize

  const posArr: Float32Array = posAttr.array as Float32Array

  if (text === '1') {
    for (let i = 0; i < posArr.length; i += itemSize) {
      posArr[i] -= 2
    }
  }

  //alignment according to glyph layout
  const bbWidth = bbMax.x - bbMin.x
  const lo = geometry.layout
  const charsHeight = (lo._linesTotal - 1) * lo.lineHeight + lo.capHeight
  const xOffset = x + bbWidth * getHorizontalBias(settings.align) - bbMin.x
  // const yOffset = lo.capHeight
  const yOffset = y + charsHeight * getVerticalBias(settings.vAlign)
  for (let i = 0; i < posArr.length; i += itemSize) {
    posArr[i] += xOffset
    posArr[i + 1] += yOffset
  }
  //always do same transforms to bounding box min and max. much cheaper than recalculating bounding box
  bbMax.x += xOffset
  bbMin.x += xOffset
  bbMax.y += yOffset
  bbMin.y += yOffset

  //flip on Y to fix winding order and orientation from TOP-LEFT paradigm (like canvas or photoshop)
  for (let i = 1; i < posArr.length; i += itemSize) {
    posArr[i] *= -1
  }
  //always do same transforms to bounding box min and max. much cheaper than recalculating bounding box
  bbMin.y *= -1
  bbMax.y *= -1

  let scale = settings.size / font.info.size
  if (settings.scaleDownToPhysicalSize) {
    scale /= PPM
  }
  //scale down to the correct font point size as it would be printed at 72 ppi
  for (let i = 0; i < posArr.length; i++) {
    posArr[i] *= scale
  }
  //always do same transforms to bounding box min and max. much cheaper than recalculating bounding box
  bbMin.multiplyScalar(scale)
  bbMax.multiplyScalar(scale)

  if (bbMin.y > bbMax.y) {
    const temp = bbMin.y
    bbMin.y = bbMax.y
    bbMax.y = temp
  }

  return geometry
}

const toColor = (value: Color | string | number) =>
  value instanceof Color ? value : new Color(value)

const toGradient = (value: Color | Gradient | string | number) =>
  value instanceof Gradient
    ? value
    : new Gradient({ top: value, bottom: value })

const toVertexColors = (value: Gradient | Color | number | string) => {
  value = toGradient(value || 0xffffff)

  return {
    topLeft: value.topLeft.toArray(),
    topRight: value.topRight.toArray(),
    bottomLeft: value.bottomLeft.toArray(),
    bottomRight: value.bottomRight.toArray()
  }
}
