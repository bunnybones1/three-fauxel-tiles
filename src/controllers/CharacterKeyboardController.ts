import KeyboardInput from '~/input/KeyboardInput'

import ICharacterController from './ICharacterController'

const __diagStrength = Math.cos(Math.PI * 0.25)

class VirtualAxis {
  up = false
  down = false
  left = false
  right = false
  constructor() {
    //
  }
  get x() {
    let val = 0
    if (this.left) {
      val -= 1
    }
    if (this.right) {
      val += 1
    }
    if (this.up !== this.down) {
      val *= __diagStrength
    }
    return val
  }
  get y() {
    let val = 0
    if (this.down) {
      val -= 1
    }
    if (this.up) {
      val += 1
    }
    if (this.left !== this.right) {
      val *= __diagStrength
    }
    return val
  }
}

export default class CharacterKeyboardController
  implements ICharacterController
{
  get aimAngle() {
    return Math.atan2(this.aim.y, this.aim.x)
  }
  intent = new VirtualAxis()
  aim = new VirtualAxis()
  running: boolean
  requestJump: boolean
  constructor(keyboardInput: KeyboardInput, swapIntentAndAim = false) {
    const aim = swapIntentAndAim ? this.intent : this.aim
    const intent = swapIntentAndAim ? this.aim : this.intent
    keyboardInput.addListener((k, pressed) => {
      switch (k) {
        case 'ArrowUp':
          aim.up = pressed
          break
        case 'ArrowDown':
          aim.down = pressed
          break
        case 'ArrowLeft':
          aim.left = pressed
          break
        case 'ArrowRight':
          aim.right = pressed
          break
        case 'KeyW':
          intent.up = pressed
          break
        case 'KeyS':
          intent.down = pressed
          break
        case 'KeyA':
          intent.left = pressed
          break
        case 'KeyD':
          intent.right = pressed
          break
        case 'Space':
          this.requestJump = pressed && this.jumpCheck()
          break
        case 'ShiftLeft':
          this.running = pressed
          break
      }
    })
  }
  jumpCheck = () => true
}
