import { BufferAttribute, Object3D } from 'three'
import { Color } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import NoiseHelper4D from '../helpers/utils/NoiseHelper4D'
import { lerp } from '../utils/math'

export function makeGround(mat: Material, time = 0) {
  const workingColor = new Color()
  const color = new Color(0.05, 0.05, 0.05)
  const color2 = new Color(0.16, 0.14, 0.13)
  const tempVec3 = new Vector3()
  const basis = 34
  const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
  const posAttr = geo.attributes.position
  const posArr = posAttr.array as Float32Array
  const colorArr = new Float32Array(posAttr.count * 3)
  const noise = new NoiseHelper4D(0.62, 1)
  const noise2 = new NoiseHelper4D(0.2, 1)
  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3
    tempVec3.fromArray(posArr, i3)
    const ratioU = (tempVec3.x + 16) / 32
    const ratioV = (tempVec3.y + 16) / 32
    const angleU = ratioU * Math.PI * 2
    const angleV = ratioV * Math.PI * 2
    const x = Math.cos(angleU) + time
    const y = Math.sin(angleU) + time
    const z = Math.cos(angleV) * 1.5 + time
    const w = Math.sin(angleV) * 1.5 + time
    const sample = noise.getValue(x + 1.12, y + 7.582, z + 2.1845, w + 4.852)
    const sample2 = noise2.getValue(x + 1.12, y + 7.582, z + 2.1845, w + 4.852)
    const bouncedSample1 = 1 - Math.abs(sample)
    const bouncedSample2 = 1 - Math.abs(sample2)
    const bouncedSample = Math.max(bouncedSample1, bouncedSample2)
    tempVec3.z = Math.pow(bouncedSample, 8) * 2 + 4
    tempVec3.toArray(posArr, i3)
    const colorSample = Math.pow(bouncedSample, 3)
    workingColor.lerpColors(color, color2, colorSample)
    tempVec3.set(workingColor.r, workingColor.g, workingColor.b)
    tempVec3.toArray(colorArr, i3)
  }
  geo.setAttribute('color', new BufferAttribute(colorArr, 3))
  geo.computeVertexNormals()
  const pivot = new Object3D()
  pivot.rotation.x = -Math.PI * 0.5
  const mesh = new Mesh(geo, mat)
  pivot.add(mesh)
  pivot.scale.z = 0.1
  return pivot
}
