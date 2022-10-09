import { Material, Mesh, Object3D, Vector3 } from 'three'
import { getCachedChamferedBoxGeometry } from '../utils/geometry'
import { detRandRocks } from '../utils/random'

const tiltRange = 0.2

export function makeRocks(mat: Material, scale = 0) {
  const pivot = new Object3D()
  const pos = new Vector3()
  for (let i = 0; i < 80; i++) {
    pos
      .set(detRandRocks(-1, 1), detRandRocks(0, 1), detRandRocks(-1, 1))
      .normalize()
    if (pos.x + pos.z > 1) {
      continue
    }
    const size = ~~detRandRocks(6, 16) + scale * 0.5
    const rocks = new Mesh(
      getCachedChamferedBoxGeometry(size, 4, size * 0.5, 0.5),
      mat
    )
    rocks.rotation.z = Math.PI * -0.25
    rocks.position.copy(pos)
    rocks.position.multiplyScalar(12)
    rocks.position.y += scale - 4
    rocks.rotation.x += detRandRocks(-tiltRange, tiltRange)
    rocks.rotation.y += detRandRocks(-tiltRange, tiltRange)
    rocks.rotation.z += detRandRocks(-tiltRange, tiltRange)
    pivot.add(rocks)
  }
  pivot.rotation.y = Math.PI * -0.1
  return pivot
}
