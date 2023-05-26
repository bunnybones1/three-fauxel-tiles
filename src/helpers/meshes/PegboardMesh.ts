import { Mesh, Vector3 } from 'three'
import PegboardMeshMaterial from '../../materials/PegBoardMeshMaterial'
import PegboardGeometry from '../../geometries/PegboardGeometry'

export class PegboardMesh extends Mesh {
  playerCoord: Vector3
  private _geo: PegboardGeometry
  constructor(densityResolver: (x: number, y: number, z: number) => number) {
    const geo = new PegboardGeometry(densityResolver)
    const mat = new PegboardMeshMaterial({ smoothOffset: geo.smoothOffset })
    super(geo, mat)
    this.playerCoord = geo.playerCoord
    this._geo = geo
  }
  update() {
    this._geo.update()
  }
}
