import {
  CylinderBufferGeometry,
  Material,
  Mesh,
  Object3D,
  TorusBufferGeometry
} from 'three'
import { getChamferedBoxGeometry } from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

export function makeLampPost(ironBlackMat: Material) {
  const lampPost = new Object3D()
  const ironCylinder = new Mesh(
    new CylinderBufferGeometry(0.5, 0.5, 1, 16, 1),
    ironBlackMat
  )
  const cylPosArr = ironCylinder.geometry.attributes.position.array as number[]
  for (let i = 1; i < cylPosArr.length; i += 3) {
    cylPosArr[i] += 0.5
  }
  const ring = new Mesh(
    new TorusBufferGeometry(0.45, 0.1, 32, 16),
    ironBlackMat
  )
  const lampPole = ironCylinder.clone()
  lampPost.add(lampPole)
  lampPole.scale.set(6, 12, 6)
  const lampPole2 = ironCylinder.clone()
  lampPole2.scale.set(3, 39, 3)
  lampPost.add(lampPole2)
  const middleRing = ring.clone()
  middleRing.scale.set(8, 8, 8)
  middleRing.position.y = 12
  middleRing.rotation.x = Math.PI * 0.5
  lampPost.add(middleRing)
  const middleRing2 = middleRing.clone()
  middleRing2.position.y = 2
  lampPost.add(middleRing2)
  // const middleRing3 = middleRing.clone()
  // middleRing3.position.y = 32
  // lampPost.add(middleRing3)
  const lampPole3 = lampPole2.clone()
  lampPole3.scale.set(2, 9, 2)
  lampPole3.position.y = 38
  lampPole3.rotation.z = Math.PI * -0.25
  lampPost.add(lampPole3)
  const lampPole4 = lampPole2.clone()
  lampPole4.scale.set(2, 6, 2)
  lampPole4.position.x = 6
  lampPole4.position.y = 44
  lampPole4.rotation.z = Math.PI * -0.5
  lampPost.add(lampPole4)
  const lampShade = new Mesh(getChamferedBoxGeometry(8, 4, 8, 2), ironBlackMat)
  lampShade.position.set(12, 43, 0)
  lampPost.add(lampShade)
  // const middleRing4 = middleRing.clone()
  // middleRing4.position.y = 44
  // lampPost.add(middleRing4)
  // const topper = new Mesh(new ConeBufferGeometry(10, 4, 6), ironBlackMat)
  // topper.position.y = 42
  // lampPost.add(topper)
  return mergeMeshes(lampPost)
}
