import { BufferGeometry, SphereBufferGeometry, Vector3 } from 'three'

import { inferDirection } from './math'

export function getChamferedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  chamfer = 0.005
) {
  const geo = new SphereBufferGeometry(0.02, 8, 5, Math.PI * 0.125)
  const posArr = geo.attributes.position.array as number[]
  const normArr = geo.attributes.normal.array as number[]
  const tempVec = new Vector3()
  const tempPos = new Vector3()
  const halfWidth = width * 0.5 - chamfer
  const halfHeight = height * 0.5 - chamfer
  const halfDepth = depth * 0.5 - chamfer
  for (let i3 = 0; i3 < normArr.length; i3 += 3) {
    tempVec.fromArray(normArr, i3)
    tempPos.fromArray(posArr, i3)
    tempVec.round()
    if (tempVec.y === 1) {
      tempVec.set(0, 1, 0)
    }
    if (tempVec.y === -1) {
      tempVec.set(0, -1, 0)
    }
    tempVec.toArray(normArr, i3)
    tempVec.multiplyScalar(chamfer)
    tempVec.x += halfWidth * inferDirection(tempPos.x)
    tempVec.y += halfHeight * inferDirection(tempPos.y)
    tempVec.z += halfDepth * inferDirection(tempPos.z)
    tempVec.toArray(posArr, i3)
  }
  return geo
}

const __cachedOffsetChamferedBoxGeometry = new Map<string, BufferGeometry>()
const __cachedChamferedBoxGeometry = new Map<string, BufferGeometry>()
export function getCachedChamferedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  chamfer = 0.005,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0
) {
  const key = `${width};${height};${depth};${chamfer};`
  if (!__cachedChamferedBoxGeometry.has(key)) {
    __cachedChamferedBoxGeometry.set(
      key,
      getChamferedBoxGeometry(width, height, depth, chamfer)
    )
  }
  if (offsetX === 0 && offsetY === 0 && offsetZ === 0) {
    return __cachedChamferedBoxGeometry.get(key)!
  }
  const key2 = `${key}${offsetX};${offsetY};${offsetZ}`

  if (!__cachedOffsetChamferedBoxGeometry.has(key2)) {
    const geo = __cachedChamferedBoxGeometry.get(key)!
    const geoOffset = __cachedChamferedBoxGeometry.get(key)!.clone()
    geoOffset.attributes.uv = geo.attributes.uv
    geoOffset.attributes.normal = geo.attributes.normal
    const posArr = geoOffset.attributes.position.array as number[]
    for (let i3 = 0; i3 < posArr.length; i3 += 3) {
      posArr[i3] += offsetX
      posArr[i3 + 1] += offsetY
      posArr[i3 + 2] += offsetZ
    }
    __cachedOffsetChamferedBoxGeometry.set(key2, geoOffset)
  }
  return __cachedOffsetChamferedBoxGeometry.get(key2)!
}
