import { BufferAttribute, Object3D } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import { clamp, lerp, unlerp, wrap } from '../utils/math'
import NamedBitsInNumber from '../helpers/utils/NamedBitsInNumber'
import { detRandSand } from '../utils/random'

const skews: number[] = []
const strengths: number[] = []
const aOffsets: number[] = []
const freqs: number[] = []
const flips: boolean[] = []
const total = 11
// detRandSand(-3, 3)
// detRandSand(-3, 3)
// detRandSand(-3, 3)
detRandSand(-3, 3)
detRandSand(-3, 3)
detRandSand(-3, 3)
for (let step = 0; step < total; step++) {
  const ratio = step / (total - 1)
  strengths.push(1 - Math.pow(1 - ratio, 2))
  const freq = Math.round(lerp(1, 2, ratio))
  freqs.push(freq)
  const skew = Math.round(detRandSand(-3, 3)) / freq
  skews.push(skew)
  aOffsets.push(detRandSand(0, Math.PI * 2))
  flips.push(detRandSand(0, 1) > 0.5)
  // break
}

const colorA = new Vector3(0.5, 0.3, 0.1)
const colorB = new Vector3(0.8, 0.7, 0.5)
const axis = new Vector3(0, 0, 1).normalize()

const tempVec3 = new Vector3()
const tempVec3B = new Vector3()
const originalVec3 = new Vector3()
const basis = 18
const __protoGeos: Map<string, PlaneBufferGeometry> = new Map()
function __getProtoGeo(uOffset: number, vOffset: number, maxStrength = 0.35) {
  const key = `${uOffset}:${vOffset}`
  if (!__protoGeos.has(key)) {
    const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
    const posAttr = geo.attributes.position
    const posArr = posAttr.array as Float32Array
    const colorArr = new Float32Array(posAttr.count * 3)
    const uvAttr = geo.attributes.uv
    const uvArr = uvAttr.array as Float32Array
    const localStrengths = strengths.map((v) => lerp(maxStrength, 0.05, v))
    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3
      originalVec3.fromArray(posArr, i3)
      const resultVec3 = originalVec3.clone()

      for (let j = 0; j < skews.length; j++) {
        tempVec3.copy(originalVec3)
        tempVec3.x += uOffset
        tempVec3.y += vOffset
        if (flips[j]) {
          const x = tempVec3.x
          tempVec3.x = -tempVec3.y
          tempVec3.y = x
        }
        const freq = freqs[j]
        const skew = skews[j]
        const strength = localStrengths[j]
        const ratioV = tempVec3.y / 32
        let ratioU = tempVec3.x / 32
        ratioU += skew * ratioV
        const a =
          ratioU * freq * Math.PI * 2 +
          aOffsets[j] +
          maxStrength * (j + 4) * 0.5
        tempVec3B.set(0, Math.cos(a) * strength, -Math.sin(a) * strength)
        tempVec3B.applyAxisAngle(
          axis,
          Math.atan2(skew, 1) + Math.PI * 0.5 + (flips[j] ? -Math.PI * 0.5 : 0)
        )
        resultVec3.add(tempVec3B)
      }
      resultVec3.toArray(posArr, i3)
      const colorSample = unlerp(-2, 1, resultVec3.z)
      resultVec3.lerpVectors(colorA, colorB, colorSample)
      resultVec3.toArray(colorArr, i3)
    }
    geo.setAttribute('color', new BufferAttribute(colorArr, 3))
    __protoGeos.set(key, geo)
  }
  return __protoGeos.get(key)!
}

export const CardinalStrings = [
  'c',
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w'
] as const

const __offsets = [
  [-8, -8],
  [8, -8],
  [-8, 8],
  [8, 8]
]

const __quadMeshes: Map<string, Object3D> = new Map()

export function makeGroundQuad(id: number, quad: boolean[], mat: Material) {
  const tl = quad[0] ? 0 : 1
  const tr = quad[1] ? 0 : 1
  const bl = quad[2] ? 0 : 1
  const br = quad[3] ? 0 : 1
  const key = `${id}${tl}${tr}${bl}${br}`

  if (!__quadMeshes.has(key)) {
    const offsets = __offsets[id]
    const geo = __getProtoGeo(offsets[0], offsets[1]).clone()
    const posAttr = geo.attributes.position
    const posArr = posAttr.array as Float32Array
    const uvAttr = geo.attributes.uv
    const uvArr = uvAttr.array as Float32Array
    const sink = tl === br && tr === bl && tl !== tr
    for (let i = 0; i < posAttr.count; i++) {
      const i2 = i * 2
      const i3 = i * 3
      tempVec3.fromArray(posArr, i3)
      const u = uvArr[i2]
      const v = uvArr[i2 + 1]
      const t = lerp(tl, tr, u)
      const b = lerp(bl, br, u)
      let final = lerp(t, b, v)
      if (sink) {
        const sinkDist = Math.pow(
          Math.sqrt(Math.pow((u - 0.5) * 2, 2) + Math.pow((v - 0.5) * 2, 2)),
          0.5
        )
        final += clamp(1 - sinkDist, 0, 1)
      }
      const sandy = detRandSand(0, 1)
      if (sandy < 0.3) {
        // tempVec3.z += (sandy * sandy * sandy) * 0.2
        tempVec3.z += 0.2
      }
      if (sandy > 0.99) {
        tempVec3.z += 0.7
      }
      tempVec3.z += Math.pow(final, 2) * -4
      tempVec3.toArray(posArr, i3)
    }
    geo.computeVertexNormals()
    const mesh = new Mesh(geo, mat)
    mesh.position.x = offsets[0]
    mesh.position.y = offsets[1]
    const pivot = new Object3D()
    pivot.rotation.x = -Math.PI * 0.5
    pivot.scale.z = 0.5
    // pivot.scale.z = 0.1
    pivot.position.y = 1
    pivot.add(mesh)
    __quadMeshes.set(key, pivot)
  }
  return __quadMeshes.get(key)!.clone()
}

export function makeGround(
  mat: Material,
  around: NamedBitsInNumber<typeof CardinalStrings>
) {
  const quads = [
    [around.has('nw'), around.has('n'), around.has('w'), around.has('c')], //nw
    [around.has('n'), around.has('ne'), around.has('c'), around.has('e')], //ne
    [around.has('w'), around.has('c'), around.has('sw'), around.has('s')], //sw
    [around.has('c'), around.has('e'), around.has('s'), around.has('se')] //se
  ]
  const pivot = new Object3D()

  for (let j = 0; j < quads.length; j++) {
    const quad = quads[j]
    pivot.add(makeGroundQuad(j, quad, mat))
  }
  return pivot
}
