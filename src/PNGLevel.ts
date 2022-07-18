import { Color } from 'three'

class BlocksRecipes {
  private blocks = new Map<
    number,
    Map<number, Map<number, Map<number, number>>>
  >()
  register(
    x: number,
    y: number,
    width: number,
    height: number,
    colour: number
  ) {
    if (!this.blocks.has(x)) {
      this.blocks.set(x, new Map())
    }
    const blocksX = this.blocks.get(x)!
    if (!blocksX.has(colour)) {
      blocksX.set(colour, new Map())
    }

    const blocksColour = blocksX.get(colour)!
    if (!blocksColour.has(width)) {
      blocksColour.set(width, new Map())
    }

    const blocksWidth = blocksColour.get(width)!
    let merged = false
    for (const [key, value] of blocksWidth.entries()) {
      if (key + value === y) {
        blocksWidth.set(key, value + 1)
        merged = true
      }
    }
    if (!merged) {
      blocksWidth.set(y, height)
    }
  }
  process(
    cb: (
      x: number,
      y: number,
      width: number,
      height: number,
      colour: number
    ) => void
  ) {
    this.blocks.forEach((blocksX, x) => {
      blocksX.forEach((blocksColour, colour) => {
        blocksColour.forEach((blocksWidth, width) => {
          blocksWidth.forEach((height, y) => {
            cb(x, y, width, height, colour)
          })
        })
      })
    })
  }
}

export default class PNGLevel {
  constructor(
    baseName: string,
    blockProcessor: (
      x: number,
      y: number,
      width: number,
      height: number,
      colour: number
    ) => void,
    onReady?: () => void,
    onError?: () => void
  ) {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = (imageEvent) => {
      const blockRecipes = new BlocksRecipes()
      const canvas = document.createElement('canvas')
      const width = img.width
      const height = img.height
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')!
      context.drawImage(img, 0, 0, width, height)
      const data = context.getImageData(0, 0, width, height).data
      let accumilator = 0
      const colour = new Color()
      const nextColour = new Color()
      function extractColour(c: Color, i: number) {
        c.r = data[i * 4 + 0] / 255
        c.g = data[i * 4 + 1] / 255
        c.b = data[i * 4 + 2] / 255
      }
      const totalPixels = width * height
      for (let i = 0; i < totalPixels; i++) {
        extractColour(colour, i)
        const opaque = data[i * 4 + 3] > 128

        const j = i + 1
        extractColour(nextColour, j)
        const nextOpaque = data[j * 4 + 3] > 128

        let build = false

        if (opaque) {
          accumilator++
          if (!colour.equals(nextColour)) {
            build = true
          }
          if (opaque !== nextOpaque) {
            build = true
          }
        } else {
          build = true
        }
        if (j % width === 0) {
          build = true
        }
        if (build && accumilator > 0) {
          const iCol = i % width
          const iRow = Math.floor(i / width)
          blockRecipes.register(iCol, iRow, accumilator, 1, colour.getHex())
          accumilator = 0
        }
      }
      blockRecipes.process(blockProcessor)
      if (onReady) {
        onReady()
      }
    }
    img.onerror = (errorEvent) => {
      console.error('image not found: ' + errorEvent)
    }
    img.src = `game/levels/${baseName}.png`
  }
}
