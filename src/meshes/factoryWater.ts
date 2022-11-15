import { BufferAttribute, Object3D } from 'three'
import { Material, Mesh, PlaneBufferGeometry, Vector3 } from 'three'
import { lerp, unlerp } from '../utils/math'
import { detRandWater } from '../utils/random'

const skews: number[] = []
const strengths: number[] = []
const aOffsets: number[] = []
const freqs: number[] = []
const flips: boolean[] = []
const total = 12
detRandWater(-3, 3)
detRandWater(-3, 3)
detRandWater(-3, 3)
detRandWater(-3, 3)
for (let step = 0; step < total; step++) {
  const ratio = step / (total - 1)
  strengths.push(lerp(0.5, 0.05, 1 - Math.pow(1 - ratio, 2)))
  const freq = Math.round(lerp(1, 8, ratio))
  freqs.push(freq)
  const skew = Math.round(detRandWater(-3, 3)) / freq
  skews.push(skew)
  aOffsets.push(detRandWater(0, Math.PI * 2))
  flips.push(detRandWater(0, 1) > 0.5)
  if (step === 11) break
}
const axis = new Vector3(0, 0, 1).normalize()

export function makeWater(mat: Material, timeScale = 1, time = 0) {
  const tempVec3 = new Vector3()
  const tempVec3B = new Vector3()
  const originalVec3 = new Vector3()
  const basis = 34
  const geo = new PlaneBufferGeometry(basis, basis, basis * 2, basis * 2)
  const posAttr = geo.attributes.position
  const posArr = posAttr.array as Float32Array
  const normalAttr = geo.attributes.normal
  const normalArr = normalAttr.array as Float32Array
  const colorArr = new Float32Array(posAttr.count * 3)
  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3
    originalVec3.fromArray(posArr, i3)
    const resultVec3 = originalVec3.clone()
    for (let j = 0; j < skews.length; j++) {
      tempVec3.copy(originalVec3)
      if (flips[j]) {
        const x = tempVec3.x
        tempVec3.x = -tempVec3.y
        tempVec3.y = x
      }
      const freq = freqs[j]
      const skew = skews[j]
      const strength = strengths[j]
      const ratioV = (tempVec3.y + 16) / 32
      tempVec3.x += skew * 32 * ratioV
      const ratioU = (tempVec3.x + 16) / 32
      const a = (ratioU * freq + time) * Math.PI * 2 + aOffsets[j]
      tempVec3B.set(0, Math.cos(a) * strength, -Math.sin(a) * strength)
      tempVec3B.applyAxisAngle(
        axis,
        Math.atan2(skew, 1) + Math.PI * 0.5 + (flips[j] ? -Math.PI * 0.5 : 0)
      )
      resultVec3.add(tempVec3B)
    }
    resultVec3.toArray(posArr, i3)
    const colorSample = Math.pow(unlerp(-1, 1, resultVec3.z), 3)
    resultVec3.set(colorSample, lerp(0.5, 1, colorSample), 1)
    resultVec3.toArray(colorArr, i3)
    posArr[i3 + 2] *= 0.0725
  }
  geo.setAttribute('color', new BufferAttribute(colorArr, 3))
  geo.computeVertexNormals()

  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3
    tempVec3.fromArray(normalArr, i3)
    tempVec3.z *= 0.035
    tempVec3.normalize()
    tempVec3.toArray(normalArr, i3)
  }
  const pivot = new Object3D()
  pivot.rotation.x = -Math.PI * 0.5
  const meshProto = new Mesh(geo, mat)
  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      const mesh = meshProto.clone()
      mesh.position.x = ix * 32
      mesh.position.y = iy * 32
      pivot.add(mesh)
    }
  }
  pivot.position.y = 0.25
  return pivot
}
