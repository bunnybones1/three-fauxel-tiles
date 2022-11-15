import { BufferAttribute, Object3D } from 'three'
import { Color } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import NoiseHelper4D from '../helpers/utils/NoiseHelper4D'
import { clamp, lerp } from '../utils/math'
import NamedBitsInNumber from '../helpers/utils/NamedBitsInNumber'

const __tempVec3 = new Vector3()
let __protoGeo: PlaneBufferGeometry | undefined
function __getProtoGeo() {
  if (!__protoGeo) {
    const workingColor = new Color()
    const color = new Color(0.05, 0.05, 0.05)
    const color2 = new Color(0.16, 0.14, 0.13)
    const basis = 34
    const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
    const posAttr = geo.attributes.position
    const posArr = posAttr.array as Float32Array
    const colorArr = new Float32Array(posAttr.count * 3)
    const noise = new NoiseHelper4D(0.62, 1)
    const noise2 = new NoiseHelper4D(0.2, 1)
    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3
      __tempVec3.fromArray(posArr, i3)
      const u = (__tempVec3.x + 16) / 32
      const v = (__tempVec3.y + 16) / 32
      const angleU = u * Math.PI * 2
      const angleV = v * Math.PI * 2
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
    __protoGeo = geo
  }
  return __protoGeo
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

export function makeGround(
  mat: Material,
  around: NamedBitsInNumber<typeof CardinalStrings>
) {
  const geo = __getProtoGeo().clone()
  const posAttr = geo.attributes.position
  const posArr = posAttr.array as Float32Array
  const c = true
  const quads = [
    [around.has('nw'), around.has('n'), around.has('w'), around.has('c')], //nw
    [around.has('n'), around.has('ne'), around.has('c'), around.has('e')], //ne
    [around.has('w'), around.has('c'), around.has('sw'), around.has('s')], //sw
    [around.has('c'), around.has('e'), around.has('s'), around.has('se')] //se
  ]
  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3
    __tempVec3.fromArray(posArr, i3)
    const u = clamp((__tempVec3.x + 16) / 32, 0, 1)
    const v = clamp((__tempVec3.y + 16) / 32, 0, 1)
    const quad = quads[(v < 0.5 ? 0 : 2) + (u < 0.5 ? 0 : 1)]
    const tl = quad[0] ? 0 : 1
    const tr = quad[1] ? 0 : 1
    const bl = quad[2] ? 0 : 1
    const br = quad[3] ? 0 : 1
    const sink = tl === br && tr === bl && tl !== tr
    const subU = (u < 0.5 ? u : u - 0.5) * 2
    const subV = (v < 0.5 ? v : v - 0.5) * 2
    const t = lerp(tl, tr, subU)
    const b = lerp(bl, br, subU)
    let final = lerp(t, b, subV)
    if (sink) {
      const sinkDist = Math.pow(
        Math.sqrt(
          Math.pow((subU - 0.5) * 2, 2) + Math.pow((subV - 0.5) * 2, 2)
        ),
        0.5
      )
      final += clamp(1 - sinkDist, 0, 1)
    }
    __tempVec3.z += Math.pow(final, 2) * -10
    __tempVec3.toArray(posArr, i3)
  }
  geo.computeVertexNormals()
  const pivot = new Object3D()
  pivot.rotation.x = -Math.PI * 0.5
  const mesh = new Mesh(geo, mat)
  pivot.add(mesh)
  pivot.scale.z = 0.1
  return pivot
}
