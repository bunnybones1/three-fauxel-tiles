import {
  BufferAttribute,
  BufferGeometry,
  Material,
  Matrix4,
  Mesh,
  Uint16BufferAttribute,
  Vector2,
  Vector3
} from 'three'
import { Object3D } from 'three'

const __tempVec3 = new Vector3()
const __tempVec2 = new Vector2()
const __tempMat4 = new Matrix4()

export function mergeMeshes(pivot: Object3D) {
  const pivotClone = new Object3D()
  const similarMeshesByMat: Map<Material, Mesh[]> = new Map()
  //   pivot.updateMatrix()
  pivot.updateMatrixWorld(true)
  //   pivot.updateWorldMatrix(false, true)
  pivot.traverse((n) => {
    if (n instanceof Mesh) {
      if (!similarMeshesByMat.has(n.material)) {
        similarMeshesByMat.set(n.material, [n])
      } else {
        similarMeshesByMat.get(n.material)!.push(n)
      }
    }
  })
  for (const mat of similarMeshesByMat.keys()) {
    const mergedGeo = new BufferGeometry()
    const attrNames = Object.keys(
      similarMeshesByMat.get(mat)![0].geometry.attributes
    ) // ['position', 'normal', 'uv']
    const similarMeshes = similarMeshesByMat.get(mat)!
    for (const attrName of attrNames) {
      const totalCount = similarMeshes.reduce((p, c, i) => {
        return p + c.geometry.getAttribute(attrName).count
      }, 0)
      const itemSize = similarMeshes[0].geometry.getAttribute(attrName).itemSize
      const buffArr = new Float32Array(totalCount * itemSize)
      let cursor = 0
      for (const m of similarMeshes) {
        const sourceAttr = m.geometry.getAttribute(attrName) as BufferAttribute
        const sourceArr = sourceAttr.array

        switch (attrName) {
          case 'position':
            for (let i = 0; i < sourceAttr.count; i++) {
              __tempVec3.fromArray(sourceArr, i * itemSize)
              __tempVec3.applyMatrix4(m.matrixWorld)
              __tempVec3.toArray(buffArr, (cursor + i) * itemSize)
            }
            break
          case 'normal':
            __tempMat4.extractRotation(m.matrixWorld)
            for (let i = 0; i < sourceAttr.count; i++) {
              __tempVec3.fromArray(sourceArr, i * itemSize)
              __tempVec3.applyMatrix4(__tempMat4)
              __tempVec3.toArray(buffArr, (cursor + i) * itemSize)
            }
            break
          case 'uv':
            for (let i = 0; i < sourceAttr.count; i++) {
              __tempVec2.fromArray(sourceArr, i * itemSize)
              __tempVec2.toArray(buffArr, (cursor + i) * itemSize)
            }
            break
        }
        cursor += sourceAttr.count
      }
      // debugger
      mergedGeo.setAttribute(attrName, new BufferAttribute(buffArr, itemSize))
    }
    try {
      const indexCount = similarMeshes.reduce((p, c, i) => {
        return p + c.geometry.index!.count
      }, 0)
      const indexArr = new Uint16Array(indexCount)
      let indexOffset = 0
      let vertexOffset = 0
      for (const m of similarMeshes) {
        const sourceIndices = m.geometry.index!
        const sourceArr = sourceIndices.array
        for (let i = 0; i < sourceArr.length; i++) {
          indexArr[i + indexOffset] = sourceArr[i] + vertexOffset
        }
        vertexOffset += m.geometry.getAttribute('position').count
        indexOffset += sourceIndices.count
      }
      const mergedIndices = new Uint16BufferAttribute(indexArr, 1)
      mergedGeo.setIndex(mergedIndices)
    } catch (e) {
      debugger
      //
    }
    const mesh = new Mesh(mergedGeo, mat)
    mesh.frustumCulled = false
    pivotClone.add(mesh)
  }
  return pivotClone
}
