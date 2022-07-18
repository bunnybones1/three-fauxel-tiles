export function cleanAnalogValue(val: number) {
  const sign = Math.sign(val)
  return Math.max(0, Math.abs(val) * 1.2 - 0.2) * sign
}

type CB = (val: number, timestamp: number) => void
function updateVals(
  timeStamp: number,
  valsNow: number[],
  valsSrc: number[],
  callbacks: CB[][]
) {
  for (let i = 0; i < valsSrc.length; i++) {
    const val = valsSrc[i]
    if (valsNow[i] !== val && callbacks.length > i) {
      for (const cb of callbacks[i]) {
        cb(val, timeStamp)
      }
    }
    valsNow[i] = val
  }
}

export class GamePadAPI {
  private buttonsNow: number[] = []
  private buttonsCallbacks: CB[][] = []
  private axesNow: number[] = []
  private axesCallbacks: CB[][] = []
  get buttonsCount() {
    return this.buttonsCallbacks.length
  }
  get axesCount() {
    return this.axesCallbacks.length
  }
  constructor(gamePad: Gamepad) {
    let lastTimestamp = 0
    while (this.buttonsCallbacks.length < gamePad.buttons.length) {
      this.buttonsCallbacks.push([])
    }
    while (this.axesCallbacks.length < gamePad.axes.length) {
      this.axesCallbacks.push([])
    }
    setInterval(() => {
      const gamepads = navigator.getGamepads
        ? navigator.getGamepads()
        : //@ts-ignore
        navigator.webkitGetGamepads
        ? //@ts-ignore
          navigator.webkitGetGamepads()
        : []
      if (!gamepads || gamepads.length === 0) {
        return
      }
      const gamePad: Gamepad = gamepads[0]
      if (lastTimestamp !== gamePad.timestamp) {
        updateVals(
          gamePad.timestamp,
          this.buttonsNow,
          gamePad.buttons.map((b) => b.value),
          this.buttonsCallbacks
        )
        updateVals(
          gamePad.timestamp,
          this.axesNow,
          gamePad.axes as number[],
          this.axesCallbacks
        )
        lastTimestamp = gamePad.timestamp
      }
    }, 0)
  }
  listenToButton(id: number, cb: CB) {
    this.buttonsCallbacks[id].push(cb)
  }
  listenToAxis(id: number, cb: CB) {
    this.axesCallbacks[id].push(cb)
  }
}

export function rigToGamePad(callback: (controller: GamePadAPI) => void) {
  window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
    console.log(
      'Gamepad connected at index %d: %s. %d buttons, %d axes.',
      e.gamepad.index,
      e.gamepad.id,
      e.gamepad.buttons.length,
      e.gamepad.axes.length
    )
    callback(new GamePadAPI(e.gamepad))
  })
}
