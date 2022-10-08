import { BufferGeometry, Vector3 } from 'three'

export default class PyramidGeometry extends BufferGeometry {
  constructor() {
    super()
    const vc = new Vector3(0, 1, 0)
    const vlt = new Vector3(-0.5, 0, -0.5)
    const vlb = new Vector3(-0.5, 0, 0.5)
    const vrb = new Vector3(0.5, 0, 0.5)
    const vrt = new Vector3(0.5, 0, -0.5)

    const pts = [
        vc, vlt, vlb,
        vc, vlb, vrb,
        vc, vrb, vrt,
        vc, vrt, vlt,
    ]

    this.setFromPoints(pts)
    this.computeVertexNormals()
  }
}
