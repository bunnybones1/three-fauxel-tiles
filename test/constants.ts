import { getUrlFlag, getUrlInt } from './utils/location'

export const RESET_USER_SETTINGS_TO_DEFAULTS = getUrlFlag('resetSettings')

export const initOffset = {
  x: getUrlInt('x', 0),
  y: getUrlInt('y', 0)
}
