import { BufferAttribute, Object3D } from 'three'
import { Color } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import NoiseHelper4D from '../helpers/utils/NoiseHelper4D'
import { clamp, lerp, wrap } from '../utils/math'
import NamedBitsInNumber from '../helpers/utils/NamedBitsInNumber'

const __tempVec3 = new Vector3()
const __protoGeos: Map<string, PlaneBufferGeometry> = new Map()
function __getProtoGeo(uOffset: number, vOffset: number) {
  const key = `${uOffset}:${vOffset}`
  if (!__protoGeos.has(key)) {
    const workingColor = new Color()
    const color = new Color(0.05, 0.05, 0.05)
    const color2 = new Color(0.16, 0.14, 0.13)
    const basis = 18
    const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
    const posAttr = geo.attributes.position
    const posArr = posAttr.array as Float32Array
    const uvAttr = geo.attributes.uv
    const uvArr = uvAttr.array as Float32Array
    const colorArr = new Float32Array(posAttr.count * 3)
    const noise = new NoiseHelper4D(0.62, 1)
    const noise2 = new NoiseHelper4D(0.2, 1)
    for (let i = 0; i < posAttr.count; i++) {
      const i2 = i * 2
      const i3 = i * 3
      __tempVec3.fromArray(posArr, i3)
      // __tempVec3.x += uOffset
      // __tempVec3.y += vOffset
      const u = __tempVec3.x / 16 + 0.5
      const v = __tempVec3.y / 16 + 0.5
      uvArr[i2] = u
      uvArr[i2 + 1] = v
      const subU = (__tempVec3.x + uOffset) / 32 + 0.5
      const subV = (__tempVec3.y + vOffset) / 32 + 0.5
      const angleU = subU * Math.PI * 2
      const angleV = subV * Math.PI * 2
      const x = Math.cos(angleU)
      const y = Math.sin(angleU)
      const z = Math.cos(angleV) * 1.5
      const w = Math.sin(angleV) * 1.5
      const sample = noise.getValue(x + 1.12, y + 7.582, z + 2.1845, w + 4.852)
      const sample2 = noise2.getValue(
        x + 1.12,
        y + 7.582,
        z + 2.1845,
        w + 4.852
      )
      const bouncedSample1 = 1 - Math.abs(sample)
      const bouncedSample2 = 1 - Math.abs(sample2)
      const bouncedSample = Math.max(bouncedSample1, bouncedSample2)
      __tempVec3.z = Math.pow(bouncedSample, 8) * 2 + 4
      __tempVec3.toArray(posArr, i3)
      const colorSample = Math.pow(bouncedSample, 3)
      workingColor.lerpColors(color, color2, colorSample)
      __tempVec3.set(workingColor.r, workingColor.g, workingColor.b)
      __tempVec3.toArray(colorArr, i3)
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

const __quadMeshes: Map<string, Mesh> = new Map()

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
    const tl = quad[0] ? 0 : 1
    const tr = quad[1] ? 0 : 1
    const bl = quad[2] ? 0 : 1
    const br = quad[3] ? 0 : 1
    const key = `${j}${tl}${tr}${bl}${br}`
    if (!__quadMeshes.has(key)) {
      const offsets = __offsets[j]
      const geo = __getProtoGeo(offsets[0], offsets[1]).clone()
      const posAttr = geo.attributes.position
      const posArr = posAttr.array as Float32Array
      const uvAttr = geo.attributes.uv
      const uvArr = uvAttr.array as Float32Array
      const sink = tl === br && tr === bl && tl !== tr
      for (let i = 0; i < posAttr.count; i++) {
        const i2 = i * 2
        const i3 = i * 3
        __tempVec3.fromArray(posArr, i3)
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
        __tempVec3.z += Math.pow(final, 2) * -10
        __tempVec3.toArray(posArr, i3)
      }
      geo.computeVertexNormals()
      const mesh = new Mesh(geo, mat)
      mesh.position.x = offsets[0]
      mesh.position.y = offsets[1]
      __quadMeshes.set(key, mesh)
    }
    pivot.add(__quadMeshes.get(key)!.clone())
  }
  pivot.rotation.x = -Math.PI * 0.5
  // pivot.scale.z = 0.5
  pivot.scale.z = 0.1
  return pivot
}
