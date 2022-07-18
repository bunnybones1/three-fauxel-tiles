import { removeFromArray } from '~/utils/arrayUtils'
import { KeyboardCodes } from '~/utils/KeyboardCodes'

export type KeyCodeListener = (code: KeyboardCodes, down: boolean) => void
export default class KeyboardInput {
  private _listeners: KeyCodeListener[] = []
  private _keyStates = new Map<KeyboardCodes, boolean>()
  constructor(private _preventDefault = false) {
    window.addEventListener('keydown', (ev) => this.onKeyEvent(ev, true))
    window.addEventListener('keyup', (ev) => this.onKeyEvent(ev, false))
  }
  addListener(listener: KeyCodeListener) {
    this._listeners.push(listener)
  }
  removeListener(listener: KeyCodeListener) {
    removeFromArray(this._listeners, listener)
  }
  private onKeyEvent = (ev: KeyboardEvent, down: boolean) => {
    const eventCode = ev.code as KeyboardCodes
    if (this._preventDefault) {
      ev.preventDefault()
    }
    this._keyStates.set(eventCode, down)
    for (const listener of this._listeners) {
      listener(eventCode, down)
    }
  }
}
