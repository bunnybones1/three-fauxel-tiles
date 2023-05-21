import getKeyboardInput from '../input/getKeyboardInput'
import { KeyboardCodes } from '../utils/KeyboardCodes'

const __elevationKeysDirection: Map<string, { val: number }> = new Map()

export function getQuickKeyboardDirectionElevation(
  up: KeyboardCodes = 'PageUp',
  down: KeyboardCodes = 'PageDown'
) {
  const key = `${up}:${down}`
  if (!__elevationKeysDirection.has(key)) {
    const arrowKeysDirection = { val: 0 }
    __elevationKeysDirection.set(key, arrowKeysDirection)
    const buttonStates = {
      up: false,
      down: false
    }

    const onKey = (key: KeyboardCodes, pressed: boolean) => {
      switch (key) {
        case up:
          buttonStates.up = pressed
          break
        case down:
          buttonStates.down = pressed
          break
      }
      arrowKeysDirection.val = buttonStates.up ? -1 : 0
      arrowKeysDirection.val += buttonStates.down ? 1 : 0
    }
    getKeyboardInput().addListener(onKey)
  }
  return __elevationKeysDirection.get(key)!
}
