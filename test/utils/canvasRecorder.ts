import {
  start,
  getContext,
  getCanvas,
  draw,
  downloadBundle,
  options
} from 'canvas-recorder/gl'
import { getUrlInt } from './location'

const recorderFrameTotal = getUrlInt('record', 0, 0, 10000)
const preroll = getUrlInt('preroll', 0, 0, 10000)
export const recorderCanvas = recorderFrameTotal ? getCanvas() : undefined
export const recorderContext = recorderFrameTotal ? getContext() : undefined
let prerollTime = 0
export function recordFrame(callback: (time: number) => void) {
  for (let i = 0; i < preroll; i++) {
    prerollTime += 1000 / 60
    callback(prerollTime)
  }
  if (recorderFrameTotal > 0) {
    draw((ctx, time, t) => callback(time + prerollTime))
    options({
      fps: 60,
      size: [2048, 2048],
      frames: recorderFrameTotal,
      onComplete: () => {
        downloadBundle()
      }
    })
    start()
  }
}
