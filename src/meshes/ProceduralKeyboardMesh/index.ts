import { Mesh } from 'three'
import { materialLibrary } from '~/materials/library'
import { getChamferedBoxGeometry } from '~/utils/geometry'
import { KeyboardCodes } from '~/utils/KeyboardCodes'

import KeyButtonHoleMesh from './KeyButtonHoleMesh'
import KeyButtonMesh from './KeyButtonMesh'

const KEY_SCALE = 0.015
class KeyInfo {
  constructor(
    public label: string,
    public width: number,
    public eventCode?: KeyboardCodes
  ) {
    this.width *= KEY_SCALE
    //
  }
}
class KeySpace extends KeyInfo {
  constructor(width: number) {
    super('', width)
  }
}

export const keyInfo: KeyInfo[][] = [
  [
    new KeyInfo('ESC', 1, 'Escape'),
    new KeySpace(2),
    new KeyInfo('F1', 1, 'F1'),
    new KeyInfo('F2', 1, 'F2'),
    new KeyInfo('F3', 1, 'F3'),
    new KeyInfo('F4', 1, 'F4'),
    new KeyInfo('F5', 1, 'F5'),
    new KeyInfo('F6', 1, 'F6'),
    new KeyInfo('F7', 1, 'F7'),
    new KeyInfo('F8', 1, 'F8'),
    new KeyInfo('F9', 1, 'F9'),
    new KeyInfo('F10', 1, 'F10'),
    new KeyInfo('F11', 1, 'F11'),
    new KeyInfo('F12', 1, 'F12'),
    new KeySpace(0.5),
    new KeyInfo('PRNT SCRN', 1, 'F13'),
    new KeyInfo('SCR LK', 1, 'F14'),
    new KeyInfo('PAUSE', 1, 'F15')
  ],
  [
    new KeyInfo('~', 1, 'Backquote'),
    new KeyInfo('!\n1', 1, 'Digit1'),
    new KeyInfo('@\n2', 1, 'Digit2'),
    new KeyInfo('#\n3', 1, 'Digit3'),
    new KeyInfo('$\n4', 1, 'Digit4'),
    new KeyInfo('%\n5', 1, 'Digit5'),
    new KeyInfo('^\n6', 1, 'Digit6'),
    new KeyInfo('&\n7', 1, 'Digit7'),
    new KeyInfo('*\n8', 1, 'Digit8'),
    new KeyInfo('(\n9', 1, 'Digit9'),
    new KeyInfo(')\n0', 1, 'Digit0'),
    new KeyInfo('_\n-', 1, 'Minus'),
    new KeyInfo('+\n=', 1, 'Equal'),
    new KeyInfo('BACKSPACE', 2, 'Backspace'),
    new KeySpace(0.5),
    new KeyInfo('INS', 1, 'Insert'),
    new KeyInfo('HOME', 1, 'Home'),
    new KeyInfo('PAGE UP', 1, 'PageUp')
  ],
  [
    new KeyInfo('TAB', 1.55, 'Tab'),
    new KeyInfo('Q', 1, 'KeyQ'),
    new KeyInfo('W', 1, 'KeyW'),
    new KeyInfo('E', 1, 'KeyE'),
    new KeyInfo('R', 1, 'KeyR'),
    new KeyInfo('T', 1, 'KeyT'),
    new KeyInfo('Y', 1, 'KeyY'),
    new KeyInfo('U', 1, 'KeyU'),
    new KeyInfo('I', 1, 'KeyI'),
    new KeyInfo('O', 1, 'KeyO'),
    new KeyInfo('P', 1, 'KeyP'),
    new KeyInfo('{\n[', 1, 'BracketLeft'),
    new KeyInfo('}\n]', 1, 'BracketRight'),
    new KeyInfo('|\n\\', 1.45, 'Backslash'),
    new KeySpace(0.5),
    new KeyInfo('DEL', 1, 'Delete'),
    new KeyInfo('END', 1, 'End'),
    new KeyInfo('PAGE DOWN', 1, 'PageDown')
  ],
  [
    new KeyInfo('CAPS LCK', 1.9, 'CapsLock'),
    new KeyInfo('A', 1, 'KeyA'),
    new KeyInfo('S', 1, 'KeyS'),
    new KeyInfo('D', 1, 'KeyD'),
    new KeyInfo('F', 1, 'KeyF'),
    new KeyInfo('G', 1, 'KeyG'),
    new KeyInfo('H', 1, 'KeyH'),
    new KeyInfo('J', 1, 'KeyJ'),
    new KeyInfo('K', 1, 'KeyK'),
    new KeyInfo('L', 1, 'KeyL'),
    new KeyInfo(':\n;', 1, 'Semicolon'),
    new KeyInfo('"\n\'', 1, 'Quote'),
    new KeyInfo('ENTER', 2.25, 'Enter')
  ],
  [
    new KeyInfo('⇧', 2.65, 'ShiftLeft'),
    new KeyInfo('Z', 1, 'KeyZ'),
    new KeyInfo('X', 1, 'KeyX'),
    new KeyInfo('C', 1, 'KeyC'),
    new KeyInfo('V', 1, 'KeyV'),
    new KeyInfo('B', 1, 'KeyB'),
    new KeyInfo('N', 1, 'KeyN'),
    new KeyInfo('M', 1, 'KeyM'),
    new KeyInfo('<\n,', 1, 'Comma'),
    new KeyInfo('>\n.', 1, 'Period'),
    new KeyInfo('?\n/', 1, 'Slash'),
    new KeyInfo('⇧', 2.65, 'ShiftRight'),
    new KeySpace(0.5),
    new KeySpace(1),
    new KeyInfo('↑', 1, 'ArrowUp')
  ],
  [
    new KeyInfo('CTRL', 1.5, 'ControlLeft'),
    new KeyInfo('FN', 1, undefined),
    new KeyInfo('CMD', 1.5, 'MetaLeft'),
    new KeyInfo('ALT', 1.5, 'AltLeft'),
    new KeyInfo(' ', 5.9, 'Space'),
    new KeyInfo('ALT', 1.5, 'AltRight'),
    new KeyInfo('MENU', 1.5, 'ContextMenu'),
    new KeyInfo('CTRL', 1.5, 'ControlRight'),
    new KeySpace(0.5),
    new KeyInfo('←', 1, 'ArrowLeft'),
    new KeyInfo('↓', 1, 'ArrowDown'),
    new KeyInfo('→', 1, 'ArrowRight')
  ]
]

