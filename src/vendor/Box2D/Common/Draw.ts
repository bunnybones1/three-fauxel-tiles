/*
 * Copyright (c) 2011 Erin Catto http://box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

import { Transform, XY } from './Math'

export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}

/// Color for debug drawing. Each value has the range [0,1].
export class Color implements RGBA {
  static readonly ZERO: Readonly<Color> = new Color(0, 0, 0, 0)

  static readonly RED: Readonly<Color> = new Color(1, 0, 0)
  static readonly GREEN: Readonly<Color> = new Color(0, 1, 0)
  static readonly BLUE: Readonly<Color> = new Color(0, 0, 1)

  static MixColors(colorA: RGBA, colorB: RGBA, strength: number): void {
    const dr = strength * (colorB.r - colorA.r)
    const dg = strength * (colorB.g - colorA.g)
    const db = strength * (colorB.b - colorA.b)
    const da = strength * (colorB.a - colorA.a)
    colorA.r += dr
    colorA.g += dg
    colorA.b += db
    colorA.a += da
    colorB.r -= dr
    colorB.g -= dg
    colorB.b -= db
    colorB.a -= da
  }

  static MakeStyleString(r: number, g: number, b: number, a = 1.0): string {
    // function clamp(x: number, lo: number, hi: number) { return x < lo ? lo : hi < x ? hi : x; }
    r *= 255 // r = clamp(r, 0, 255);
    g *= 255 // g = clamp(g, 0, 255);
    b *= 255 // b = clamp(b, 0, 255);
    // a = clamp(a, 0, 1);
    if (a < 1) {
      return `rgba(${r},${g},${b},${a})`
    } else {
      return `rgb(${r},${g},${b})`
    }
  }

  r: number
  g: number
  b: number
  a: number

  constructor(rr = 0.5, gg = 0.5, bb = 0.5, aa = 1.0) {
    this.r = rr
    this.g = gg
    this.b = bb
    this.a = aa
  }

  Clone(): Color {
    return new Color().Copy(this)
  }

  Copy(other: RGBA): this {
    this.r = other.r
    this.g = other.g
    this.b = other.b
    this.a = other.a
    return this
  }

  IsEqual(color: RGBA): boolean {
    return (
      this.r === color.r &&
      this.g === color.g &&
      this.b === color.b &&
      this.a === color.a
    )
  }

  IsZero(): boolean {
    return this.r === 0 && this.g === 0 && this.b === 0 && this.a === 0
  }

  Set(r: number, g: number, b: number, a: number = this.a): void {
    this.SetRGBA(r, g, b, a)
  }

  SetByteRGB(r: number, g: number, b: number): this {
    this.r = r / 0xff
    this.g = g / 0xff
    this.b = b / 0xff
    return this
  }

  SetByteRGBA(r: number, g: number, b: number, a: number): this {
    this.r = r / 0xff
    this.g = g / 0xff
    this.b = b / 0xff
    this.a = a / 0xff
    return this
  }

  SetRGB(rr: number, gg: number, bb: number): this {
    this.r = rr
    this.g = gg
    this.b = bb
    return this
  }

  SetRGBA(rr: number, gg: number, bb: number, aa: number): this {
    this.r = rr
    this.g = gg
    this.b = bb
    this.a = aa
    return this
  }

  SelfAdd(color: RGBA): this {
    this.r += color.r
    this.g += color.g
    this.b += color.b
    this.a += color.a
    return this
  }

  Add<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r + color.r
    out.g = this.g + color.g
    out.b = this.b + color.b
    out.a = this.a + color.a
    return out
  }

  SelfSub(color: RGBA): this {
    this.r -= color.r
    this.g -= color.g
    this.b -= color.b
    this.a -= color.a
    return this
  }

  Sub<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r - color.r
    out.g = this.g - color.g
    out.b = this.b - color.b
    out.a = this.a - color.a
    return out
  }

  SelfMul(s: number): this {
    this.r *= s
    this.g *= s
    this.b *= s
    this.a *= s
    return this
  }

  Mul<T extends RGBA>(s: number, out: T): T {
    out.r = this.r * s
    out.g = this.g * s
    out.b = this.b * s
    out.a = this.a * s
    return out
  }

  Mix(mixColor: RGBA, strength: number): void {
    Color.MixColors(this, mixColor, strength)
  }

  MakeStyleString(alpha: number = this.a): string {
    return Color.MakeStyleString(this.r, this.g, this.b, alpha)
  }
}

export enum DrawFlags {
  e_none = 0,
  e_shapeBit = 0x0001, ///< draw shapes
  e_jointBit = 0x0002, ///< draw joint connections
  e_aabbBit = 0x0004, ///< draw axis aligned bounding boxes
  e_pairBit = 0x0008, ///< draw broad-phase pairs
  e_centerOfMassBit = 0x0010, ///< draw center of mass frame
  // #if ENABLE_PARTICLE
  e_particleBit = 0x0020, ///< draw particles
  // #endif
  e_controllerBit = 0x0040, /// @see Controller list
  e_all = 0x003f
}

/// Implement and register this class with a World to provide debug drawing of physics
/// entities in your game.
export abstract class Draw {
  m_drawFlags: DrawFlags = 0

  SetFlags(flags: DrawFlags): void {
    this.m_drawFlags = flags
  }

  GetFlags(): DrawFlags {
    return this.m_drawFlags
  }

  AppendFlags(flags: DrawFlags): void {
    this.m_drawFlags |= flags
  }

  ClearFlags(flags: DrawFlags): void {
    this.m_drawFlags &= ~flags
  }

  abstract PushTransform(xf: Transform): void

  abstract PopTransform(xf: Transform): void

  abstract DrawPolygon(vertices: XY[], vertexCount: number, color: RGBA): void

  abstract DrawSolidPolygon(
    vertices: XY[],
    vertexCount: number,
    color: RGBA
  ): void

  abstract DrawCircle(center: XY, radius: number, color: RGBA): void

  abstract DrawSolidCircle(
    center: XY,
    radius: number,
    axis: XY,
    color: RGBA
  ): void

  // #if ENABLE_PARTICLE
  abstract DrawParticles(
    centers: XY[],
    radius: number,
    colors: RGBA[] | null,
    count: number
  ): void
  // #endif

  abstract DrawSegment(p1: XY, p2: XY, color: RGBA): void

  abstract DrawTransform(xf: Transform): void

  abstract DrawPoint(p: XY, size: number, color: RGBA): void
}
