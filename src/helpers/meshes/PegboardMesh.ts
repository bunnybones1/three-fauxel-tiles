import { Mesh, Vector3 } from 'three'
import PegboardMeshMaterial from '../../materials/PegBoardMeshMaterial'
import PegboardGeometry from '../../geometries/PegboardGeometry'

export class PegboardMesh extends Mesh {
  playerCoord: Vector3
  constructor() {
    const geo = new PegboardGeometry()
    const mat = new PegboardMeshMaterial()
    super(geo, mat)
    this.playerCoord = geo.playerCoord
  }
}
