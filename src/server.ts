import { performance } from 'perf_hooks'
import BasicBalls from '~/physics/tests/BasicBalls'

import { getSimulator } from './helpers/physics/simulator'

function nowInSeconds() {
  return performance.now() * 0.001
}

const sim = getSimulator(nowInSeconds, new BasicBalls())
const dtMs = 100

setInterval(function tick() {
  sim.update(dtMs * 0.001)
}, dtMs)

setInterval(function log() {
  console.log(sim.logPerformance())
}, 2000)
