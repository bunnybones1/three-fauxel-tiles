import { BufferGeometry, Vector2 } from 'three'
import { createPhysicBox } from '~/physics/bodyHelpers'
import { __pixelSizeMeters } from '~/settings/physics'
import TextMesh from '~/text/TextMesh'
import { Body, BodyType, Contact, Fixture, World } from '~/vendor/Box2D/Box2D'

import { getArrNext, getArrWrap } from './arrayUtils'
import { wrap } from './math'

const offsetX = -16
const offsetY = 8

export function createPhysicBoxFromPixels(
  world: World,
  x: number,
  y: number,
  width: number,
  height: number,
  isSensor = false
) {
  createPhysicBox(
    world,
    (x + offsetX - width * 0.5) * __pixelSizeMeters,
    (-y + offsetY - height * 0.5) * __pixelSizeMeters,
    width * __pixelSizeMeters,
    height * __pixelSizeMeters,
    BodyType.staticBody,
    undefined,
    undefined,
    isSensor
  )
}

export type SensorCallback = (sensor: Fixture, rigidBody: Fixture) => void

export class ContactPair {
  sensor: Fixture
  rigidBody: Fixture
  set(sensor: Fixture, rigidBody: Fixture) {
    this.sensor = sensor
    this.rigidBody = rigidBody
    return this
  }
}

const __sharedContactPair = new ContactPair()

export function getContactBetweenSensorAndRigidBody(contact: Contact) {
  const fixtureA = contact.GetFixtureA()
  const fixtureB = contact.GetFixtureB()

  // //make sure only one of the fixtures was a sensor
  if (fixtureA.m_isSensor === fixtureB.m_isSensor) {
    return
  }

  if (fixtureA.m_isSensor) {
    return __sharedContactPair.set(fixtureA, fixtureB)
  } else {
    return __sharedContactPair.set(fixtureB, fixtureA)
  }
}

const __tempVec = new Vector2()
export function deconstructConcavePath(verts: Vector2[]) {
  const chunks: Vector2[][] = []
  let unsatisfied: Vector2[]
  let limit = 5
  do {
    unsatisfied = []
    limit--
    let chunk: Vector2[] = []
    for (let i = 0; i < verts.length; i++) {
      const a = getArrWrap(verts, i - 1)
      const b = getArrWrap(verts, i)
      const c = getArrWrap(verts, i + 1)
      const angle = __tempVec.subVectors(a, b).angle()
      const angle2 = __tempVec.subVectors(b, c).angle()
      const delta = wrap(angle2 - angle, -Math.PI, Math.PI)
      if (delta >= 0) {
        chunk.push(a, b, c)
      } else {
        unsatisfied.push(b)
        chunks.push(chunk)
        chunk = [b]
      }
    }
    chunks.push(chunk)
    verts = unsatisfied
  } while (unsatisfied.length > 3 && limit > 0)

  return chunks
    .map((verts) => Array.from(new Set(verts)))
    .filter((verts) => verts.length >= 3)
}

class AngledVec2 {
  constructor(public vec: Vector2, public angle: number) {
    //
  }
}
function updateAngle(b: AngledVec2, collection: Vector2[]) {
  const i = collection.indexOf(b.vec)
  const a = getArrWrap(collection, i - 1)
  const c = getArrWrap(collection, i + 1)
  updateAngledVec(b, a, c)
  return b
}

function updateAngledVec(av: AngledVec2, prev: Vector2, next: Vector2) {
  const angle = __tempVec.subVectors(prev, av.vec).angle()
  const angle2 = __tempVec.subVectors(av.vec, next).angle()
  av.angle = wrap(angle2 - angle, -Math.PI, Math.PI)
}

export function deconstructConcavePath2(verts: Vector2[]) {
  const chunks: Vector2[][] = []
  const unsatisfied = verts.slice()
  const angles: AngledVec2[] = verts.map((v) =>
    updateAngle(new AngledVec2(v, 0), unsatisfied)
  )
  while (unsatisfied.length >= 3) {
    angles.sort((a, b) => b.angle - a.angle)
    const best = angles.shift()!
    const i = unsatisfied.indexOf(best.vec)
    const chunk = [
      getArrWrap(unsatisfied, i - 1),
      best.vec,
      getArrWrap(unsatisfied, i + 1)
    ]
    unsatisfied.splice(i, 1)
    for (const a of angles) {
      if (chunk.indexOf(a.vec) !== -1) {
        updateAngle(a, unsatisfied)
      }
    }
    chunks.push(chunk)
  }
  // chunks.push(unsatisfied)

  return chunks
    .map((verts) => Array.from(new Set(verts)))
    .filter((verts) => verts.length >= 3)
}

class Edge {
  constructor(public v1: Vector2, public v2: Vector2) {
    //
  }
}

export function deconstructConcavePath3(verts: Vector2[]) {
  const loops = deconstructConcavePath2(verts)
  console.warn('Not done yet.')
  // const angleLoops: AngledVec2[][] = loops.map(verts => {
  //   return verts.map(v => {
  //     return updateAngle(new AngledVec2(v, 0), verts)
  //   })
  // })
  const edges = new Map<string, Edge>()
  function findOrSet(id: string, edge: Edge) {
    if (edges.has(id)) {
      return edges.get(id)
    } else {
      edges.set(id, edge)
      return undefined
    }
  }
  for (const loop of loops) {
    for (const v1 of loop) {
      const v2 = getArrNext(loop, v1)
      const id1 = verts.indexOf(v1)
      const id2 = verts.indexOf(v2)
      let other: Edge | undefined
      if (id1 < id2) {
        other = findOrSet(id1 + '-' + id2, new Edge(v1, v2))
      } else {
        other = findOrSet(id2 + '-' + id1, new Edge(v2, v1))
      }
      if (other) {
        //WIP
      }
    }
  }
  return loops
}

const VERTICAL_TEXT_PHYSICS_SCALE = 6.5
const HORIZONTAL_TEXT_PHYSICS_SCALE = 5.275
const HORIZONTAL_TRANSLATION = -0.1

export function textToPhysicsBodies(mesh: TextMesh, world: World) {
  const bodies: Body[] = []
  if (mesh.geometry instanceof BufferGeometry) {
    const verts = mesh.geometry.attributes.position.array
    const leap = mesh.geometry.attributes.position.itemSize * 4
    const pos = mesh.position
    for (let i = 0; i < verts.length; i += leap) {
      const l = verts[i + 0]
      const r = verts[i + 4]
      const t = verts[i + 1]
      const b = verts[i + 3]
      const bx: number =
        (l + r) / 2 + pos.x * __pixelSizeMeters + HORIZONTAL_TRANSLATION
      const by: number = (t + b) / 2 + pos.y * __pixelSizeMeters
      const bwidth: number = r - l
      const bheight: number = t - b

      const body = createPhysicBox(
        world,
        bx * HORIZONTAL_TEXT_PHYSICS_SCALE,
        by * HORIZONTAL_TEXT_PHYSICS_SCALE,
        bwidth * HORIZONTAL_TEXT_PHYSICS_SCALE,
        bheight * VERTICAL_TEXT_PHYSICS_SCALE
      )
      bodies.push(body)
    }
  }
  return bodies
}
