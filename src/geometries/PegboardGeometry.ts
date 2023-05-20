import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { lerp, rand, rand2, unlerp } from '../utils/math'

import { listenToProperty } from '../utils/propertyListeners'

const __axisLookup = ['x', 'y', 'z']
const __colorLookup = {
  x: 0.5,
  y: 0.8,
  z: 1.2
}
const __tileIndexOffsetLookup = {
  x: [
    [0.25, 0],
    [0.25, -1 / 4]
  ],
  y: [
    [-0.25, -1 / 4],
    [-0.25, 0]
  ],
  z: [
    [-0.25, 1 / 4],
    [0.25, 1 / 4]
  ]
}
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

const __leftOrRight = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0]

export default class PegboardGeometry extends BufferGeometry {
  constructor() {
    super()

    const dCutoff = 0
    // window.addEventListener('mousemove', (e) => {
    //   dCutoff = Math.round((e.clientX / window.innerWidth) * 30)
    // })

    const size = 32
    const cells = size * size
    const positionTemplate1 = new Float32Array([16, 0, 0, 8, 16, 16])
    const positionTemplate2 = new Float32Array([0, 0, 16, 8, 0, 16])
    const positionTemplates = [positionTemplate1, positionTemplate2]
    const uvTemplate1 = new Float32Array([0.75, 0.25, 0.25, 0.5, 0.75, 0.75])
    const uvTemplate2 = new Float32Array([0.25, 0.25, 0.75, 0.5, 0.25, 0.75])
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
    const testCoord = new Vector3(-5, 7, 0)
    const tempVal = { x: 0, y: 0, z: 0 }
    listenToProperty(tempVal, 'x', (x) => {
      testCoord.x = x
    })
    listenToProperty(tempVal, 'y', (y) => {
      testCoord.y = y
    })
    listenToProperty(tempVal, 'z', (z) => {
      testCoord.z = z
    })

    window.addEventListener('mousemove', (e) => {
      tempVal.x = Math.round((e.clientX / window.innerWidth) * 20) - 10
      tempVal.y = -(Math.round((e.clientY / window.innerHeight) * 20) - 10)
    })

    const vx = new Vector3()
    const vy = new Vector3()
    const v = new Vector3()

    let frame = 0

    function makeColors() {
      for (let ic = 0; ic < colorArr.length; ic++) {
        colorArr[ic] = rand()
      }
      const now = performance.now()
      const radius = lerp(1, 6, unlerp(-1, 1, Math.sin(now * 0.001)))
      const radiusSq = radius * radius

      // tempVal.z = Math.round(
      //   lerp(-1, 5, unlerp(-1, 1, Math.sin(now * 0.001)))
      // )

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
          // v.copy(vx).add(vy).round()
          v.copy(vx)
            .add(vy)
            .add(__offsets[windex])
            .sub(centerView)
            .sub(testCoord)
            .round()
          v.z -= Math.floor(iy / 6) //hack: no idea why this is necessary
          // v.z += oy
          // v.x -= ox
          // v.y -= ox
          // let c = 0.3
          let c = 0
          if (frame === 0 && ix < 2 && iy < 24) {
            console.log(
              `${ix} ${iy}, ${hx.toFixed(2)} ${hy.toFixed(2)}, ${v.toArray()}`
            )
            // const t = wholeCoords[wholeLookup[windex]].clone().sub(v).round()
            // console.log(windex)
            // const t = wholeCoords[wholeLookup[windex]]
            // console.log(`v(${t.x}, ${t.y}, ${t.z}),`)
            // console.log(`${ix} ${iy}, v(${v.x}, ${v.y}, ${v.z}),`)
          }

          const winding = __windings[windex]
          let iSub = 0
          let axis = winding[1]
          const depthToGo = size + predepth
          for (let d = 1; d <= depthToGo; d++) {
            // if(ix === 0 && iy === 0) {
            //   console.log(v.toArray())
            // }
            if (
              v.distanceToSquared(sphereCenter) < radiusSq ||
              d === dCutoff ||
              (v.y % 8 === 0 && v.z === -5) ||
              (v.x % 8 === 0 && v.z === -5)
            ) {
              // const c = o
              // c = __colorLookup[axis]
              c = 1
              tileIndex = __tileIndexOffsetLookup[axis][__leftOrRight[windex]]
              break
            }

            iSub = (d % 3) * 2
            axis = winding[iSub + 1]

            switch (winding[iSub]) {
              case '+':
                v[axis] += __drillDir[axis]
                break
              case '-':
                v[axis] -= __drillDir[axis]
                break
              default:
                throw new Error('not a + or -')
            }
          }
          tileIndexArr[i6] = tileIndex[0]
          tileIndexArr[i6 + 1] = tileIndex[1]
          tileIndexArr[i6 + 2] = tileIndex[0]
          tileIndexArr[i6 + 3] = tileIndex[1]
          tileIndexArr[i6 + 4] = tileIndex[0]
          tileIndexArr[i6 + 5] = tileIndex[1]
          colorArr[i3] = rand2(0, c)
          colorArr[i3 + 1] = rand2(0, c)
          colorArr[i3 + 2] = rand2(0, c)
        }
      }
      frame++
    }
    makeColors()
    setInterval(() => {
      makeColors()
      colorAttr.needsUpdate = true
      tileIndexAttr.needsUpdate = true
    }, 16)
  }
}
