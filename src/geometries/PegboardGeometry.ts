import { BufferAttribute, BufferGeometry, Vector2, Vector3 } from 'three'
import { lerp, rand, rand2, unlerp } from '../utils/math'
import { TILES } from '../helpers/utils/tilesEnum'

const __tileIndexOffsetLookup = {
  x: [
    [0.25, 0],
    [0.25, -0.25]
  ],
  y: [
    [-0.25, -0.25],
    [-0.25, 0]
  ],
  z: [
    [-0.25, 0.25],
    [0.25, 0.25]
  ]
}

const __tileIdAtlasOffsets = [
  [0, 0], // EMPTY
  [0, 0], // STONE
  [2 / 32, 0], // DIRT
  [4 / 32, 0], // GRASSYDIRT
  [6 / 32, 0], // SAND
  [1 / 32, 24 / 288], // SNOW
  [3 / 32, 24 / 288], // CLAY
  [5 / 32, 24 / 288], // PURPLE
  [0, 48 / 288], // BRICKS
  [2 / 32, 48 / 288], // PLAYERHEAD
  [4 / 32, 48 / 288], // PLAYERBODY
  [6 / 32, 48 / 288], // ICYSTONE
  [1 / 32, 72 / 288], // WATER
  [3 / 32, 72 / 288], // STONECORNER
  [5 / 32, 72 / 288], // BALL
  [7 / 32, 72 / 288], // DIRTINTERNAL
  [0, 96 / 288], // STONEUNDERDIRT
  [2 / 32, 96 / 288], // DIRTUNDERSTONE
  [4 / 32, 96 / 288], // SHRUBDRIED
  [6 / 32, 96 / 288], // GRAVEHEADSTONE
  [8 / 32, 96 / 288], // STONEINTERNAL
  [10 / 32, 96 / 288], // WATERINTERNAL
  // [1 / 32, 120 / 288], //
  // [3 / 32, 120 / 288], //
  // [5 / 32, 120 / 288], //
  //
  [8 / 32, 48 / 288], // STONEBIG_WSU,
  [9 / 32, 40 / 288], // STONEBIG_CSU,
  [10 / 32, 32 / 288], // STONEBIG_ESU,
  [8 / 32, 32 / 288], // STONEBIG_WSC,
  [9 / 32, 24 / 288], // STONEBIG_CSC,
  [10 / 32, 16 / 288], // STONEBIG_ESC,
  [8 / 32, 16 / 288], // STONEBIG_WSD,
  [9 / 32, 8 / 288], // STONEBIG_CSD,
  [10 / 32, 0 / 288], // STONEBIG_ESD,
  //
  [11 / 32, 40 / 288], // STONEBIG_ECU,
  [12 / 32, 48 / 288], // STONEBIG_ENU,
  [11 / 32, 24 / 288], // STONEBIG_ECC,
  [12 / 32, 32 / 288], // STONEBIG_ENC,
  [11 / 32, 8 / 288], // STONEBIG_ECD,
  [12 / 32, 16 / 288], // STONEBIG_END,
  //
  [9 / 32, 56 / 288], // STONEBIG_WCU,
  [10 / 32, 64 / 288], // STONEBIG_WNU,
  [10 / 32, 48 / 288], // STONEBIG_CCU,
  [11 / 32, 56 / 288], // STONEBIG_CNU,
  //
  [14 / 32, 48 / 288], // DIRTBIG_WSU,
  [15 / 32, 40 / 288], // DIRTBIG_CSU,
  [16 / 32, 32 / 288], // DIRTBIG_ESU,
  [14 / 32, 32 / 288], // DIRTBIG_WSC,
  [15 / 32, 24 / 288], // DIRTBIG_CSC,
  [16 / 32, 16 / 288], // DIRTBIG_ESC,
  [14 / 32, 16 / 288], // DIRTBIG_WSD,
  [15 / 32, 8 / 288], // DIRTBIG_CSD,
  [16 / 32, 0 / 288], // DIRTBIG_ESD,
  //
  [17 / 32, 40 / 288], // DIRTBIG_ECU,
  [18 / 32, 48 / 288], // DIRTBIG_ENU,
  [17 / 32, 24 / 288], // DIRTBIG_ECC,
  [18 / 32, 32 / 288], // DIRTBIG_ENC,
  [17 / 32, 8 / 288], // DIRTBIG_ECD,
  [18 / 32, 16 / 288], // DIRTBIG_END,
  //
  [15 / 32, 56 / 288], // DIRTBIG_WCU,
  [16 / 32, 64 / 288], // DIRTBIG_WNU,
  [16 / 32, 48 / 288], // DIRTBIG_CCU,
  [17 / 32, 56 / 288], // DIRTBIG_CNU,
  //
  [20 / 32, 48 / 288], // GRASSYDIRTBIG_WSU,
  [21 / 32, 40 / 288], // GRASSYDIRTBIG_CSU,
  [22 / 32, 32 / 288], // GRASSYDIRTBIG_ESU,
  [20 / 32, 32 / 288], // GRASSYDIRTBIG_WSC,
  [21 / 32, 24 / 288], // GRASSYDIRTBIG_CSC,
  [22 / 32, 16 / 288], // GRASSYDIRTBIG_ESC,
  [20 / 32, 16 / 288], // GRASSYDIRTBIG_WSD,
  [21 / 32, 8 / 288], // GRASSYDIRTBIG_CSD,
  [22 / 32, 0 / 288], // GRASSYDIRTBIG_ESD,
  //
  [23 / 32, 40 / 288], // GRASSYDIRTBIG_ECU,
  [24 / 32, 48 / 288], // GRASSYDIRTBIG_ENU,
  [23 / 32, 24 / 288], // GRASSYDIRTBIG_ECC,
  [24 / 32, 32 / 288], // GRASSYDIRTBIG_ENC,
  [23 / 32, 8 / 288], // GRASSYDIRTBIG_ECD,
  [24 / 32, 16 / 288], // GRASSYDIRTBIG_END,
  //
  [21 / 32, 56 / 288], // GRASSYDIRTBIG_WCU,
  [22 / 32, 64 / 288], // GRASSYDIRTBIG_WNU,
  [22 / 32, 48 / 288], // GRASSYDIRTBIG_CCU,
  [23 / 32, 56 / 288], // GRASSYDIRTBIG_CNU,
  //
  [14 / 32, 96 / 288], // STONEROD_NS_N,
  [13 / 32, 88 / 288], // STONEROD_NS_C,
  [12 / 32, 80 / 288], // STONEROD_NS_S,
  [12 / 32, 112 / 288], // STONEROD_NS_NUB,
  //
  [16 / 32, 96 / 288], // STONEROD_EW_W,
  [17 / 32, 88 / 288], // STONEROD_EW_C,
  [18 / 32, 80 / 288], // STONEROD_EW_E,
  [18 / 32, 112 / 288], // STONEROD_EW_NUB,
  //
  [26 / 32, 32 / 288], // STONEROD_UD_U,
  [26 / 32, 16 / 288], // STONEROD_UD_C,
  [26 / 32, 0 / 288], // STONEROD_UD_D,
  [26 / 32, 64 / 288] // STONEROD_UD_NUB
]

