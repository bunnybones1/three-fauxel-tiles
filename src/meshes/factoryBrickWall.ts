import { BoxBufferGeometry, Material, Mesh, Object3D } from 'three'
import { getChamferedBoxGeometry } from '../utils/geometry'

export function makeBrickWall(
  brickMat: Material,
  mortarMat: Material,
  colStart: number,
  colEnd: number
) {
  const brickWidth = 7
  const brickHeight = 3
  const brickGap = 1
  const brickSpacingX = brickWidth + brickGap
  const brickSpacingY = brickHeight
  const brickGeo = getChamferedBoxGeometry(brickWidth, brickHeight, 4.5, 1)
  const brickWallRoot = new Object3D()
  for (let iRow = 0; iRow < 11; iRow++) {
    for (let iCol = -1; iCol < 1; iCol++) {
      const budge = (iRow % 2) * 0.5 - 0.25
      const brick = new Mesh(brickGeo, brickMat)
      brick.position.set(
        (iCol + budge) * brickSpacingX + brickWidth * 0.5,
        (iRow + 0.5) * brickSpacingY,
        0
      )
      brickWallRoot.add(brick)
    }
  }
  const mortar = new Mesh(
    new BoxBufferGeometry((colEnd - colStart) * brickSpacingX - 1, 32, 1),
    mortarMat
  )
  mortar.position.x = -1
  mortar.position.y = 16
  mortar.position.z = -0.75
  brickWallRoot.add(mortar)
  return brickWallRoot
}
