import { Vector2 } from 'three'
import getKeyboardInput from '~/input/getKeyboardInput'
import { KeyboardCodes } from '~/utils/KeyboardCodes'

export type ValidArrowKeys =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'

const ValidArrowKeysProxy: { [K in ValidArrowKeys]: 0 } = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0
}

const ValidArrowKeysStrings = Object.keys(ValidArrowKeysProxy)

export function isValidMovementKeys(x: string): x is ValidArrowKeys {
  return ValidArrowKeysStrings.includes(x)
}

let __arrowKeysDirection: Vector2 | undefined

export function getQuickKeyboardDirectionVector() {
  if (!__arrowKeysDirection) {
    const arrowKeysDirection = new Vector2()
    __arrowKeysDirection = arrowKeysDirection
    const buttonStates: { [K in ValidArrowKeys]: boolean } = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    }

    const onKey = (key: KeyboardCodes, down: boolean) => {
      if (isValidMovementKeys(key)) {
        buttonStates[key] = down
      }
      arrowKeysDirection.x = buttonStates.ArrowLeft ? -1 : 0
      arrowKeysDirection.x += buttonStates.ArrowRight ? 1 : 0
      arrowKeysDirection.y = buttonStates.ArrowUp ? -1 : 0
      arrowKeysDirection.y += buttonStates.ArrowDown ? 1 : 0
    }
    getKeyboardInput().addListener(onKey)
  }
  return __arrowKeysDirection
}
