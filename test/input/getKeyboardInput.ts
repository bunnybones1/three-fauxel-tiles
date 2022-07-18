import KeyboardInput from './KeyboardInput'

let _ki: KeyboardInput | undefined
export default function getKeyboardInput() {
  if (!_ki) {
    _ki = new KeyboardInput()
  }
  return _ki
}

export function rigToKeyboard(callback: (controller: KeyboardInput) => void) {
  let initd = false
  window.addEventListener('keydown', (e: GamepadEvent) => {
    if (initd) {
      return
    }
    initd = true
    console.log('Keyboard connected.')
    callback(getKeyboardInput())
  })
}
