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

const genRocks = sfc32(100, 200, 300, 444)
export function detRandRocks(min = 0, max = 1) {
  return genRocks() * (max - min) + min
}

const genTrees = sfc32(100, 200, 300, 444)
export function detRandTrees(min = 0, max = 1) {
  return genTrees() * (max - min) + min
}

const genTreesMaple = sfc32(100, 200, 300, 444)
export function detRandTreesMaple(min = 0, max = 1) {
  return genTreesMaple() * (max - min) + min
}

const genTreesMapleStump = sfc32(100, 200, 300, 444)
export function detRandTreesMapleStump(min = 0, max = 1) {
  return genTreesMapleStump() * (max - min) + min
}

const genTreesMapleMature = sfc32(100, 200, 300, 444)
export function detRandTreesMapleMature(min = 0, max = 1) {
  return genTreesMapleMature() * (max - min) + min
}

const genTreesMapleStumpMature = sfc32(100, 200, 300, 444)
export function detRandTreesMapleStumpMature(min = 0, max = 1) {
  return genTreesMapleStumpMature() * (max - min) + min
}

const genTreesPine = sfc32(100, 200, 300, 444)
export function detRandTreesPine(min = 0, max = 1) {
  return genTreesPine() * (max - min) + min
}

const genTreesPineStump = sfc32(100, 200, 300, 444)
export function detRandTreesPineStump(min = 0, max = 1) {
  return genTreesPineStump() * (max - min) + min
}

const genTreesPineMature = sfc32(100, 200, 300, 444)
export function detRandTreesPineMature(min = 0, max = 1) {
  return genTreesPineMature() * (max - min) + min
}

const genTreesPineStumpMature = sfc32(100, 200, 300, 444)
export function detRandTreesPineStumpMature(min = 0, max = 1) {
  return genTreesPineStumpMature() * (max - min) + min
}

const genWoodPlanks = sfc32(100, 152, 353, 504)
export function detRandWoodPlanks(min = 0, max = 1) {
  return genWoodPlanks() * (max - min) + min
}
