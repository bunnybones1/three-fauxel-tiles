export default class IHelper3D {
  getValue: (x: number, y: number, z: number) => number
  setValue: (x: number, y: number, z: number, value: number) => void
  invalidate: (x: number, y: number, z: number) => void
}
