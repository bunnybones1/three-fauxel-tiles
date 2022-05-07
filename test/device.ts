type DeviceType = 'mobile' | 'tablet' | 'desktop'
type DeviceOrientation = 'landscape' | 'portrait'

type Listener = () => void

class Device {
  width = 1920
  height = 1080
  aspect = 1920 / 1080
  deviceWidth = 1920
  deviceHeight = 1080 // landscape orientation
  deviceAspect = 1920 / 1080 // landscape orientation
  orientation: DeviceOrientation = 'landscape'
  pixelRatio = 1
  targetFPS = 60
  useTouch = false
  type: DeviceType = 'desktop'
  listeners: Set<Listener> = new Set()
  private cachedPPCm = -1

  constructor() {
    window.addEventListener('resize', () => {
      this.handleChange()

      // XXX Fix for IOS homescreen: Need to wait a little bit for the screen to settle
      setTimeout(this.handleChange, 50)
    })
    this.handleChange()
  }

  handleChange = () => {
    this.useTouch =
      /Mobi|Android|iPhone|iPad|BlackBerry|Windows Phone|webOS/i.test(
        navigator.userAgent
      )

    if (
      this.width === window.innerWidth &&
      this.height === window.innerHeight
    ) {
      return
    }

    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspect = this.width / this.height
    this.deviceHeight = Math.min(this.width, this.height)
    this.deviceWidth = Math.max(this.width, this.height)
    this.deviceAspect = this.deviceWidth / this.deviceHeight
    this.pixelRatio = window.devicePixelRatio
    this.orientation = this.aspect < 1 ? 'portrait' : 'landscape'
    this.type = this.useTouch
      ? this.deviceWidth < 1024 && this.deviceAspect > 1.6
        ? 'mobile'
        : 'tablet'
      : 'desktop'

    this.listeners.forEach((listener) => listener())
  }

  onChange(listener: Listener, firstOneForFree = false) {
    this.listeners.add(listener)
    if (firstOneForFree) {
      listener()
    }

    return () => this.listeners.delete(listener)
  }

  get isMobile() {
    return this.type === 'mobile'
  }

  get isTablet() {
    return this.type === 'tablet'
  }

  get isDesktop() {
    return this.type === 'desktop'
  }

  get pixelsPerCm() {
    if (this.cachedPPCm === -1) {
      // create an empty element
      const div = document.createElement('div')
      // give it an absolute size of one inch
      div.style.height = '1in'
      // append it to the body
      const body = document.getElementsByTagName('body')[0]
      body.appendChild(div)
      // read the computed width
      const ppi = getComputedStyle(div, null).getPropertyValue('height')
      // remove it again
      body.removeChild(div)
      // and return the value
      this.cachedPPCm = parseFloat(ppi) * 2.54
    }
    return this.cachedPPCm
  }

  get screenHeightCms() {
    return this.height / this.pixelsPerCm
  }

  get screenWidthCms() {
    return this.width / this.pixelsPerCm
  }

  get screenShorterCms() {
    return Math.min(this.width, this.height) / this.pixelsPerCm
  }

  setFPS(fps = 60) {
    this.targetFPS = fps
  }
}

const device = new Device()
;(window as any).device = device

export default device
