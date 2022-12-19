import { Vector2 } from 'three'
import getKeyboardInput from '../input/getKeyboardInput'
import { KeyboardCodes } from '../utils/KeyboardCodes'

const __arrowKeysDirection: Map<string, Vector2> = new Map()

export function getQuickKeyboardDirectionVector(
  up: KeyboardCodes = 'ArrowUp',
  down: KeyboardCodes = 'ArrowDown',
  left: KeyboardCodes = 'ArrowLeft',
  right: KeyboardCodes = 'ArrowRight'
) {
  const key = `${up}:${down}:${left}:${right}`
  if (!__arrowKeysDirection.has(key)) {
    const arrowKeysDirection = new Vector2()
    __arrowKeysDirection.set(key, arrowKeysDirection)
    const buttonStates = {
      up: false,
      down: false,
      left: false,
      right: false
    }

    const onKey = (key: KeyboardCodes, pressed: boolean) => {
      switch (key) {
        case up:
          buttonStates.up = pressed
          break
        case down:
          buttonStates.down = pressed
          break
        case left:
          buttonStates.left = pressed
          break
        case right:
          buttonStates.right = pressed
          break
      }
      arrowKeysDirection.x = buttonStates.left ? -1 : 0
      arrowKeysDirection.x += buttonStates.right ? 1 : 0
      arrowKeysDirection.y = buttonStates.up ? -1 : 0
      arrowKeysDirection.y += buttonStates.down ? 1 : 0
    }
    getKeyboardInput().addListener(onKey)
  }
  return __arrowKeysDirection.get(key)!
}