const __scale = [32 / 512, 32 / 288]
function prescale(allNums: number[][]) {
  for (const nums of allNums) {
    nums[0] *= __scale[0]
    nums[1] *= __scale[1]
  }
}

prescale(__tileIndexOffsetLookup.x)
prescale(__tileIndexOffsetLookup.y)
prescale(__tileIndexOffsetLookup.z)

const __drillDir = {
  x: -1,
  y: 1,
  z: -1
}
function v(x: number, y: number, z: number) {
  return new Vector3(x, y, z)
}
const __offsets = [
  v(0, 0, 0),
  v(-0.5, -0.5, 0),
  v(0.3333333333333333, -0.3333333333333333, -0.3333333333333333),
  v(-0.16666666666666669, -0.8333333333333333, -0.3333333333333333),
  v(0.6666666666666666, -0.6666666666666666, -0.6666666666666666),
  v(0.16666666666666663, -1.1666666666666665, -0.6666666666666666),
  v(0, -1, 0),
  v(0.5, -0.5, 0),
  v(0.33333333333333326, -1.3333333333333333, -0.33333333333333326),
  v(0.8333333333333333, -0.8333333333333333, -0.33333333333333326),
  v(0.6666666666666667, -1.6666666666666667, -0.6666666666666667),
  v(1.1666666666666667, -1.166666666666667, -0.6666666666666667)
]

