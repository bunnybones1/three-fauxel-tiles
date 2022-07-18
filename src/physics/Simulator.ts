import { Vec2, World } from '~/vendor/Box2D/Box2D'

import IPhysicsTest from './tests/IPhysicsTest'

const HARD_STOP_AT_TICK = 2000
export default class Simulator {
  world = new World(new Vec2(0, -9.8))
  timeAllowed = 0
  timeUsed = 0
  tps = 90
  ticks = 0
  time = this.nowInSeconds()
  tickDuration = 1 / this.tps
  constructor(private nowInSeconds: () => number, private test: IPhysicsTest) {
    test.init(this.world)
  }
  update(dt: number) {
    const newTime = this.nowInSeconds()

    while (
      this.ticks < HARD_STOP_AT_TICK &&
      this.time - this.tickDuration < newTime
    ) {
      this.ticks++
      if (this.ticks === HARD_STOP_AT_TICK) {
        console.log(this.test.report())
      }
      this.world.Step(this.tickDuration, 10, 4)
      this.test.update(this.tickDuration)
      this.time += this.tickDuration
    }
    this.timeUsed += this.nowInSeconds() - newTime
    this.timeAllowed += dt
  }
  logPerformance() {
    const msg =
      ((this.timeUsed / this.timeAllowed) * 100).toFixed(2) +
      '% cpu time on simulation'
    this.timeUsed = 0
    this.timeAllowed = 0
    return msg
  }
}
