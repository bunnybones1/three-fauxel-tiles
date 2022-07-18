import PNGLevel from '~/PNGLevel'
import { getUrlParam } from '~/utils/location'
import { createPhysicBoxFromPixels } from '~/utils/physics'

import TestPhysicsScene from './TestPhysics'

export default class TestPhysicsPNGScene extends TestPhysicsScene {
  constructor(defaultLevel = 'test', onLevelReady: () => void) {
    super()
    new PNGLevel(
      getUrlParam('level') || defaultLevel,
      createPhysicBoxFromPixels.bind(this, this.sim.world),
      onLevelReady
    )
  }
}
