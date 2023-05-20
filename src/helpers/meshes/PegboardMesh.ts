import { Mesh } from 'three'
import PegboardMeshMaterial from '../../materials/PegBoardMeshMaterial'
import PegboardGeometry from '../../geometries/PegboardGeometry'

export class PegboardMesh extends Mesh {
  constructor() {
    const geo = new PegboardGeometry()
    const mat = new PegboardMeshMaterial()
    super(geo, mat)
  }
}