const __windings = [
  '+y+z+x',
  '+x+z+y',
  '+y+x+z',
  '+x+y+z',
  '+z+x+y',
  '+z+y+x',
  '+x+z+y',
  '+y+z+x',
  '+x+y+z',
  '+y+x+z',
  '+z+y+x',
  '+z+x+y'
]

const __leftOrRightTriangle = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0]

const tVec = new Vector3()
const sphereCenter = new Vector3(0, 0, -5)
let radiusSq = 2
function updateDefaultResolverAnim() {
  const now = performance.now()
  const radius = lerp(1, 6, unlerp(-1, 1, Math.sin(now * 0.001)))

  radiusSq = radius * radius
}
let defaultResolverAnimPlaying = false

function defaultIndexResolver(x: number, y: number, z: number) {
  if (!defaultResolverAnimPlaying) {
    defaultResolverAnimPlaying = true
    setInterval(updateDefaultResolverAnim, 16)
  }
  tVec.set(x, y, z)
  const onGrid = tVec.y % 8 === 0 || tVec.x % 8 === 0
  if (onGrid && (tVec.z + 5) % 16 === 0) {
    return 1
  } else if (
    tVec.distanceToSquared(sphereCenter) < radiusSq &&
    !(onGrid && (tVec.z === -4 || tVec.z === -3))
  ) {
    return 2
  }
  return 0
}

export default class PegboardGeometry extends BufferGeometry {
  playerCoord = new Vector3(-5, 7, -30)
  smoothOffset = new Vector2()
  update: () => void

