import {
  BufferGeometry,
  CylinderBufferGeometry,
  Material,
  Mesh,
  Object3D,
  Quaternion,
  Vector3
} from 'three'
import {
  getCachedChamferedBoxGeometry,
  getChamferedBoxGeometry
} from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'
import { detRandTreesMaple } from '../utils/random'

export function makeTreeMapleStumpMature(matBark: Material, matWood: Material) {
  const tiltRange = 0.1
  const height = 10
  const baseRadius = 5
  const pivot = new Object3D()

  //trunk
  const wood = new Mesh(
    new CylinderBufferGeometry(baseRadius, baseRadius, height, 16),
    matWood
  )
  pivot.add(wood)
  wood.position.y = height * 0.5
  for (let i = 0; i < 80; i++) {
    const size = ~~detRandTreesMaple(6, 8)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTreesMaple(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius =
      baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2))
    const angle = detRandTreesMaple(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.y += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.z += detRandTreesMaple(-tiltRange, tiltRange)
    pivot.add(bark)
  }
  return mergeMeshes(pivot)
}

export function makeTreeMapleStump(matBark: Material, matWood: Material) {
  const tiltRange = 0.1
  const height = 5
  const baseRadius = 3
  const pivot = new Object3D()

  //trunk
  const wood = new Mesh(
    new CylinderBufferGeometry(baseRadius, baseRadius, height, 16),
    matWood
  )
  pivot.add(wood)
  wood.position.y = height * 0.5
  for (let i = 0; i < 60; i++) {
    const size = ~~detRandTreesMaple(3, 5)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTreesMaple(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius =
      baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2))
    const angle = detRandTreesMaple(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.y += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.z += detRandTreesMaple(-tiltRange, tiltRange)
    pivot.add(bark)
  }
  return mergeMeshes(pivot)
}

export function makeTreeMapleMature(
  matBark: Material,
  matLeaf: Material,
  matWood: Material
) {
  const tiltRange = 0.1
  const height = 32
  const baseRadius = 5
  const baseRadiusInner = baseRadius - 1
  const pivot = new Object3D()

  //trunk
  const wood = new Mesh(
    new CylinderBufferGeometry(baseRadius, baseRadius, height, 16),
    matWood
  )
  pivot.add(wood)
  wood.position.y = height * 0.5
  for (let i = 0; i < 260; i++) {
    const size = ~~detRandTreesMaple(6, 8)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTreesMaple(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius =
      baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2))
    const angle = detRandTreesMaple(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.y += detRandTreesMaple(-tiltRange, tiltRange)
    bark.rotation.z += detRandTreesMaple(-tiltRange, tiltRange)
    pivot.add(bark)
  }

  return mergeMeshes(pivot)
}

export function makeTreeMaple(matBark: Material, matLeaf: Material) {
  const cylinderGeo = __getTwigGeo(0.8, 1, 1, 16)

  function getChunk(radius: number, height: number) {
    const cylinder = new Mesh(cylinderGeo, matBark)
    cylinder.scale.set(radius, height, radius)
    cylinder.rotation.x = Math.PI * 0.5
    const cylinderPivot = new Object3D()
    cylinderPivot.add(cylinder)
    return cylinderPivot
  }
  const tiltRange = 0.05
  const height = 32
  const baseRadius = 0
  const baseRadiusInner = baseRadius - 1

  const leafProto = new Mesh(__getLeafGeo(), matLeaf)

  const pivot = new Object3D()
  const base = new Object3D()
  const vec1 = new Vector3(0, 100, 0)
  base.lookAt(vec1)
  pivot.add(base)
  //   pivot.rotation.y = 2
  function grow(
    lastChunk: Object3D,
    radius: number,
    length: number,
    growthEnergy = 0,
    isNew = false
  ) {
    growthEnergy += 0.05
    const tiltRangeLocal = tiltRange + growthEnergy
    if (radius > 1) {
      radius -= 0.3
      const newChunk = getChunk(radius, length)
      lastChunk.add(newChunk)
      // newChunk.rotation.z = detRandTreesMaple(0, Math.PI * 2)
      if (!isNew) {
        newChunk.position.z = length - 1
      }
      newChunk.rotation.x = detRandTreesMaple(-tiltRangeLocal, tiltRangeLocal)
      newChunk.rotation.y = detRandTreesMaple(-tiltRangeLocal, tiltRangeLocal)
      newChunk.rotation.z = detRandTreesMaple(0, Math.PI * 20)
      newChunk.updateMatrixWorld()
      const quat1 = new Quaternion()
      quat1.setFromEuler(newChunk.rotation)
      newChunk.lookAt(vec1)
      newChunk.quaternion.slerp(quat1, 0.85)
      grow(newChunk, radius, length, growthEnergy)
      if (detRandTreesMaple(0.05, 1) < growthEnergy - (radius - 4) * 0.2) {
        growthEnergy = -0.025
        const newGrowth = new Object3D()
        newGrowth.rotation.order = 'XYZ'
        newGrowth.rotation.x = Math.PI * 0.25
        newChunk.rotation.x = -Math.PI * 0.25
        lastChunk.add(newGrowth)
        grow(newGrowth, radius, length, growthEnergy, true)
      }
    } else {
      __addLeaves(lastChunk, leafProto, length - 1)
    }
  }
  grow(base, 6.5, 7, 0.0, true)
  pivot.rotation.y = Math.PI * -0.4
  pivot.scale.multiplyScalar(0.75)
  pivot.scale.y *= 0.7
  return mergeMeshes(pivot)
}

const __twigGeos = new Map<string, CylinderBufferGeometry>()
function __getTwigGeo(
  radiusTop: number,
  radiusBottom: number,
  length: number,
  radialSegs: number
) {
  const key = `${radiusTop}:${radiusBottom}:${length}:${radialSegs}`
  if (!__twigGeos.has(key)) {
    const twigGeo = new CylinderBufferGeometry(
      radiusTop,
      radiusBottom,
      length,
      radialSegs,
      1
    )
    const twigPosArr = twigGeo.attributes.position.array as number[]
    const vec = new Vector3()
    for (let i3 = 0; i3 < twigPosArr.length; i3 += 3) {
      vec.fromArray(twigPosArr, i3)
      vec.y += length * 0.5
      vec.toArray(twigPosArr, i3)
    }
    __twigGeos.set(key, twigGeo)
  }
  return __twigGeos.get(key)
}

let __leafGeo: BufferGeometry | undefined
function __getLeafGeo() {
  if (!__leafGeo) {
    __leafGeo = getChamferedBoxGeometry(3, 3, 4, 1)
    const posArr = __leafGeo.attributes.position.array as number[]
    const vec = new Vector3()
    for (let i3 = 0; i3 < posArr.length; i3 += 3) {
      vec.fromArray(posArr, i3)
      vec.z = (vec.z + 2) * 3
      vec.toArray(posArr, i3)
    }
  }
  return __leafGeo
}

function __addLeaves(target: Object3D, leafProto: Mesh, offsetY: number) {
  const tLeaves = 7
  const leafTilt = 0.8
  for (let i = 0; i < tLeaves; i++) {
    const a = (Math.PI * 2 * i) / tLeaves
    const x = Math.cos(a) * leafTilt
    const y = Math.sin(a) * leafTilt
    const leaf = leafProto.clone()
    leaf.position.z = offsetY
    leaf.rotation.x = x
    leaf.rotation.y = y
    target.add(leaf)
  }
}
