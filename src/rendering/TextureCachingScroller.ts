import {
  NearestFilter,
  RepeatWrapping,
  Vector2,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { wrap } from '~/utils/math'

export default class TextureCachingScroller {
  cacheRenderTarget: WebGLRenderTarget
  lastScrollOffset = new Vector2()
  scrollOffset = new Vector2(0, 0)
  cacheResolution = new Vector2(256, 256)
  cacheDirty = true
  uvST: Vector4

  constructor(private _externalRender: (renderer: WebGLRenderer) => void) {
    //
    const uvST = new Vector4(1, 1, 0, 0)
    this.uvST = uvST
    const cacheRenderTarget = new WebGLRenderTarget(
      this.cacheResolution.x,
      this.cacheResolution.y,
      {
        magFilter: NearestFilter,
        minFilter: NearestFilter,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping
      }
    )
    this.cacheRenderTarget = cacheRenderTarget
  }
  render(renderer: WebGLRenderer, dt: number) {
    if (this.cacheDirty) {
      this._renderCache(renderer, false)
      renderer.setRenderTarget(null)
      this.cacheDirty = false
    } else if (!this.scrollOffset.equals(this.lastScrollOffset)) {
      const rTarget = this.cacheRenderTarget
      const scissor = rTarget.scissor
      const viewport = rTarget.viewport
      const res = this.cacheResolution
      let xNew = Math.round(this.scrollOffset.x)
      let xOld = Math.round(this.lastScrollOffset.x)
      let yNew = Math.round(this.scrollOffset.y)
      let yOld = Math.round(this.lastScrollOffset.y)
      let xDelta = xNew - xOld
      let yDelta = yNew - yOld

      const xDir = xNew > xOld ? 1 : -1
      if (xDelta !== 0) {
        this.uvST.z = xNew / res.x
        if (xNew < xOld) {
          const xTemp = xNew
          xNew = xOld
          xOld = xTemp
          xDelta *= -1
        }
      }
      xNew = wrap(xNew, 0, res.x)
      xOld = wrap(xOld, 0, res.x)
      const yDir = yNew > yOld ? 1 : -1
      if (yDelta !== 0) {
        this.uvST.w = yNew / res.y
        if (yNew < yOld) {
          const yTemp = yNew
          yNew = yOld
          yOld = yTemp
          yDelta *= -1
        }
      }
      yNew = wrap(yNew, 0, res.y)
      yOld = wrap(yOld, 0, res.y)

      if (xDelta !== 0) {
        const y = yDir === 1 ? yNew : yOld
        scissor.set(xOld, y, xDelta, res.y)
        viewport.set(xDir === 1 ? -res.x + xNew : xOld, y, res.x, res.y)
        if (xNew > xOld) {
          this._renderCache(renderer, undefined)

          viewport.y = y - res.y
          scissor.y = y - res.y

          this._renderCache(renderer, undefined)
        } else {
          const leapA = xDir === 1 ? res.x : 0
          const leapB = xDir === 1 ? res.x : -res.x

          scissor.x -= leapA

          this._renderCache(renderer)
          viewport.y = y - res.y
          scissor.y = y - res.y
          this._renderCache(renderer)

          scissor.x += leapB
          viewport.x += leapB

          viewport.y = y
          scissor.y = y
          this._renderCache(renderer)
          viewport.y = y - res.y
          scissor.y = y - res.y
          this._renderCache(renderer)
        }
      }
      if (yDelta !== 0) {
        scissor.set(0, yOld, res.x, yDelta)
        const x = xDir === 1 ? xNew : xOld
        viewport.set(x, yDir === 1 ? -res.y + yNew : yOld, res.x, res.y)
        if (yNew > yOld) {
          this._renderCache(renderer)

          viewport.x = x - res.x
          scissor.x = x - res.x
          this._renderCache(renderer)
        } else {
          const leapA = yDir === 1 ? res.y : 0
          const leapB = yDir === 1 ? res.y : -res.y

          scissor.y -= leapA

          this._renderCache(renderer)
          viewport.x = x - res.x
          scissor.x = x - res.x
          this._renderCache(renderer)

          scissor.y += leapB
          viewport.y += leapB

          viewport.x = x
          scissor.x = x
          this._renderCache(renderer)
          viewport.x = x - res.x
          scissor.x = x - res.x
          this._renderCache(renderer)
        }
      }
      renderer.setRenderTarget(null)
      this.lastScrollOffset.copy(this.scrollOffset)
    }
  }
  private _renderCache(
    renderer: WebGLRenderer,
    scissorTest = true,
    clearOnly = false
  ) {
    this.cacheRenderTarget.scissorTest = scissorTest
    renderer.setRenderTarget(this.cacheRenderTarget)
    renderer.clear(true, true)
    // renderer.clear(true, true)
    if (!clearOnly) {
      this._externalRender(renderer)
    }
  }
}
