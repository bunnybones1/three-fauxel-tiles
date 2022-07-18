interface XY {
  x: number
  y: number
}
export default interface ICharacterController {
  intent: XY
  aim: XY
  aimAngle: number
  running: boolean
  requestJump: boolean
  jumpCheck: () => boolean
}
