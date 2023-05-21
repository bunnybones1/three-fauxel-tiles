import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { lerp, rand, rand2, unlerp } from '../utils/math'

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

const __scale = [32 / 64, 32 / 80]
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

export default class PegboardGeometry extends BufferGeometry {
  playerCoord = new Vector3(-5, 7, -3)

  constructor() {
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
    // const uvTemplate1 = new Float32Array([1, 0, 0, 0.5, 1, 1])
    // const uvTemplate2 = new Float32Array([0, 0, 1, 0.5, 0, 1])
    const uvTemplates = [uvTemplate1, uvTemplate2]
    const positionArr = new Float32Array(positionTemplate1.length * cells)
    const uvArr = new Float32Array(3 * 2 * cells)
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
    const tileIndexArr = new Float32Array(3 * cells * 2)
    const colorArr = new Float32Array(3 * cells)

    const posAttr = new BufferAttribute(positionArr, 2)
    this.setAttribute('position', posAttr)
    const uvAttr = new BufferAttribute(uvArr, 2)
    this.setAttribute('uv', uvAttr)
    const tileIndexAttr = new BufferAttribute(tileIndexArr, 2)
    this.setAttribute('tileIndex', tileIndexAttr)
    const colorAttr = new BufferAttribute(colorArr, 1)
    this.setAttribute('color', colorAttr)
    const sphereCenter = new Vector3(0, 0, -5)
    const playerCoord = this.playerCoord

    const vx = new Vector3()
    const vy = new Vector3()
    const vxy = new Vector3()
    const vxy2 = new Vector3()

    const snappedPlayerCoord = new Vector3()

    function updateGeometry() {
      snappedPlayerCoord.copy(playerCoord).round()
      for (let ic = 0; ic < colorArr.length; ic++) {
        colorArr[ic] = rand()
      }
      const now = performance.now()
      const radius = lerp(1, 6, unlerp(-1, 1, Math.sin(now * 0.001)))
      const radiusSq = radius * radius

      const centerView = new Vector3()
      const halfSize = size * 0.5
      const hx = halfSize / 2
      const hy = halfSize / 3
      vx.set(hx, hx, 0)
      vy.set(-hy, hy, hy)
      centerView.copy(vx).add(vy).round()
      const predepth = 6
      centerView.add(new Vector3(-predepth, predepth, -predepth))
      let tileIndex: number[] = __tileIndexOffsetLookup['x'][0]

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
          let occupied = false
          let purple = false
          let green = false
          let green2 = false
          for (let d = 1; d <= depthToGo; d++) {
            const onGrid = vxy.y % 8 === 0 || vxy.x % 8 === 0
            if (onGrid && (vxy.z + 5) % 16 === 0) {
              occupied = true
              //
            } else if (
              vxy.distanceToSquared(sphereCenter) < radiusSq &&
              !(onGrid && (vxy.z === -4 || vxy.z === -3))
            ) {
              occupied = true
              purple = true
            } else if (vxy.distanceTo(snappedPlayerCoord) < 1) {
              occupied = true
              green = true
            } else {
              vxy2.copy(vxy)
              vxy2.z++
              if (vxy2.distanceTo(snappedPlayerCoord) < 1) {
                occupied = true
                green2 = true
              }
            }
            if (occupied) {
              // c = __colorLookup[axis]
              c = 1
              tileIndex =
                __tileIndexOffsetLookup[axis][__leftOrRightTriangle[windex]]
              break
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
          let indexX = tileIndex[0]
          let indexY = tileIndex[1]
          if (!purple) {
            if (green) {
              indexX += 0.25
              indexY += 24 / 80
            } else if (green2) {
              indexY += 48 / 80
            } else {
              indexX += 0.5
              indexY += 48 / 80
            }
          }
          tileIndexArr[i6] = indexX
          tileIndexArr[i6 + 1] = indexY
          tileIndexArr[i6 + 2] = indexX
          tileIndexArr[i6 + 3] = indexY
          tileIndexArr[i6 + 4] = indexX
          tileIndexArr[i6 + 5] = indexY
          colorArr[i3] = rand2(0, c)
          colorArr[i3 + 1] = rand2(0, c)
          colorArr[i3 + 2] = rand2(0, c)
        }
      }
    }
    updateGeometry()
    setInterval(() => {
      updateGeometry()
      colorAttr.needsUpdate = true
      tileIndexAttr.needsUpdate = true
    }, 16)
  }
}
