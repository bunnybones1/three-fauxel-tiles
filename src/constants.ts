import { getUrlFlag, getUrlFloat, getUrlInt } from './utils/location'

export const RESET_USER_SETTINGS_TO_DEFAULTS = getUrlFlag('resetSettings')

export const initOffset = {
  x: getUrlInt('x', 0),
  y: getUrlInt('y', 0)
}

export const sunSpeed = getUrlFloat('sunSpeed', -0.001)
export const sunOffset = getUrlFloat('sunOffset', 0.5)
