import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Uint16BufferAttribute,
  Vector3
} from 'three'
import { detRandGrass } from '../utils/random'
import { getCachedSphereGeometry } from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

const grassScale = 1

export default class GrassGeometry extends BufferGeometry {
  constructor(count = 200, balls = false) {
    super()
    const pos = new Vector3()
    const offset = new Vector3()
    if (balls) {
      const pivot = new Object3D()

      const sphereProto = new Mesh(
        getCachedSphereGeometry(4, 7, 5),
        new MeshBasicMaterial()
      )
      for (let i = 0; i < count; i++) {
        const angle = detRandGrass(-Math.PI, Math.PI)
        offset.x = Math.cos(angle) * 2 * grassScale
        offset.z = Math.sin(angle) * 2 * grassScale
        const i9 = i * 9
        const polarAngle = detRandGrass(-Math.PI, Math.PI)
        const polarDistance = (1 - Math.pow(1 - detRandGrass(0, 1), 2)) * 13
        // pos.set(detRandGrass(-16, 16), 0, detRandGrass(-16, 16))
        pos.set(
          Math.cos(polarAngle) * polarDistance,
          detRandGrass(-3, -1),
          Math.sin(polarAngle) * polarDistance
        )
        const sphere = sphereProto.clone()
        pivot.add(sphere)
        sphere.position.copy(pos)
      }
      const merged = mergeMeshes(pivot)
      const mergedGeo = (merged.children[0] as Mesh).geometry
      this.setAttribute('position', mergedGeo.getAttribute('position'))
      this.setAttribute('normal', mergedGeo.getAttribute('normal'))
      this.setIndex(mergedGeo.getIndex())
    } else {
      const itemSize = 3
      const posArr = new Float32Array(count * 3 * itemSize)

      const normalArr = new Float32Array(count * 3 * itemSize)

      const posA = new Vector3()
      const posB = new Vector3()
      const normalUp = new Vector3(0, 1, 0)
      const normal = new Vector3(0, 1, 0)
      const ab = new Vector3(0, 1, 0)
      for (let i = 0; i < count; i++) {
        const angle = detRandGrass(-Math.PI, Math.PI)
        offset.x = Math.cos(angle) * 2 * grassScale
        offset.z = Math.sin(angle) * 2 * grassScale
        const i9 = i * 9
        const polarAngle = detRandGrass(-Math.PI, Math.PI)
        const polarDistance = (1 - Math.pow(1 - detRandGrass(0, 1), 2)) * 15
        // pos.set(detRandGrass(-16, 16), 0, detRandGrass(-16, 16))
        pos.set(
          Math.cos(polarAngle) * polarDistance,
          0,
          Math.sin(polarAngle) * polarDistance
        )
        posA.copy(pos).add(offset)
        posB.copy(pos).sub(offset)
        pos.y += detRandGrass(3, 5) * grassScale
        posA.toArray(posArr, i9)
        pos.toArray(posArr, i9 + 3)
        posB.toArray(posArr, i9 + 6)

        normal.subVectors(posA, posB)
        ab.subVectors(pos, posA)
        normal.cross(ab)
        normal.normalize()

        normalUp.set(0, 1, 0)
        normalUp.lerp(normal, 0)
        normalUp.normalize()

        normalUp.toArray(normalArr, i9)
        normalUp.toArray(normalArr, i9 + 6)
        normalUp.lerp(normal, 0.1)
        normalUp.normalize()
        normalUp.toArray(normalArr, i9 + 3)
      }
      const indexArr = new Uint16Array(count * 3)
      const count3 = count * 3
      for (let i = 0; i < count3; i++) {
        indexArr[i] = i
      }
      const posAttr = new Float32BufferAttribute(posArr, itemSize)
      this.setAttribute('position', posAttr)
      const normalAttr = new Float32BufferAttribute(normalArr, itemSize)
      this.setAttribute('normal', normalAttr)
      const index = new Uint16BufferAttribute(indexArr, 1)
      this.setIndex(index)
    }
  }
}
