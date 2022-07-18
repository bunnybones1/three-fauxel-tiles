import { Texture } from 'three'
import { removeFromArray } from '~/utils/arrayUtils'
import { getCanvasOfImageTexture } from '~/utils/threeUtils'
import { Vec2 } from '~/vendor/Box2D/Box2D'

class LinkedVert {
  active = true
  prev: LinkedVert
  next: LinkedVert
  constructor(public vert: Vec2) {
    //
  }
  isRedundant() {
    const a1 = Math.atan2(
      this.vert.y - this.prev.vert.y,
      this.vert.x - this.prev.vert.x
    )
    const a2 = Math.atan2(
      this.next.vert.y - this.vert.y,
      this.next.vert.x - this.vert.x
    )
    return a1 - a2 === 0
  }
  remove() {
    this.prev.next = this.next
    this.next.prev = this.prev
    this.active = false
  }
}

export function getAlphaEncodedBlocksFromTileMap(tileTex: Texture) {
  const tilesPixelData = getCanvasOfImageTexture(tileTex)
  const tileSize = 32

  const cols = tileTex.image.width / tileSize
  const rows = tileTex.image.height / tileSize

  const points: Vec2[][] = []

  const tileSizePadded = tileSize + 1
  for (let iY = 0; iY < tileSizePadded; iY++) {
    const row: Vec2[] = []
    points.push(row)
    for (let iX = 0; iX < tileSizePadded; iX++) {
      row.push(new Vec2(iX, tileSize - iY))
    }
  }

  const starterLinkedVertsByTile = new Map<number, LinkedVert[]>()
  for (let iRow = 0; iRow < rows; iRow++) {
    for (let iCol = 0; iCol < cols; iCol++) {
      const tileIndex = iCol + iRow * cols
      const tilePixelData = tilesPixelData.getImageData(
        iCol * tileSize,
        iRow * tileSize,
        tileSize,
        tileSize
      )

      const tilesPixelDataArr = tilePixelData.data
      const newTotal = tilesPixelDataArr.length / 4
      const tilesPixelDataAlpha = new Uint8Array(newTotal)
      for (let i = 0, i4 = 3; i < newTotal; i++, i4 += 4) {
        tilesPixelDataAlpha[i] = tilesPixelDataArr[i4]
      }
      const totalAlpha = tilesPixelDataAlpha.reduce((p, c, i) => p + c)
      if (totalAlpha > 1024 * 252) {
        const edgesByHash = new Map<string, [Vec2, Vec2]>()
        const integrateEdge = (a: Vec2, b: Vec2) => {
          const hash =
            a.x + a.y * tileSize > b.x + b.y * tileSize
              ? `${a.x},${a.y}-${b.x},${b.y}`
              : `${b.x},${b.y}-${a.x},${a.y}`
          if (edgesByHash.has(hash)) {
            edgesByHash.delete(hash)
          } else {
            edgesByHash.set(hash, [a, b])
          }
        }
        for (let iY = 0; iY < tileSize; iY++) {
          for (let iX = 0; iX < tileSize; iX++) {
            const index = iY * tileSize + iX
            if (tilesPixelDataAlpha[index] > 252) {
              const a = points[iY][iX]
              const b = points[iY][iX + 1]
              const c = points[iY + 1][iX + 1]
              const d = points[iY + 1][iX]
              integrateEdge(a, b)
              integrateEdge(b, c)
              integrateEdge(c, d)
              integrateEdge(d, a)
            }
          }
        }
        const edgeLinks = new Map<Vec2, LinkedVert>()
        const getEdge = (vert: Vec2) => {
          if (!edgeLinks.has(vert)) {
            edgeLinks.set(vert, new LinkedVert(vert))
          }
          return edgeLinks.get(vert)!
        }
        for (const edge of edgesByHash.values()) {
          const e0 = getEdge(edge[0])
          const e1 = getEdge(edge[1])
          e0.next = e1
          e1.prev = e0
        }
        const importantEdges: LinkedVert[] = []
        for (const edgeLink of edgeLinks.values()) {
          if (edgeLink.isRedundant()) {
            edgeLink.remove()
          } else {
            importantEdges.push(edgeLink)
          }
        }
        // console.log('?', importantEdges.map(el => `${el.vert.x},${el.vert.y}`))
        const uniqueStarters: LinkedVert[] = []
        while (importantEdges.length > 0) {
          const starter = importantEdges.shift()!
          let cursor = starter.next
          while (cursor !== starter) {
            removeFromArray(importantEdges, cursor)
            cursor = cursor.next
          }
          uniqueStarters.push(starter)
        }
        // console.log('!',uniqueStarters.map(el => `${el.vert.x},${el.vert.y}`))
        starterLinkedVertsByTile.set(tileIndex, uniqueStarters)
      }
    }
  }
  return starterLinkedVertsByTile
}
