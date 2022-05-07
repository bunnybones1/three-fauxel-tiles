import { Color, Vector3 } from 'three'

import { hexColor } from './colors'
import { clamp } from './math'

export function getLocalStorageParam(key: string) {
  return localStorage.getItem(key)
}

export function setLocalStorageParam(key: string, val: string) {
  return localStorage.setItem(key, val)
}

export function getLocalStorageFlag(key: string) {
  const result = getLocalStorageParam(key)
  return !!(result === '' || (result && result !== 'false'))
}

export function setLocalStorageFlag(key: string, val: boolean) {
  setLocalStorageParam(key, val ? 'true' : 'false')
}

function __getLocalStorageNumber(
  key: string,
  defaultVal: number,
  parser: (val: string) => number,
  min = -Infinity,
  max = Infinity
) {
  return clamp(
    parser(getLocalStorageParam(key) || defaultVal.toString()),
    min,
    max
  )
}

function __setLocalStorageNumber(key: string, val: number) {
  return setLocalStorageParam(key, val.toString())
}

export function getLocalStorageFloat(
  key: string,
  defaultVal: number,
  min = -Infinity,
  max = Infinity
) {
  return __getLocalStorageNumber(key, defaultVal, parseFloat, min, max)
}
export function setLocalStorageFloat(key: string, val: number) {
  return __setLocalStorageNumber(key, val)
}

export function getLocalStorageInt(
  key: string,
  defaultVal: number,
  min = -Infinity,
  max = Infinity
) {
  return __getLocalStorageNumber(key, defaultVal, parseInt, min, max)
}
export function setLocalStorageInt(key: string, val: number) {
  return __setLocalStorageNumber(key, val)
}

export function getLocalStorageColor(key: string, defaultColor: string) {
  let str = getLocalStorageParam(key)
  if (!str) {
    str = defaultColor
  }
  return hexColor('#' + str)
}

export function setLocalStorageColor(key: string, color: Color) {
  setLocalStorageParam(key, color.getHexString())
}

export function getLocalStorageVec3(
  key: string,
  defX = 0,
  defY = 0,
  defZ = 0,
  min = -Infinity,
  max = Infinity
) {
  const x = getLocalStorageFloat(key + '.x', defX, min, max)
  const y = getLocalStorageFloat(key + '.y', defY, min, max)
  const z = getLocalStorageFloat(key + '.z', defZ, min, max)
  return new Vector3(x, y, z)
}

export function setLocalStorageVec3(key: string, val: Vector3) {
  setLocalStorageFloat(key + '.x', val.x)
  setLocalStorageFloat(key + '.y', val.y)
  setLocalStorageFloat(key + '.z', val.z)
}
