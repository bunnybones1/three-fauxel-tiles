import { PlaneGeometry } from 'three'
import device from '~/device'

export function createMapCacheViewPlane(
  viewWidth: number,
  viewHeight: number,
  clipspaceMode = true
) {
  const mapCacheViewPlane = new PlaneGeometry(2, 2, 1, 1)
  if (clipspaceMode) {
    const updateViewUvs = () => {
      const uvs = mapCacheViewPlane.getAttribute('uv')
      const safeWidth = 1 - 1 / viewWidth
      const safeHeight = 1 - 2 / viewHeight
      uvs.setX(1, safeWidth)
      uvs.setX(3, safeWidth)
      uvs.setY(2, 1 - safeHeight)
      uvs.setY(3, 1 - safeHeight)
      const aspect = safeWidth / safeHeight
      const aspectAspect = aspect / device.aspect
      let left = 0
      let right = safeWidth
      let top = 1
      let bottom = 1 - safeHeight
      const arr = uvs.array as Float32Array
      if (aspectAspect > 1) {
        const center = (right - left) * 0.5
        const halfSize = center / aspectAspect
        left = center - halfSize
        right = center + halfSize
      } else {
        const center = (bottom - top) * 0.5
        const halfSize = center * aspectAspect
        bottom = center + halfSize
        top = center - halfSize
      }
      arr[0] = left
      arr[1] = top
      arr[2] = right
      arr[3] = top
      arr[4] = left
      arr[5] = bottom
      arr[6] = right
      arr[7] = bottom
      uvs.needsUpdate = true
    }
    device.onChange(updateViewUvs, true)
  }
  return mapCacheViewPlane
}