  constructor(
    indexResolver: (
      x: number,
      y: number,
      z: number
    ) => number = defaultIndexResolver
  ) {
    super()

    const size = 32
    const cells = size * size
    const positionTemplate1 = new Float32Array([16, 0, 0, 8, 16, 16])
    const positionTemplate2 = new Float32Array([0, 0, 16, 8, 0, 16])
    const positionTemplates = [positionTemplate1, positionTemplate2]
    const uvTemplate1 = new Float32Array([0.75, 0.25, 0.25, 0.5, 0.75, 0.75])
    const uvTemplate2 = new Float32Array([0.25, 0.25, 0.75, 0.5, 0.25, 0.75])
    for (let i2 = 0; i2 < uvTemplate1.length; i2 += 2) {
      uvTemplate1[i2] *= __scale[0]
      uvTemplate1[i2 + 1] *= __scale[1]
      uvTemplate2[i2] *= __scale[0]
      uvTemplate2[i2 + 1] *= __scale[1]
    }

    const cellsMax = cells * 4

    const maxDrawSize = cellsMax * 3
    // const uvTemplate1 = new Float32Array([1, 0, 0, 0.5, 1, 1])
    // const uvTemplate2 = new Float32Array([0, 0, 1, 0.5, 0, 1])
    const uvTemplates = [uvTemplate1, uvTemplate2]
    const positionArr = new Float32Array(positionTemplate1.length * cellsMax)
    const uvArr = new Float32Array(3 * 2 * cellsMax)
    for (let iy = 0; iy < size; iy++) {
      for (let ix = 0; ix < size; ix++) {
        const io = iy * size + ix
        const positionTemplate = positionTemplates[(iy + ix) % 2]
        const uvTemplate = uvTemplates[(iy + ix) % 2]
        const offset = io * positionTemplate.length
        for (let i = 0; i < positionTemplate.length; i += 2) {
          positionArr[offset + i] = positionTemplate[i] + ix * 16
          positionArr[offset + i + 1] = positionTemplate[i + 1] + iy * 8
          uvArr[offset + i] = uvTemplate[i]
          uvArr[offset + i + 1] = uvTemplate[i + 1]
        }
      }
    }
    const tileIndexArr = new Float32Array(3 * cellsMax * 2)
    const colorArr = new Float32Array(3 * cellsMax)

    const originalPositionArr = positionArr.slice()
    const originalUvArr = uvArr.slice()

    const posAttr = new BufferAttribute(positionArr, 2)
    this.setAttribute('position', posAttr)
    const uvAttr = new BufferAttribute(uvArr, 2)
    this.setAttribute('uv', uvAttr)
    const tileIndexAttr = new BufferAttribute(tileIndexArr, 2)
    this.setAttribute('tileIndex', tileIndexAttr)
    const colorAttr = new BufferAttribute(colorArr, 1)
    this.setAttribute('color', colorAttr)
    const playerCoord = this.playerCoord

    // const totalIndex = size * size * 3 * 4
    // const drawIndexArr = new Uint16Array(totalIndex)
    // const drawIndexAttr = new BufferAttribute(drawIndexArr, 3)
    // for (let i = 0; i < totalIndex; i++) {
    //   drawIndexArr[i] = i
    // }
    // this.setIndex(drawIndexAttr)

    const vx = new Vector3()
    const vy = new Vector3()
    const vxy = new Vector3()

    const snappedPlayerCoord = new Vector3()
    const playerCoordRemainder = new Vector3()
    const smoothOffset = this.smoothOffset
    const screenOffsetX = new Vector2(16, -8)
    const screenOffsetY = new Vector2(16, 8)
    const screenOffsetZ = new Vector2(0, 16)

    const setDrawRange = this.setDrawRange.bind(this)
    const axes: string[] = []
    const occupiers: number[] = []

    const centerView = new Vector3()

    const predepth = 64
    const predepthVector = new Vector3(-predepth, predepth, -predepth)

    function updateGeometry() {
      axes.length = 0
      occupiers.length = 0

      snappedPlayerCoord.copy(playerCoord).round()
      playerCoordRemainder.copy(snappedPlayerCoord).sub(playerCoord)
      smoothOffset.set(0, 0)
      smoothOffset.addScaledVector(screenOffsetX, playerCoordRemainder.x)
      smoothOffset.addScaledVector(screenOffsetY, playerCoordRemainder.y)
      smoothOffset.addScaledVector(screenOffsetZ, playerCoordRemainder.z)
      smoothOffset.round()
      for (let ic = 0; ic < colorArr.length; ic++) {
        colorArr[ic] = rand()
      }

      const halfSize = size * 0.5
      const hx = halfSize / 2
      const hy = halfSize / 3
      vx.set(hx, hx, 0)
      vy.set(-hy, hy, hy)
      centerView.copy(vx).add(vy).round()
      centerView.add(predepthVector)
      let tileIndex: number[] = __tileIndexOffsetLookup['x'][0]

      let i3out = 0

      for (let iy = 0; iy < size; iy++) {
        for (let ix = 0; ix < size; ix++) {
          const wix = ix % 2
          const wiy = iy % 6
          const index = iy * size + ix
          const windex = wiy * 2 + wix

          const i3 = index * 3
          const i6 = index * 6
          const hx = ix / 2
          const hy = iy / 3
          vx.set(hx, hx, 0)
          vy.set(-hy, hy, hy)
          vxy
            .copy(vx)
            .add(vy)
            .add(__offsets[windex])
            .sub(centerView)
            .add(snappedPlayerCoord)
            .round()
          vxy.z -= Math.floor(iy / 6) //hack: no idea why this is necessary
          // let c = 0.3
          let c = 0

          const winding = __windings[windex]
          let iSub = 0
          let axis = winding[1]
          const depthToGo = size + predepth
          occupiers.length = 0
          axes.length = 0

          tileCollector: for (let d = 1; d <= depthToGo; d++) {
            const tileAtlasId = indexResolver(vxy.x, vxy.y, vxy.z)
            if (tileAtlasId > 0) {
              occupiers.push(tileAtlasId)
              axes.push(axis)
              switch (tileAtlasId) {
                case TILES.EMPTY:
                case TILES.BALL:
                case TILES.SHRUBDRIED:
                case TILES.GRAVEHEADSTONE:
                case TILES.STONEBIG_WSU:
                case TILES.STONEBIG_ENU:
                case TILES.STONEBIG_ESU:
                case TILES.STONEBIG_WNU:
                case TILES.STONEBIG_WSD:
                case TILES.STONEBIG_ESD:
                case TILES.STONEBIG_END:
                case TILES.DIRTBIG_WSU:
                case TILES.DIRTBIG_ENU:
                case TILES.DIRTBIG_ESU:
                case TILES.DIRTBIG_WNU:
                case TILES.DIRTBIG_WSD:
                case TILES.DIRTBIG_CSD:
                case TILES.DIRTBIG_ESD:
                case TILES.DIRTBIG_ECD:
                case TILES.DIRTBIG_END:
                case TILES.GRASSYDIRTBIG_WSU:
                case TILES.GRASSYDIRTBIG_ENU:
                case TILES.GRASSYDIRTBIG_ESU:
                case TILES.GRASSYDIRTBIG_WNU:
                case TILES.GRASSYDIRTBIG_WSD:
                case TILES.GRASSYDIRTBIG_CSD:
                case TILES.GRASSYDIRTBIG_ESD:
                case TILES.GRASSYDIRTBIG_ECD:
                case TILES.GRASSYDIRTBIG_END:
                case TILES.STONEROD_NS_N:
                case TILES.STONEROD_NS_C:
                case TILES.STONEROD_NS_S:
                case TILES.STONEROD_NS_NUB:
                case TILES.STONEROD_EW_E:
                case TILES.STONEROD_EW_C:
                case TILES.STONEROD_EW_W:
                case TILES.STONEROD_EW_NUB:
                case TILES.STONEROD_UD_U:
                case TILES.STONEROD_UD_C:
                case TILES.STONEROD_UD_D:
                case TILES.STONEROD_UD_NUB:
                  if (occupiers.length === 8) {
                    break tileCollector
                  }
                  break
                default:
                  break tileCollector
              }
            }

            iSub = (d % 3) * 2
            axis = winding[iSub + 1]

            switch (winding[iSub]) {
              case '+':
                vxy[axis] += __drillDir[axis]
                break
              case '-':
                vxy[axis] -= __drillDir[axis]
                break
              default:
                throw new Error('not a + or -')
            }
          }
          // for (let i = 0; i < occupiers.length; i++) {
          for (let i = occupiers.length - 1; i >= 0; i--) {
            const occupier = occupiers[i]
            const axis = axes[i]
            // c = __colorLookup[axis]
            c = 1
            tileIndex =
              __tileIndexOffsetLookup[axis][__leftOrRightTriangle[windex]]
            // drawIndexArr[i3out] = i3out
            // drawIndexArr[i3out + 1] = i3out + 1
            // drawIndexArr[i3out + 2] = i3out + 2
            const tileIndexOffset = __tileIdAtlasOffsets[occupier]
            const indexX = tileIndex[0] + tileIndexOffset[0]
            const indexY = tileIndex[1] + tileIndexOffset[1]

            const i6out = i3out * 2

            positionArr[i6out] = originalPositionArr[i6]
            positionArr[i6out + 1] = originalPositionArr[i6 + 1]

            positionArr[i6out + 2] = originalPositionArr[i6 + 2]
            positionArr[i6out + 3] = originalPositionArr[i6 + 3]

            positionArr[i6out + 4] = originalPositionArr[i6 + 4]
            positionArr[i6out + 5] = originalPositionArr[i6 + 5]

            uvArr[i6out] = originalUvArr[i6]
            uvArr[i6out + 1] = originalUvArr[i6 + 1]

            uvArr[i6out + 2] = originalUvArr[i6 + 2]
            uvArr[i6out + 3] = originalUvArr[i6 + 3]

            uvArr[i6out + 4] = originalUvArr[i6 + 4]
            uvArr[i6out + 5] = originalUvArr[i6 + 5]

            tileIndexArr[i6out] = indexX
            tileIndexArr[i6out + 1] = indexY

            tileIndexArr[i6out + 2] = indexX
            tileIndexArr[i6out + 3] = indexY

            tileIndexArr[i6out + 4] = indexX
            tileIndexArr[i6out + 5] = indexY

            colorArr[i3out] = rand2(0, c)
            colorArr[i3out + 1] = rand2(0, c)
            colorArr[i3out + 2] = rand2(0, c)

            i3out += 3
          }
        }
      }
      posAttr.needsUpdate = true
      uvAttr.needsUpdate = true
      colorAttr.needsUpdate = true
      tileIndexAttr.needsUpdate = true
      // drawIndexAttr.needsUpdate = true
      setDrawRange(0, Math.min(maxDrawSize, i3out))
    }
    updateGeometry()
    this.update = () => {
      updateGeometry()
    }
  }
}
