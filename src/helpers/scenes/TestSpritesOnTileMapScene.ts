import { Float32BufferAttribute, Points } from 'three'
import SpritesGeometry from '~/geometries/SpritesPointGeometry'
import { SpritesPointMaterial } from '~/materials/SpritesPointMaterial'
import { mod, rand2 } from '~/utils/math'
import { loadPixelatedTexture } from '~/utils/threeUtils'

import TestTileMapScene from './TestTileMapScene'

const __radiansToCardinal = 8 / (Math.PI * 2)
const __momentum = 0.001
const __minSpeed = 0.002
const __maxSpeed = 0.075
export default class TestSpritesOnTileMapScene extends TestTileMapScene {
  private _tempXyFramesAttr: Float32BufferAttribute
  private _tempAngleSpeeds: Float32Array
  private _tempVelocities: Float32Array
  private total = 1000
  constructor() {
    super()

    const scene = this.scene
    const transform = this._transform
    const tempVelocities = new Float32Array(this.total * 2)
    const tempAngleSpeeds = new Float32Array(this.total * 2)
    const speed = 0.02
    for (let i = 0; i < this.total; i++) {
      const i2 = i * 2
      const angle = (~~(Math.random() * 8) / 8) * Math.PI * 2
      tempAngleSpeeds[i2] = angle
      tempAngleSpeeds[i2 + 1] = rand2(0.01, 0.03)
      // const angle = rand(-Math.PI, Math.PI)
      tempVelocities[i2] = Math.cos(angle) * speed
      tempVelocities[i2 + 1] = Math.sin(angle) * speed
    }
    const initSpritesRenderer = async () => {
      const spriteTex = await loadPixelatedTexture(
        'game/spriteAnimations/donotcommit-player-colorless.png',
        false
      )
      const paletteTex = await loadPixelatedTexture(
        'game/colorPalettes/character.png',
        false
      )
      const geometry = new SpritesGeometry(this.total)
      const material = new SpritesPointMaterial({
        spriteTex,
        paletteTex,
        transform
      })
      this._tempXyFramesAttr = geometry.xyFrameAttr
      const sprites = new Points(geometry, material)
      sprites.frustumCulled = false
      sprites.renderOrder = 1
      scene.add(sprites)
    }
    initSpritesRenderer()
    this._transform = transform
    this._tempVelocities = tempVelocities
    this._tempAngleSpeeds = tempAngleSpeeds
  }
  update(dt: number) {
    super.update(dt)
    if (!this._tempXyFramesAttr) {
      return
    }
    const xyF = this._tempXyFramesAttr.array as Float32Array
    const vel = this._tempVelocities
    const angleSpeeds = this._tempAngleSpeeds
    const time = performance.now() * 0.002
    for (let i = 0; i < this.total; i++) {
      const running = (time * 0.2 + i * 0.001) % 2 < 0.5
      const i2 = i * 2
      const i3 = i * 3
      if (running) {
        if (angleSpeeds[i2 + 1] < __maxSpeed) {
          angleSpeeds[i2 + 1] += __momentum
        } else {
          angleSpeeds[i2 + 1] = __maxSpeed
        }
      } else {
        if (angleSpeeds[i2 + 1] > __minSpeed) {
          angleSpeeds[i2 + 1] -= __momentum
        } else {
          angleSpeeds[i2 + 1] = 0
        }
      }
      vel[i2] = Math.cos(angleSpeeds[i2]) * angleSpeeds[i2 + 1]
      vel[i2 + 1] = Math.sin(angleSpeeds[i2]) * angleSpeeds[i2 + 1]
      if (angleSpeeds[i2 + 1] > 0) {
        const dir = ~~mod(
          Math.atan2(vel[i2 + 1], vel[i2]) * __radiansToCardinal + 1.5,
          8
        )
        xyF[i3 + 2] = dir * 8 + ~~(mod(time, 1) * 6)
      } else {
        xyF[i3 + 2] = ~~(mod(time, 1) * 4) * 8 + 6
      }

      //integrate velocity and wrap around the world
      xyF[i3] = mod(xyF[i3] + vel[i2] * dt, 1)
      xyF[i3 + 1] = mod(xyF[i3 + 1] + vel[i2 + 1] * dt, 1)
    }
    this._tempXyFramesAttr.needsUpdate = true
  }
}

for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2
  const dir = mod(angle * __radiansToCardinal, 8)
  console.log(angle)
  console.log(dir)
}
