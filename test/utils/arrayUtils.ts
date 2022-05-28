import { absFloor, clamp } from './math'
export const scaleValuesInArray = (arr: number[], scale: number) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= scale
  }
}

export const addToArrayUnique = <T>(arr: T[], value: T) => {
  const index = arr.indexOf(value)
  if (index === -1) {
    arr.push(value)
  }
}

export const removeFromArray = <T>(arr: T[], value: T, strict = false) => {
  const index = arr.indexOf(value)
  if (index !== -1) {
    arr.splice(index, 1)
  } else if (strict) {
    throw new Error('could not find value in array')
  }
  return value
}

export const moveBetweenArrays = <T>(src: T[], dst: T[], value: T) => {
  dst.push(removeFromArray(src, value))
  return value
}

export const replaceManyInArray = <T>(
  arr: Array<T | undefined>,
  value: T,
  replacement?: T
) => {
  if (value === replacement) {
    throw new Error('Nope. This would cause an infinite loop')
  }
  let index = arr.indexOf(value)
  while (index !== -1) {
    arr[index] = replacement
    index = arr.indexOf(value)
  }
}

export function getArrayDiffs<T>(oldArr: T[], newArr: T[]) {
  const added = newArr.filter((item) => !oldArr.includes(item))

  const removed = oldArr.filter((item) => !newArr.includes(item))

  const equal = newArr.filter((item) => oldArr.includes(item))

  return {
    added,
    removed,
    equal
  }
}

export const pushToArrayMap = <T, T2>(
  map: Map<T, T2[]>,
  key: T,
  value: T2,
  oneCopyMax = false
) => {
  if (!map.has(key)) {
    map.set(key, [])
  }
  const arr = map.get(key) as T2[]
  if (arr) {
    if (oneCopyMax) {
      if (arr.indexOf(value) === -1) {
        arr.push(value)
      }
    } else {
      arr.push(value)
    }
  }
}

export const cleanRemoveFromArrayMap = <T, T2>(
  map: Map<T, T2[]>,
  key: T,
  value: T2
) => {
  if (!map.has(key)) {
    return
  }
  const arr = map.get(key) as T2[]
  if (arr) {
    removeFromArray(arr, value)
    if (arr.length === 0) {
      map.delete(key)
    }
  }
}

function signMatches(val: number, val2: number) {
  return val >= 0 === val2 >= 0
}
//binary search only works assuming numbers have been sorted from lowest to highest
export function findClosestNumberIndex(arr: number[], value: number): number {
  const middleIndex = ~~(arr.length * 0.5)
  let step = value > arr[middleIndex] ? 1 : -1
  let index = middleIndex
  let oldSample = arr[index]
  let everTurned = false
  let limit = 100
  while (step !== 0 && limit > 0) {
    index = clamp(index + step, 0, arr.length - 1)
    const newSample = arr[index]
    if (!signMatches(value - newSample, value - oldSample)) {
      step *= -1
      everTurned = true
    }
    step = absFloor(step * (everTurned ? 0.5 : 2))
    oldSample = newSample
    limit--
  }
  return index
}

export function getArrWrap<T>(arr: T[], i: number) {
  const t = arr.length
  return arr[((i % t) + t) % t]
}

export function getArrNext<T>(arr: T[], item: T) {
  return getArrWrap(arr, arr.indexOf(item) + 1)
}

export function getArrPrev<T>(arr: T[], item: T) {
  return getArrWrap(arr, arr.indexOf(item) - 1)
}

export function getArrAround<T>(arr: T[], item: T) {
  const i = arr.indexOf(item)
  return [getArrWrap(arr, i - 1), item, getArrWrap(arr, i + 1)]
}
