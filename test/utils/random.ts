export function sfc32(a: number, b: number, c: number, d: number) {
  return function deterministicRandom() {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

const genPhysics = sfc32(100, 200, 300, 444)
export function detRandPhysics(min = 0, max = 1) {
  return genPhysics() * (max - min) + min
}

const genGraphics = sfc32(100, 200, 300, 444)
export function detRandGraphics(min = 0, max = 1) {
  return genGraphics() * (max - min) + min
}

const genGrass = sfc32(100, 200, 300, 444)
export function detRandGrass(min = 0, max = 1) {
  return genGrass() * (max - min) + min
}

const genLights = sfc32(100, 200, 300, 444)
export function detRandLights(min = 0, max = 1) {
  return genLights() * (max - min) + min
}
