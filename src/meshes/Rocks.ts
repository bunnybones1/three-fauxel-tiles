import { Material, Mesh, Object3D } from 'three'
import RocksGeometry from '../geometries/RocksGeometry'
import { getChamferedBoxGeometry } from '../utils/geometry'

export default class Rocks extends Object3D {
  constructor(mat: Material, s = 14) {
    super()
    // super(new RocksGeometry(), mat)
    const rocks = new Mesh(new RocksGeometry(), mat)
    rocks.name = 'rocks'
    this.add(rocks)
  }
}
