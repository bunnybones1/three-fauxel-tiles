import { BufferAttribute, Object3D } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import NoiseHelper4D from '../helpers/utils/NoiseHelper4D'
import { lerp } from '../utils/math'

export function makeWater(mat: Material, timeScale = 1, time = 0) {
  const tempVec3 = new Vector3()
  const basis = 34
  const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
  const posAttr = geo.attributes.position
  const posArr = posAttr.array as Float32Array
  const colorArr = new Float32Array(posAttr.count * 3)
  const noise = new NoiseHelper4D(0.22, 1)
  const timeAngle = time * Math.PI * 2
  const timeX = Math.cos(timeAngle) * timeScale
  const timeY = Math.sin(timeAngle) * timeScale
  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3
    tempVec3.fromArray(posArr, i3)
    const ratioU = (tempVec3.x + 16) / 32
    const ratioV = (tempVec3.y + 16) / 32
    const angleU = ratioU * Math.PI * 2
    const angleV = ratioV * Math.PI * 2
    const x = Math.cos(angleU) + timeX
    const y = Math.sin(angleU) + timeY
    const z = Math.cos(angleV) * 1.5 + timeX
    const w = Math.sin(angleV) * 1.5 + timeY
    const sample = noise.getValue(x + 1.12, y + 7.582, z + 2.1845, w + 5.852)
    const bouncedSample = 1 - Math.abs(sample)
    tempVec3.z = Math.pow(bouncedSample, 4) * 2 + 2
    tempVec3.toArray(posArr, i3)
    const colorSample = Math.pow(bouncedSample, 3)
    tempVec3.set(colorSample, lerp(0.5, 1, colorSample), 1)
    tempVec3.toArray(colorArr, i3)
  }
  geo.setAttribute('color', new BufferAttribute(colorArr, 3))
  geo.computeVertexNormals()
  const pivot = new Object3D()
  pivot.rotation.x = -Math.PI * 0.5
  const mesh = new Mesh(geo, mat)
  pivot.add(mesh)
  pivot.scale.z = 0.3
  return pivot
}
