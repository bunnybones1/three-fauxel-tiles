import triangulate from 'delaunay-triangulate'
import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { pointOnSphereFibonacci } from '~/utils/math'

export default class FibonacciSphereGeometry extends BufferGeometry {
  constructor(radius: number, total: number) {
    super()
    radius = radius !== undefined ? radius : 20
    total = total !== undefined ? total : 20
    const verticeArrays = []
    const vertices = []
    let i: number
    let hash: string
    let uniqueIndex: number
    for (i = 0; i < total; i++) {
      const longLat = pointOnSphereFibonacci(i, total)
      const long = longLat[0]
      const lat = longLat[1]
      const vertArr = [
        Math.cos(lat) * Math.cos(long) * radius,
        Math.sin(lat) * radius,
        Math.cos(lat) * Math.sin(long) * radius
      ]
      verticeArrays.push(vertArr)
      vertices.push(new Vector3().fromArray(vertArr))
    }
    const tetras = triangulate(verticeArrays)
    const triangles = []
    for (i = 0; i < tetras.length; i++) {
      const tetra = tetras[i]
      triangles.push(tetra[0], tetra[1], tetra[3])
      triangles.push(tetra[0], tetra[2], tetra[1])
      triangles.push(tetra[0], tetra[3], tetra[2])
      triangles.push(tetra[3], tetra[1], tetra[2])
    }
    // var temp;
    const uniques = []
    const counts = []
    let tempTri: number[] = []
    function uniqueTriOrderSort(a: number, b: number) {
      return a - b
    }
    for (i = 0; i < triangles.length; i += 3) {
      tempTri[0] = triangles[i]
      tempTri[1] = triangles[i + 1]
      tempTri[2] = triangles[i + 2]
      tempTri = tempTri.sort(uniqueTriOrderSort)
      hash = tempTri[0] + ',' + tempTri[1] + ',' + tempTri[2]
      uniqueIndex = uniques.indexOf(hash)
      if (uniqueIndex === -1) {
        uniqueIndex = uniques.length
        uniques.push(hash)
        counts.push(0)
      }
      counts[uniqueIndex]++
    }
    const indices: number[] = []
    for (i = 0; i < triangles.length; i += 3) {
      tempTri[0] = triangles[i]
      tempTri[1] = triangles[i + 1]
      tempTri[2] = triangles[i + 2]
      tempTri = tempTri.sort(uniqueTriOrderSort)
      hash = tempTri[0] + ',' + tempTri[1] + ',' + tempTri[2]
      uniqueIndex = uniques.indexOf(hash)
      if (counts[uniqueIndex] === 1) {
        indices.push(triangles[i])
        indices.push(triangles[i + 2])
        indices.push(triangles[i + 1])
        // const face = new Face3(triangles[i], triangles[i + 1], triangles[i + 2])
        // this.faces.push(face)
      }
    }
    const positionArray = new Float32Array(verticeArrays.length * 3)
    for (let i = 0; i < verticeArrays.length; i++) {
      const i3 = i * 3
      const vertArr = verticeArrays[i]
      positionArray[i3] = vertArr[0]
      positionArray[i3 + 1] = vertArr[1]
      positionArray[i3 + 2] = vertArr[2]
    }
    this.setAttribute('position', new BufferAttribute(positionArray, 3))
    this.setIndex(indices)
    // this.computeFaceNormals()
    this.computeVertexNormals()
    // this.computeTangents();
  }
}
