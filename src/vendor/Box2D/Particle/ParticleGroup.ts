/*
 * Copyright (c) 2013 Google, Inc.
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

// #if ENABLE_PARTICLE

// DEBUG: import { Assert } from "../Common/Settings";
import { Shape } from '../Collision/Shapes/Shape'
import { Color, RGBA } from '../Common/Draw'
import { Transform, Vec2, XY } from '../Common/Math'

import { ParticleFlag } from './Particle'
import { ParticleSystem } from './ParticleSystem'

export enum ParticleGroupFlag {
  /// Prevents overlapping or leaking.
  solidParticleGroup = 1 << 0,
  /// Keeps its shape.
  rigidParticleGroup = 1 << 1,
  /// Won't be destroyed if it gets empty.
  particleGroupCanBeEmpty = 1 << 2,
  /// Will be destroyed on next simulation step.
  particleGroupWillBeDestroyed = 1 << 3,
  /// Updates depth data on next simulation step.
  particleGroupNeedsUpdateDepth = 1 << 4,

  particleGroupInternalMask = particleGroupWillBeDestroyed |
    particleGroupNeedsUpdateDepth
}

export interface IParticleGroupDef {
  flags?: ParticleFlag
  groupFlags?: ParticleGroupFlag
  position?: XY
  angle?: number
  linearVelocity?: XY
  angularVelocity?: number
  color?: RGBA
  strength?: number
  shape?: Shape
  shapes?: Shape[]
  shapeCount?: number
  stride?: number
  particleCount?: number
  positionData?: XY[]
  lifetime?: number
  userData?: any
  group?: ParticleGroup | null
}

export class ParticleGroupDef implements IParticleGroupDef {
  flags: ParticleFlag = 0
  groupFlags: ParticleGroupFlag = 0
  readonly position: Vec2 = new Vec2()
  angle = 0.0
  readonly linearVelocity: Vec2 = new Vec2()
  angularVelocity = 0.0
  readonly color: Color = new Color()
  strength = 1.0
  shape?: Shape
  shapes?: Shape[]
  shapeCount = 0
  stride = 0
  particleCount = 0
  positionData?: Vec2[]
  lifetime = 0
  userData: any = null
  group: ParticleGroup | null = null
}

export class ParticleGroup {
  static readonly GetLinearVelocityFromWorldPoint_s_t0 = new Vec2()

  readonly m_system: ParticleSystem
  m_firstIndex = 0
  m_lastIndex = 0
  m_groupFlags: ParticleGroupFlag = 0
  m_strength = 1.0
  m_prev: ParticleGroup | null = null
  m_next: ParticleGroup | null = null
  m_timestamp = -1
  m_mass = 0.0
  m_inertia = 0.0
  readonly m_center: Vec2 = new Vec2()
  readonly m_linearVelocity: Vec2 = new Vec2()
  m_angularVelocity = 0.0
  readonly m_transform: Transform = new Transform()
  ///m_transform.SetIdentity();
  m_userData: any = null

  constructor(system: ParticleSystem) {
    this.m_system = system
  }

  GetNext(): ParticleGroup | null {
    return this.m_next
  }

  GetParticleSystem(): ParticleSystem {
    return this.m_system
  }

  GetParticleCount(): number {
    return this.m_lastIndex - this.m_firstIndex
  }

  GetBufferIndex(): number {
    return this.m_firstIndex
  }

  ContainsParticle(index: number): boolean {
    return this.m_firstIndex <= index && index < this.m_lastIndex
  }

  GetAllParticleFlags(): ParticleFlag {
    if (!this.m_system.m_flagsBuffer.data) {
      throw new Error()
    }
    let flags = 0
    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
      flags |= this.m_system.m_flagsBuffer.data[i]
    }
    return flags
  }

  GetGroupFlags(): ParticleGroupFlag {
    return this.m_groupFlags
  }

  SetGroupFlags(flags: number): void {
    // DEBUG: Assert((flags & ParticleGroupFlag.particleGroupInternalMask) === 0);
    flags |= this.m_groupFlags & ParticleGroupFlag.particleGroupInternalMask
    this.m_system.SetGroupFlags(this, flags)
  }

  GetMass(): number {
    this.UpdateStatistics()
    return this.m_mass
  }

  GetInertia(): number {
    this.UpdateStatistics()
    return this.m_inertia
  }

  GetCenter(): Readonly<Vec2> {
    this.UpdateStatistics()
    return this.m_center
  }

  GetLinearVelocity(): Readonly<Vec2> {
    this.UpdateStatistics()
    return this.m_linearVelocity
  }

  GetAngularVelocity(): number {
    this.UpdateStatistics()
    return this.m_angularVelocity
  }

  GetTransform(): Readonly<Transform> {
    return this.m_transform
  }

  GetPosition(): Readonly<Vec2> {
    return this.m_transform.p
  }

  GetAngle(): number {
    return this.m_transform.q.GetAngle()
  }

  GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T {
    const s_t0 = ParticleGroup.GetLinearVelocityFromWorldPoint_s_t0
    this.UpdateStatistics()
    ///  return m_linearVelocity + Cross(m_angularVelocity, worldPoint - m_center);
    return Vec2.AddVCrossSV(
      this.m_linearVelocity,
      this.m_angularVelocity,
      Vec2.SubVV(worldPoint, this.m_center, s_t0),
      out
    )
  }

  GetUserData(): void {
    return this.m_userData
  }

  SetUserData(data: any): void {
    this.m_userData = data
  }

  ApplyForce(force: XY): void {
    this.m_system.ApplyForce(this.m_firstIndex, this.m_lastIndex, force)
  }

  ApplyLinearImpulse(impulse: XY): void {
    this.m_system.ApplyLinearImpulse(
      this.m_firstIndex,
      this.m_lastIndex,
      impulse
    )
  }

  DestroyParticles(callDestructionListener: boolean): void {
    if (this.m_system.m_world.IsLocked()) {
      throw new Error()
    }

    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
      this.m_system.DestroyParticle(i, callDestructionListener)
    }
  }

  UpdateStatistics(): void {
    if (!this.m_system.m_positionBuffer.data) {
      throw new Error()
    }
    if (!this.m_system.m_velocityBuffer.data) {
      throw new Error()
    }
    const p = new Vec2()
    const v = new Vec2()
    if (this.m_timestamp !== this.m_system.m_timestamp) {
      const m = this.m_system.GetParticleMass()
      ///  this.m_mass = 0;
      this.m_mass = m * (this.m_lastIndex - this.m_firstIndex)
      this.m_center.SetZero()
      this.m_linearVelocity.SetZero()
      for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
        ///  this.m_mass += m;
        ///  this.m_center += m * this.m_system.m_positionBuffer.data[i];
        this.m_center.SelfMulAdd(m, this.m_system.m_positionBuffer.data[i])
        ///  this.m_linearVelocity += m * this.m_system.m_velocityBuffer.data[i];
        this.m_linearVelocity.SelfMulAdd(
          m,
          this.m_system.m_velocityBuffer.data[i]
        )
      }
      if (this.m_mass > 0) {
        const inv_mass = 1 / this.m_mass
        ///this.m_center *= 1 / this.m_mass;
        this.m_center.SelfMul(inv_mass)
        ///this.m_linearVelocity *= 1 / this.m_mass;
        this.m_linearVelocity.SelfMul(inv_mass)
      }
      this.m_inertia = 0
      this.m_angularVelocity = 0
      for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
        ///Vec2 p = this.m_system.m_positionBuffer.data[i] - this.m_center;
        Vec2.SubVV(this.m_system.m_positionBuffer.data[i], this.m_center, p)
        ///Vec2 v = this.m_system.m_velocityBuffer.data[i] - this.m_linearVelocity;
        Vec2.SubVV(
          this.m_system.m_velocityBuffer.data[i],
          this.m_linearVelocity,
          v
        )
        this.m_inertia += m * Vec2.DotVV(p, p)
        this.m_angularVelocity += m * Vec2.CrossVV(p, v)
      }
      if (this.m_inertia > 0) {
        this.m_angularVelocity *= 1 / this.m_inertia
      }
      this.m_timestamp = this.m_system.m_timestamp
    }
  }
}

// #endif
