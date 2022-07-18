import Simulator from '~/physics/Simulator'
import IPhysicsTest from '~/physics/tests/IPhysicsTest'

let simulator: Simulator | undefined

export function getSimulator(nowInSeconds: () => number, test: IPhysicsTest) {
  if (!simulator) {
    simulator = new Simulator(nowInSeconds, test)
  }
  return simulator
}
