export type PBits =
  | 'environment'
  | 'hero'
  | 'heroWeapon'
  | 'enemy'
  | 'enemyWeapon'

const pBitsArr: PBits[] = [
  'environment',
  'hero',
  'heroWeapon',
  'enemy',
  'enemyWeapon'
]

export function makeBitMask(pbits: PBits[]) {
  let bitMask = 0
  for (const pbit of pbits) {
    bitMask |= Math.pow(2, pBitsArr.indexOf(pbit) + 1)
  }
  return bitMask
}