const width = 0.34
const height = 0.015
const depth = 0.13
export default class ProceduralKeyboardMesh extends Mesh {
  private buttonsByEventCode: Map<KeyboardCodes, Mesh>
  constructor() {
    super(
      getChamferedBoxGeometry(width, height, depth),
      materialLibrary.keyboardPlastic
    )
    this.castShadow = true
    this.receiveShadow = true
    this.renderOrder = -2
    const buttonsByEventCode = new Map<KeyboardCodes, Mesh>()

    const spacing = 0.15 * KEY_SCALE
    let cursorY = -depth * 0.5 + 0.01
    let rowIndex = 0
    for (const row of keyInfo) {
      if (rowIndex === 1) {
        cursorY += (KEY_SCALE + spacing) * 0.5
      }
      rowIndex++
      cursorY += (KEY_SCALE + spacing) * 0.5
      let cursorX = -width * 0.5 + 0.01
      for (const key of row) {
        cursorX += (key.width + spacing) * 0.5
        if (key.label !== '') {
          const keyMeshHole = new KeyButtonHoleMesh(
            key.width + 0.004,
            0.012,
            KEY_SCALE + 0.004,
            0.001
          )
          this.add(keyMeshHole)
          keyMeshHole.position.set(cursorX, height - 0.005, cursorY)
          const keyMesh = new KeyButtonMesh(
            key.width,
            0.01,
            KEY_SCALE,
            key.label,
            0.0015
          )
          if (
            key.eventCode !== undefined &&
            !buttonsByEventCode.has(key.eventCode)
          ) {
            buttonsByEventCode.set(key.eventCode, keyMesh)
          }
          this.add(keyMesh)
          keyMesh.position.set(cursorX, height - 0.0075, cursorY)
        }
        cursorX += (key.width + spacing) * 0.5
      }
      cursorY += (KEY_SCALE + spacing) * 0.5
    }
    this.buttonsByEventCode = buttonsByEventCode
    this.position.y += height
  }
  onKeyCodeEvent = (eventCode: KeyboardCodes, down: boolean) => {
    if (this.buttonsByEventCode.has(eventCode)) {
      this.buttonsByEventCode.get(eventCode)!.position.y = down
        ? height - 0.012
        : height - 0.0075
    }
  }
}
