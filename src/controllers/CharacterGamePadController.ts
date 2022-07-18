import { cleanAnalogValue, GamePadAPI } from '~/helpers/utils/gamePad'

import ICharacterController from './ICharacterController'

export default class CharacterGamePadController
  implements ICharacterController
{
  intent = { x: 0, y: 0 }
  aim = { x: 0, y: 0 }
  aimAngle = 0
  running: boolean
  requestJump: boolean
  constructor(gamePadAPI: GamePadAPI) {
    const aim = this.aim
    const intent = this.intent
    const aimGun = () => {
      this.aimAngle = Math.atan2(aim.y, aim.x)
    }
    gamePadAPI.listenToAxis(0, (val, timestamp) => {
      intent.x = cleanAnalogValue(val)
    })
    gamePadAPI.listenToAxis(1, (val, timestamp) => {
      intent.y = cleanAnalogValue(-val)
    })
    gamePadAPI.listenToAxis(2, (val, timestamp) => {
      aim.x = cleanAnalogValue(val)
      aimGun()
    })
    gamePadAPI.listenToAxis(3, (val, timestamp) => {
      aim.y = cleanAnalogValue(-val)
      aimGun()
    })
    gamePadAPI.listenToButton(0, (val) => {
      this.requestJump = val > 0 && this.jumpCheck()
    })
    gamePadAPI.listenToButton(2, (val) => {
      this.running = val !== 0
    })

    //quick way to check which button you pressed
    // for (let i = 0; i < controller.buttonsCount; i++) {
    // 	function p(j:number) {
    // 		controller.listenToButton(j, val => {
    // 			console.log(j, val)
    // 		})
    // 	}
    // 	p(i)
    // }
  }
  jumpCheck = () => true
}
