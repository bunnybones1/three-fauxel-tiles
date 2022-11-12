import { BufferGeometry, Material, Mesh, Object3D, Vector3 } from 'three'
import { longLatToXYZ, pointOnSphereFibonacci, rand2 } from '../utils/math'
import { mergeMeshes } from '../utils/mergeMeshes'

export function makeGoldPile(
  goldChunkGeo: BufferGeometry,
  goldMat: Material,
  radius = 16,
  knobs = 170,
  y = -12
) {
  const goldPile = new Object3D()
  const goldChunk = new Mesh(goldChunkGeo, goldMat)
  const pos = new Vector3()
  for (let i = 0; i < knobs; i++) {
    pos.fromArray(longLatToXYZ(pointOnSphereFibonacci(i, knobs), radius))
    if (pos.y > -y) {
      const goldCoin = goldChunk.clone()
      goldCoin.scale.y *= 0.2
      goldCoin.position.copy(pos)
      goldCoin.rotation.set(rand2(0.2), rand2(0.2), rand2(0.2))
      goldPile.add(goldCoin)
    }
  }
  goldPile.position.y += y
  return mergeMeshes(goldPile)
}
