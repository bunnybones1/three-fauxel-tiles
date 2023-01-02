import { CylinderBufferGeometry, Mesh, Object3D } from 'three'
import { getMeshMaterial } from '../helpers/materials/materialLib'
import { getCachedChamferedBoxGeometry } from '../utils/geometry'
import { detRandLogPine } from '../utils/random'

export function makeLog(radius = 8, height = 40) {
  const radiusInner = radius * 0.75
  const pivot = new Object3D()
  const wood = new Mesh(
    new CylinderBufferGeometry(radiusInner, radiusInner, height, 16, 1),
    getMeshMaterial('wood')
  )
  pivot.add(wood)

  const matBark = getMeshMaterial('bark')
  const tiltRange = 0.1

  const t = height * 5
  for (let i = 0; i < t; i++) {
    const size = ~~detRandLogPine(radius * 0.75, radius)
    const bark = new Mesh(
      getCachedChamferedBoxGeometry(1.5, size, 4, 0.5),
      matBark
    )
    bark.rotation.order = 'YXZ'
    const y = i / t - 0.5
    const angle = detRandLogPine(0, Math.PI * 2)
    bark.position.set(
      Math.cos(angle) * radius,
      y * height,
      Math.sin(angle) * radius
    )
    bark.rotation.y = -angle
    bark.rotation.x += detRandLogPine(-tiltRange, tiltRange)
    bark.rotation.y += detRandLogPine(-tiltRange, tiltRange)
    bark.rotation.z += detRandLogPine(-tiltRange, tiltRange)
    wood.add(bark)
  }
  pivot.position.y = radius
  wood.rotation.x = Math.PI * 0.5
  // obj.scale.y *= verticalScale
  return pivot
}
