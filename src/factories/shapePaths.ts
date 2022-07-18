import { Vector2 } from 'three'

export function makeWobblyCircleShapePath(
  radius = 0.02,
  radiusOuter = 0.03,
  t = 20,
  wobbleFreq = 3,
  phaseOffset = 0
) {
  const verts: Vector2[] = []
  const range = radiusOuter - radius
  for (let i = 0; i < t; i++) {
    const ratio = i / t
    const angle = Math.PI * 2 * (ratio + phaseOffset)
    const distance = radius + (Math.sin(angle * wobbleFreq) * 0.5 + 0.5) * range
    const v = new Vector2(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance
    )
    verts.push(v)
  }
  return verts
}
