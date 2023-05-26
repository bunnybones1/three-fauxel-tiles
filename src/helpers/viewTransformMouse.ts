import device from '../device'
import { getLocalStorageVec3, setLocalStorageVec3 } from '~/utils/localStorage'
import { clamp } from '~/utils/math'

const __localStorageThrottleDelay = 200

export function getMouseBoundViewTransform(storageKey = 'viewTransform') {
  let timeoutID: NodeJS.Timeout | undefined
  const transform = getLocalStorageVec3(storageKey, 0, 0, 0.1)
  function fulfillDelayedSave() {
    timeoutID = undefined
    setLocalStorageVec3(storageKey, transform)
  }
  function attemptToSaveTransform() {
    if (timeoutID === undefined) {
      setLocalStorageVec3(storageKey, transform)
      timeoutID = setTimeout(fulfillDelayedSave, __localStorageThrottleDelay)
    }
  }

  window.addEventListener('wheel', (ev) => {
    transform.x -= (ev.clientX / device.width) * 2 - 1
    transform.y -= (ev.clientY / device.height) * -2 + 1
    const relZoom = clamp((1000 + ev.deltaY) / 10000, 0.9, 1.1)
    transform.z *= relZoom
    transform.x /= relZoom
    transform.y /= relZoom
    transform.x += (ev.clientX / device.width) * 2 - 1
    transform.y += (ev.clientY / device.height) * -2 + 1
    attemptToSaveTransform()
  })
  let lastClientX = 0
  let lastClientY = 0
  function onDrag(ev: MouseEvent) {
    transform.x += ((ev.clientX - lastClientX) / device.width) * 2
    transform.y -= ((ev.clientY - lastClientY) / device.height) * 2
    lastClientX = ev.clientX
    lastClientY = ev.clientY
    attemptToSaveTransform()
  }
  function onMouseUp(ev: MouseEvent) {
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', onMouseUp)
  }
  window.addEventListener('mousedown', (ev) => {
    lastClientX = ev.clientX
    lastClientY = ev.clientY
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', onMouseUp)
  })
  return transform
}
