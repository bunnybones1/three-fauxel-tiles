import { World } from '~/vendor/Box2D/Box2D'

export default interface IPhysicsTest {
  init: (world: World) => void
  update: (dt: number) => void
  report: () => string
}
