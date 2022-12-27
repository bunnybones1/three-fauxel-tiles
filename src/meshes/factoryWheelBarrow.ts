import {
  ExtrudeBufferGeometry,
  LatheBufferGeometry,
  LatheGeometry,
  Material,
  Mesh,
  Object3D,
  RingBufferGeometry,
  Shape,
  Vector2
} from 'three'
import { getCachedChamferedBoxGeometry } from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

const C1_1 = Math.PI * 2
const C1_2 = Math.PI
const C1_4 = Math.PI * 0.5
const C1_8 = Math.PI * 0.25
const C1_16 = Math.PI * 0.125

export function makeWheelBarrow(
  matWood: Material,
  matWood2: Material,
  time = 0,
  runStrength = 1
) {
  const axelWidth = 38
  const wheelRadius = 12
  const pivot = new Object3D()
  pivot.rotation.y = Math.PI
  const u = 0.5
  const u2 = u + 0.5
  const v = 1.5
  const v2 = v + 0.5
  const points: Vector2[] = [
    [u, -v2],
    [u2, -v],
    [u2, v],
    [u, v2],
    [-u, v2],
    [-u2, v],
    [-u2, -v],
    [-u, -v2]
  ].map((v) => new Vector2(v[0] + wheelRadius, v[1]))

  points.push(points[0])

  const geometry = new LatheBufferGeometry(points, 32)
  const wheel = new Mesh(geometry, matWood)
  const axel = new Mesh(
    getCachedChamferedBoxGeometry(axelWidth, 3, 3, 1),
    matWood
  )
  axel.rotation.x = time * -Math.PI * 2 * runStrength
  const axelHousing = new Mesh(
    getCachedChamferedBoxGeometry(8, 6, 8, 1),
    matWood
  )
  axelHousing.add(axel)
  pivot.add(axelHousing)
  axel.add(wheel)
  axelHousing.position.set(0, wheelRadius + 2, 0)
  wheel.position.x = axelWidth * 0.5 - 3
  wheel.rotation.x = Math.PI * 0.5
  wheel.rotation.z = Math.PI * 0.5 + 0.05
  const spokeProto = new Mesh(
    getCachedChamferedBoxGeometry(wheelRadius, 2, 2, 0.6, -wheelRadius * 0.5),
    matWood2
  )
  const totalSpokes = 8
  for (let i = 0; i < totalSpokes; i++) {
    const ratio = i / totalSpokes
    const spoke = spokeProto.clone()
    spoke.rotation.y = ratio * Math.PI * 2
    wheel.add(spoke)
  }

  const wheel2 = wheel.clone()
  wheel2.rotation.x += Math.PI * 0.75
  wheel2.position.x *= -1
  axel.add(wheel2)

  const plankWidth = 4
  const basketLength = 32
  const basketWidth = 16
  const wallHeight = 10
  function buildWall(width: number, length: number, crossBraceOffset: number) {
    const wallPivot = new Object3D()
    const crossBraceProto = new Mesh(
      getCachedChamferedBoxGeometry(4, 2, width + crossBraceOffset, 0.6),
      matWood
    )
    crossBraceProto.rotation.y = Math.PI * 0.5
    for (let i = -0.25; i <= 0.25; i += 0.5) {
      const crossBrace = crossBraceProto.clone()
      wallPivot.add(crossBrace)
      crossBrace.position.set(0, -1, i * length)
    }
    const spacing = 1
    const plankProto = new Mesh(
      getCachedChamferedBoxGeometry(plankWidth, 2, length, 0.6),
      matWood
    )
    for (let i = width * -0.5; i <= width * 0.5; i += plankWidth + spacing) {
      const plank = plankProto.clone()
      plank.position.set(i, 1, 0)
      wallPivot.add(plank)
    }
    return wallPivot
  }

  const floor = buildWall(basketWidth, basketLength, 8)
  floor.position.y = 4
  axelHousing.add(floor)

  const sideWall = buildWall(wallHeight, basketLength, 4)
  sideWall.position.set(basketWidth * 0.5 + 4, wallHeight * 0.5 + 2, 0)
  sideWall.rotation.z = Math.PI * 0.42
  floor.add(sideWall)
  const sideWall2 = sideWall.clone()
  sideWall2.position.x *= -1
  sideWall2.rotation.z *= -1
  floor.add(sideWall2)
  floor.rotation.z = Math.cos(time * Math.PI * 2) * 0.05 * runStrength
  floor.rotation.x = Math.sin(time * Math.PI * 2) * 0.05 * runStrength

  const backWall = buildWall(wallHeight, basketLength * 0.75, 4)
  backWall.position.set(0, wallHeight * 0.5 + 2, basketLength * 0.5)
  backWall.rotation.y = Math.PI * -0.5
  backWall.rotation.z = Math.PI * 0.42
  floor.add(backWall)

  const handle = new Mesh(getCachedChamferedBoxGeometry(3, 3, 60, 1), matWood2)
  handle.position.set(basketWidth * 0.5, 2, -16)
  const handle2 = handle.clone()
  handle2.position.x *= -1
  axelHousing.add(handle2)
  axelHousing.add(handle)
  axelHousing.rotation.z = Math.sin(time * Math.PI * 4) * 0.05 * runStrength
  axelHousing.position.y += Math.cos(time * Math.PI * 4) * 0.5 * runStrength

  return mergeMeshes(pivot)
}
