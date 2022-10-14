import {
  BufferGeometry,
  CylinderBufferGeometry,
  Material,
  Mesh,
  Object3D,
  Vector3
} from 'three'
import {
  getCachedChamferedBoxGeometry,
  getChamferedBoxGeometry
} from '../utils/geometry'
import { detRandTrees } from '../utils/random'

export function makeTreePineStumpMature(matBark: Material, matWood: Material) {
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
    const size = ~~detRandTrees(6, 8)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTrees(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2))
    const angle = detRandTrees(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.y += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.z += detRandTrees(-tiltRange, tiltRange)
    pivot.add(bark)
  }
  return pivot
}

export function makeTreePineStump(matBark: Material, matWood: Material) {
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
    const size = ~~detRandTrees(3, 5)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTrees(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2))
    const angle = detRandTrees(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.y += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.z += detRandTrees(-tiltRange, tiltRange)
    pivot.add(bark)
  }
  return pivot
}

export function makeTreePineMature(
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
    const size = ~~detRandTrees(6, 8)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTrees(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2))
    const angle = detRandTrees(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.y += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.z += detRandTrees(-tiltRange, tiltRange)
    pivot.add(bark)
  }

  //branches
  const pineNeedleProto = new Mesh(__getNeedleGeo(), matLeaf)
  const twigLength = 4
  const twigProto = new Mesh(__getTwigGeo(twigLength), matBark)
  __addPineNeedles(twigProto, pineNeedleProto, twigLength)

  const tLayer = 2
  for (let iLayer = 0; iLayer < tLayer; iLayer++) {
    const lRatio = iLayer / tLayer
    const tB = 7
    for (let iB = 0; iB < tB; iB++) {
      const bRatio = (iB + lRatio) / tB
      const aB = Math.PI * 2 * bRatio
      const branch = new Object3D()

      let lastTwig = branch
      const tTwig = 9 - iLayer * 2
      for (let iTwig = 0; iTwig < tTwig; iTwig++) {
        const twigTilt = 0.05 * iTwig
        const newTwig = twigProto.clone()
        lastTwig.add(newTwig)
        newTwig.rotation.x = detRandTrees(-twigTilt, twigTilt)
        newTwig.rotation.z = detRandTrees(-twigTilt, twigTilt)
        newTwig.rotation.y = Math.PI
        newTwig.position.y = twigLength
        lastTwig = newTwig
      }
      pivot.add(branch)
      branch.position.set(
        Math.cos(aB) * baseRadiusInner,
        25 + iLayer * 8,
        Math.sin(aB) * baseRadiusInner
      )
      branch.rotation.z = -Math.PI * 0.65
      branch.rotation.y = aB
      // branch.rotation.order = 'XZY'
    }
  }
  return pivot
}

export function makeTreePine(matBark: Material, matLeaf: Material) {
  const tiltRange = 0.1
  const height = 32
  const baseRadius = 0
  const baseRadiusInner = baseRadius - 1

  const pivot = new Object3D()
  for (let i = 0; i < 160; i++) {
    const size = ~~detRandTrees(6, 8)
    const bark = new Mesh(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark)
    bark.rotation.order = 'YXZ'
    const y = Math.pow(detRandTrees(), 2)
    const tiltAmt = Math.pow(1 - y, 4)
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2))
    const angle = detRandTrees(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.z = tiltAmt * 1
    bark.rotation.x += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.y += detRandTrees(-tiltRange, tiltRange)
    bark.rotation.z += detRandTrees(-tiltRange, tiltRange)
    pivot.add(bark)
  }

  //branches
  const twigLength = 5
  const pineNeedleProto = new Mesh(__getNeedleGeo(), matLeaf)
  const twigProto = new Mesh(__getTwigGeo(twigLength), matBark)
  __addPineNeedles(twigProto, pineNeedleProto, twigLength)

  const tLayer = 3
  for (let iLayer = 0; iLayer < tLayer; iLayer++) {
    const lRatio = iLayer / tLayer
    const tB = 9 - iLayer * 2
    for (let iB = 0; iB < tB; iB++) {
      const bRatio = (iB + lRatio) / tB
      const aB = Math.PI * 2 * bRatio
      const branch = new Object3D()

      branch.scale.multiplyScalar(0.75)
      let lastTwig = branch
      const tTwig = 7 - iLayer * 2
      for (let iTwig = 0; iTwig < tTwig; iTwig++) {
        const twigTilt = 0.05 * iTwig
        const newTwig = twigProto.clone()
        lastTwig.add(newTwig)
        newTwig.rotation.x = detRandTrees(-twigTilt, twigTilt)
        newTwig.rotation.z = detRandTrees(-twigTilt, twigTilt)
        newTwig.rotation.y = Math.PI
        newTwig.position.y = twigLength
        lastTwig = newTwig
      }
      pivot.add(branch)
      branch.position.set(
        Math.cos(aB) * baseRadiusInner,
        25 + iLayer * 8,
        Math.sin(aB) * baseRadiusInner
      )
      branch.rotation.z = -Math.PI * (0.75 + iLayer * 0.1)
      branch.rotation.y = aB
      // branch.rotation.order = 'XZY'
    }
  }

  const topperPivot = new Object3D()
  const topperProto = new Object3D()
  __addPineNeedles(topperProto, pineNeedleProto, 0)
  pivot.add(topperPivot)
  topperPivot.position.y = height + 14
  topperPivot.rotation.x = Math.PI
  for (let i = 0; i < 3; i++) {
    const newTopper = topperProto.clone()
    newTopper.rotation.y = i * Math.PI
    newTopper.position.y = i * 3
    newTopper.scale.setScalar(0.5 + i * 0.3)
    topperPivot.add(newTopper)
  }
  return pivot
}

let __needleGeo: BufferGeometry | undefined
function __getNeedleGeo() {
  if (!__needleGeo) {
    __needleGeo = getChamferedBoxGeometry(2, 4, 2, 1)
    const posArr = __needleGeo.attributes.position.array as number[]
    const vec = new Vector3()
    for (let i3 = 0; i3 < posArr.length; i3 += 3) {
      vec.fromArray(posArr, i3)
      vec.y = (vec.y + 2) * 3
      vec.toArray(posArr, i3)
    }
  }
  return __needleGeo
}

function __addPineNeedles(
  target: Object3D,
  pineNeedleProto: Mesh,
  offsetY: number
) {
  const tNeedles = 5
  const needleTilt = 0.5
  for (let i = 0; i < tNeedles; i++) {
    const a = (Math.PI * 2 * i) / tNeedles
    const x = Math.cos(a) * needleTilt
    const y = Math.sin(a) * needleTilt
    const pineNeedle = pineNeedleProto.clone()
    pineNeedle.position.y = offsetY
    pineNeedle.rotation.x = x
    pineNeedle.rotation.z = y
    target.add(pineNeedle)
  }
}

const __twigGeos = new Map<number, CylinderBufferGeometry>()
function __getTwigGeo(twigLength) {
  if (!__twigGeos.has(twigLength)) {
    const twigGeo = new CylinderBufferGeometry(1, 1, twigLength, 8, 1)
    const twigPosArr = twigGeo.attributes.position.array as number[]
    const vec = new Vector3()
    for (let i3 = 0; i3 < twigPosArr.length; i3 += 3) {
      vec.fromArray(twigPosArr, i3)
      vec.y += twigLength * 0.5
      vec.toArray(twigPosArr, i3)
    }
    __twigGeos.set(twigLength, twigGeo)
  }
  return __twigGeos.get(twigLength)
}
