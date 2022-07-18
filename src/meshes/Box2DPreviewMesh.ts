import {
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  Matrix4,
  Quaternion,
  Sphere,
  Vector3
} from 'three'
import device from '~/device'
import { Box2DPreviewMaterial } from '~/materials/Box2DPreviewMaterial'
import { getUrlFlag } from '~/utils/location'
import { detRandGraphics } from '~/utils/random'
import {
  Body,
  ChainShape,
  CircleShape,
  Fixture,
  PolygonShape,
  Shape,
  ShapeType,
  Vec2,
  World
} from '~/vendor/Box2D/Box2D'

const __debugViewScale: number = 0 + 0.7
const __circleSegs = 16

const __colorMatrixVisible = new Matrix4().compose(
  new Vector3(0.5, 0.5, 0.5),
  new Quaternion(),
  new Vector3(0.5, 0.5, 0.5)
)
const __defaultQuaternion = new Quaternion()
const __defaultColorScale = new Vector3(0.5, 0.5, 0.5)

export const debugPolygonPhysics = {
  value: getUrlFlag('debugPhysicsPolygon')
}

const rand = detRandGraphics
class DebugColors {
  fixtureColors: Map<Fixture, Vector3>
  bodyMatrices: Map<Body, Matrix4>
  constructor() {
    this.fixtureColors = new Map<Fixture, Vector3>()
    this.bodyMatrices = new Map<Body, Matrix4>()
  }
  getFixtureColor(fixture: Fixture): Vector3 {
    if (!this.fixtureColors.has(fixture)) {
      const color = new Vector3(rand(), rand(), rand())
        .applyMatrix4(this.getBodyMatrix(fixture.m_body))
        .applyMatrix4(__colorMatrixVisible)
      this.fixtureColors.set(fixture, color)
      return color
    }
    return this.fixtureColors.get(fixture)!
  }
  getBodyMatrix(body: Body): Matrix4 {
    if (!this.bodyMatrices.has(body)) {
      const matrix = new Matrix4().compose(
        new Vector3(rand(), rand(), rand()),
        __defaultQuaternion,
        __defaultColorScale
      )
      this.bodyMatrices.set(body, matrix)
      return matrix
    }
    return this.bodyMatrices.get(body)!
  }
}

function getShapeWorldVerts(shape: Shape, body: Body) {
  switch (shape.m_type) {
    case ShapeType.e_polygonShape:
      if (debugPolygonPhysics.value) {
        return getPolygonShapeWorldVerts(shape as PolygonShape, body)
      } else {
        return undefined
      }
    case ShapeType.e_circleShape:
      return getCircleShapeWorldVerts(shape as CircleShape, body)
    case ShapeType.e_chainShape:
      if (debugPolygonPhysics.value) {
        return getChainShapeWorldVerts(shape as ChainShape, body)
      } else {
        return undefined
      }
    default:
      console.error('unsupported box2d shape type for debug view')
      return undefined
  }
}

function getShapeWorldVertsCount(shape: Shape) {
  switch (shape.m_type) {
    case ShapeType.e_polygonShape:
      if (debugPolygonPhysics.value) {
        return (shape as PolygonShape).m_vertices.length
      } else {
        return 0
      }
    case ShapeType.e_circleShape:
      return __circleSegs
    default:
      return 0
  }
}

function getChainShapeWorldVerts(polygon: ChainShape, body: Body) {
  return polygon.m_vertices.map((vert) => {
    const worldVert = new Vec2()
    body.GetWorldPoint(vert, worldVert)
    worldVert.x /= device.aspect
    return worldVert
  })
}

function getPolygonShapeWorldVerts(polygon: PolygonShape, body: Body) {
  return polygon.m_vertices.map((vert) => {
    const worldVert = new Vec2()
    body.GetWorldPoint(vert, worldVert)
    worldVert.x /= device.aspect
    return worldVert
  })
}

function getCircleShapeWorldVerts(circle: CircleShape, body: Body) {
  const worldVerts: Vec2[] = []
  const radius = circle.m_radius
  const offset = circle.m_p
  for (let i = 0; i < __circleSegs; i++) {
    const angle = (i / __circleSegs) * Math.PI * 2
    const vert = new Vec2(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ).SelfAdd(offset)
    const worldVert = new Vec2()
    body.GetWorldPoint(vert, worldVert)
    worldVert.x /= device.aspect
    worldVerts.push(worldVert)
  }
  return worldVerts
}

function createGeometry(
  myB2World: World,
  debugColors: DebugColors,
  offset: Vec2
) {
  let fixtureVertsCount = 0
  let body = myB2World.m_bodyList
  //measure first
  while (body) {
    let fixture = body.m_fixtureList
    while (fixture) {
      fixtureVertsCount += getShapeWorldVertsCount(fixture.m_shape) + 3
      //count + 3, to add extra vert to close shape and 2 extra verts to jump with transparency between shapes
      fixture = fixture.m_next
    }
    body = body.m_next
  }

  const geometry = new BufferGeometry()
  geometry.boundingSphere = new Sphere(undefined, Infinity)

  const posArr = new Float32Array(fixtureVertsCount * 2)
  const colArr = new Float32Array(fixtureVertsCount * 4)

  let posArrIndex = 0
  let colArrIndex = 0

  function writeVert(vert: Vec2, color: Vector3, opacity = 1) {
    posArr[posArrIndex] = vert.x
    posArr[posArrIndex + 1] = vert.y
    posArrIndex += 2
    color.toArray(colArr, colArrIndex)
    colArr[colArrIndex + 3] = opacity
    colArrIndex += 4
  }

  body = myB2World.m_bodyList
  const aspectCorrectOffset = new Vec2(offset.x / device.aspect, offset.y)
  while (body) {
    let fixture = body.m_fixtureList
    while (fixture) {
      const shape = fixture.m_shape
      const worldVerts = getShapeWorldVerts(shape, body)
      if (worldVerts) {
        if (offset.x !== 0 || offset.y !== 0) {
          for (const vert of worldVerts) {
            vert.SelfSub(aspectCorrectOffset)
          }
        }

        if (__debugViewScale !== 1) {
          for (const vert of worldVerts) {
            vert.SelfMul(__debugViewScale)
          }
        }

        const color = debugColors.getFixtureColor(fixture)
        const vert0 = worldVerts[0]

        //first double transparent vert to jump from last shape
        writeVert(vert0, color, 0)

        //do all verts in shape
        for (const worldVert of worldVerts) {
          writeVert(worldVert, color, 1)
        }

        //extra vert to close shape
        writeVert(vert0, color, 1)

        //extra transparent vert to jump to next shape
        writeVert(vert0, color, 0)
      }
      fixture = fixture.m_next
    }
    body = body.m_next
  }

  geometry.addAttribute('position', new Float32BufferAttribute(posArr, 2))
  geometry.addAttribute('color', new Float32BufferAttribute(colArr, 4))
  return geometry
}

export class Box2DPreviewMesh extends Line {
  myB2World: World
  debugColors: DebugColors
  offset: Vec2
  constructor(myB2World: World) {
    const debugColors = new DebugColors()
    const offset = new Vec2()
    super(
      createGeometry(myB2World, debugColors, offset),
      new Box2DPreviewMaterial()
    )
    this.type = 'LineSegments'
    this.debugColors = debugColors
    this.myB2World = myB2World
    this.offset = offset

    this.renderOrder = 100000
  }
  update(dt: number) {
    this.geometry.dispose()
    this.geometry = createGeometry(
      this.myB2World,
      this.debugColors,
      this.offset
    )
  }
}
