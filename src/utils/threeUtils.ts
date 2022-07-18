import {
  DataTexture,
  NearestFilter,
  RGBAFormat,
  sRGBEncoding,
  Texture,
  TextureLoader,
  UnsignedByteType
} from 'three'

let __tempTexture: DataTexture | undefined
export function getTempTexture() {
  if (!__tempTexture) {
    const s = 4
    const total = s * s * 4
    const data = new Uint8Array(total)
    for (let i = 0; i < total; i++) {
      data[i] = 0
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat, UnsignedByteType)
  }
  return __tempTexture!
}

const __randomTexture = new Map<string, DataTexture>()
export function getRandomTexture(width = 64, height = 64) {
  const resHash = `${width}x${height}`
  if (!__randomTexture.has(resHash)) {
    const total = width * height * 4
    const data = new Uint8Array(total)
    for (let i = 0; i < total; i++) {
      data[i] = ~~(Math.random() * 256)
    }
    const texture = new DataTexture(
      data,
      width,
      height,
      RGBAFormat,
      UnsignedByteType
    )
    texture.needsUpdate = true
    __randomTexture.set(resHash, texture)
  }
  return __randomTexture.get(resHash)!
}

export async function loadPixelatedTexture(path: string, flipY = true) {
  return new Promise<Texture>((resolve) => {
    const loader = new TextureLoader()
    loader.load(
      path,
      (texture) => {
        texture.encoding = sRGBEncoding
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.flipY = flipY
        resolve(texture)
      },
      undefined,
      function (err) {
        console.error('An error happened.', err.message)
      }
    )
  })
}

export function getCanvasOfImageTexture(texture: Texture) {
  const image = texture.image as ImageBitmap
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('could not get canvas context2d')
  }
  context.drawImage(image, 0, 0)
  return context
}
