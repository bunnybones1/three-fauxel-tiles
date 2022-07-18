/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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

import { Clamp, Mat22, Rot, Vec2, XY } from '../../Common/Math'
import { Maybe } from '../../Common/Settings'
import { Body } from '../Body'
import { SolverData } from '../TimeStep'

import { IJointDef, Joint, JointDef, JointType } from './Joint'

export interface IFrictionJointDef extends IJointDef {
  localAnchorA: XY

  localAnchorB: XY

  maxForce?: number

  maxTorque?: number
}

/// Friction joint definition.
export class FrictionJointDef extends JointDef implements IFrictionJointDef {
  readonly localAnchorA: Vec2 = new Vec2()

  readonly localAnchorB: Vec2 = new Vec2()

  maxForce = 0

  maxTorque = 0

  constructor() {
    super(JointType.e_frictionJoint)
  }

  Initialize(bA: Body, bB: Body, anchor: Vec2): void {
    this.bodyA = bA
    this.bodyB = bB
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA)
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB)
  }
}

export class FrictionJoint extends Joint {
  private static SolveVelocityConstraints_s_Cdot_v2 = new Vec2()
  private static SolveVelocityConstraints_s_impulseV = new Vec2()
  private static SolveVelocityConstraints_s_oldImpulseV = new Vec2()
  readonly m_localAnchorA: Vec2 = new Vec2()
  readonly m_localAnchorB: Vec2 = new Vec2()

  // Solver shared
  readonly m_linearImpulse: Vec2 = new Vec2()
  m_angularImpulse = 0
  m_maxForce = 0
  m_maxTorque = 0

  // Solver temp
  m_indexA = 0
  m_indexB = 0
  readonly m_rA: Vec2 = new Vec2()
  readonly m_rB: Vec2 = new Vec2()
  readonly m_localCenterA: Vec2 = new Vec2()
  readonly m_localCenterB: Vec2 = new Vec2()
  m_invMassA = 0
  m_invMassB = 0
  m_invIA = 0
  m_invIB = 0
  readonly m_linearMass: Mat22 = new Mat22()
  m_angularMass = 0

  readonly m_qA: Rot = new Rot()
  readonly m_qB: Rot = new Rot()
  readonly m_lalcA: Vec2 = new Vec2()
  readonly m_lalcB: Vec2 = new Vec2()
  readonly m_K: Mat22 = new Mat22()

  constructor(def: IFrictionJointDef) {
    super(def)

    this.m_localAnchorA.Copy(def.localAnchorA)
    this.m_localAnchorB.Copy(def.localAnchorB)

    this.m_linearImpulse.SetZero()
    this.m_maxForce = Maybe(def.maxForce, 0)
    this.m_maxTorque = Maybe(def.maxTorque, 0)

    this.m_linearMass.SetZero()
  }

  InitVelocityConstraints(data: SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex
    this.m_indexB = this.m_bodyB.m_islandIndex
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter)
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter)
    this.m_invMassA = this.m_bodyA.m_invMass
    this.m_invMassB = this.m_bodyB.m_invMass
    this.m_invIA = this.m_bodyA.m_invI
    this.m_invIB = this.m_bodyB.m_invI

    // const cA: Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a
    const vA: Vec2 = data.velocities[this.m_indexA].v
    let wA: number = data.velocities[this.m_indexA].w

    // const cB: Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a
    const vB: Vec2 = data.velocities[this.m_indexB].v
    let wB: number = data.velocities[this.m_indexB].w

    // const qA: Rot = new Rot(aA), qB: Rot = new Rot(aB);
    const qA: Rot = this.m_qA.SetAngle(aA)
    const qB: Rot = this.m_qB.SetAngle(aB)

    // Compute the effective mass matrix.
    // m_rA = Mul(qA, m_localAnchorA - m_localCenterA);
    Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA)
    const rA: Vec2 = Rot.MulRV(qA, this.m_lalcA, this.m_rA)
    // m_rB = Mul(qB, m_localAnchorB - m_localCenterB);
    Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB)
    const rB: Vec2 = Rot.MulRV(qB, this.m_lalcB, this.m_rB)

    // J = [-I -r1_skew I r2_skew]
    //     [ 0       -1 0       1]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
    //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
    //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

    const mA: number = this.m_invMassA
    const mB: number = this.m_invMassB
    const iA: number = this.m_invIA
    const iB: number = this.m_invIB

    const K: Mat22 = this.m_K // new Mat22();
    K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y
    K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y
    K.ey.x = K.ex.y
    K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x

    K.GetInverse(this.m_linearMass)

    this.m_angularMass = iA + iB
    if (this.m_angularMass > 0) {
      this.m_angularMass = 1 / this.m_angularMass
    }

    if (data.step.warmStarting) {
      // Scale impulses to support a variable time step.
      // m_linearImpulse *= data.step.dtRatio;
      this.m_linearImpulse.SelfMul(data.step.dtRatio)
      this.m_angularImpulse *= data.step.dtRatio

      // const P: Vec2(m_linearImpulse.x, m_linearImpulse.y);
      const P: Vec2 = this.m_linearImpulse

      // vA -= mA * P;
      vA.SelfMulSub(mA, P)
      // wA -= iA * (Cross(m_rA, P) + m_angularImpulse);
      wA -= iA * (Vec2.CrossVV(this.m_rA, P) + this.m_angularImpulse)
      // vB += mB * P;
      vB.SelfMulAdd(mB, P)
      // wB += iB * (Cross(m_rB, P) + m_angularImpulse);
      wB += iB * (Vec2.CrossVV(this.m_rB, P) + this.m_angularImpulse)
    } else {
      this.m_linearImpulse.SetZero()
      this.m_angularImpulse = 0
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB
  }
  SolveVelocityConstraints(data: SolverData): void {
    const vA: Vec2 = data.velocities[this.m_indexA].v
    let wA: number = data.velocities[this.m_indexA].w
    const vB: Vec2 = data.velocities[this.m_indexB].v
    let wB: number = data.velocities[this.m_indexB].w

    const mA: number = this.m_invMassA
    const mB: number = this.m_invMassB
    const iA: number = this.m_invIA
    const iB: number = this.m_invIB

    const h: number = data.step.dt

    // Solve angular friction
    {
      const Cdot: number = wB - wA
      let impulse: number = -this.m_angularMass * Cdot

      const oldImpulse: number = this.m_angularImpulse
      const maxImpulse: number = h * this.m_maxTorque
      this.m_angularImpulse = Clamp(
        this.m_angularImpulse + impulse,
        -maxImpulse,
        maxImpulse
      )
      impulse = this.m_angularImpulse - oldImpulse

      wA -= iA * impulse
      wB += iB * impulse
    }

    // Solve linear friction
    {
      // Vec2 Cdot = vB + Cross(wB, m_rB) - vA - Cross(wA, m_rA);
      const Cdot_v2: Vec2 = Vec2.SubVV(
        Vec2.AddVCrossSV(vB, wB, this.m_rB, Vec2.s_t0),
        Vec2.AddVCrossSV(vA, wA, this.m_rA, Vec2.s_t1),
        FrictionJoint.SolveVelocityConstraints_s_Cdot_v2
      )

      // Vec2 impulse = -Mul(m_linearMass, Cdot);
      const impulseV: Vec2 = Mat22.MulMV(
        this.m_linearMass,
        Cdot_v2,
        FrictionJoint.SolveVelocityConstraints_s_impulseV
      ).SelfNeg()
      // Vec2 oldImpulse = m_linearImpulse;
      const oldImpulseV =
        FrictionJoint.SolveVelocityConstraints_s_oldImpulseV.Copy(
          this.m_linearImpulse
        )
      // m_linearImpulse += impulse;
      this.m_linearImpulse.SelfAdd(impulseV)

      const maxImpulse: number = h * this.m_maxForce

      if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
        this.m_linearImpulse.Normalize()
        this.m_linearImpulse.SelfMul(maxImpulse)
      }

      // impulse = m_linearImpulse - oldImpulse;
      Vec2.SubVV(this.m_linearImpulse, oldImpulseV, impulseV)

      // vA -= mA * impulse;
      vA.SelfMulSub(mA, impulseV)
      // wA -= iA * Cross(m_rA, impulse);
      wA -= iA * Vec2.CrossVV(this.m_rA, impulseV)

      // vB += mB * impulse;
      vB.SelfMulAdd(mB, impulseV)
      // wB += iB * Cross(m_rB, impulse);
      wB += iB * Vec2.CrossVV(this.m_rB, impulseV)
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB
  }

  SolvePositionConstraints(data: SolverData): boolean {
    return true
  }

  GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out)
  }

  GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out)
  }

  GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    out.x = inv_dt * this.m_linearImpulse.x
    out.y = inv_dt * this.m_linearImpulse.y
    return out
  }

  GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_angularImpulse
  }

  GetLocalAnchorA(): Readonly<Vec2> {
    return this.m_localAnchorA
  }

  GetLocalAnchorB(): Readonly<Vec2> {
    return this.m_localAnchorB
  }

  SetMaxForce(force: number): void {
    this.m_maxForce = force
  }

  GetMaxForce(): number {
    return this.m_maxForce
  }

  SetMaxTorque(torque: number): void {
    this.m_maxTorque = torque
  }

  GetMaxTorque(): number {
    return this.m_maxTorque
  }

  Dump(log: (format: string, ...args: any[]) => void): void {
    const indexA: number = this.m_bodyA.m_islandIndex
    const indexB: number = this.m_bodyB.m_islandIndex

    log('  const jd: FrictionJointDef = new FrictionJointDef();\n')
    log('  jd.bodyA = bodies[%d];\n', indexA)
    log('  jd.bodyB = bodies[%d];\n', indexB)
    log(
      '  jd.collideConnected = %s;\n',
      this.m_collideConnected ? 'true' : 'false'
    )
    log(
      '  jd.localAnchorA.Set(%.15f, %.15f);\n',
      this.m_localAnchorA.x,
      this.m_localAnchorA.y
    )
    log(
      '  jd.localAnchorB.Set(%.15f, %.15f);\n',
      this.m_localAnchorB.x,
      this.m_localAnchorB.y
    )
    log('  jd.maxForce = %.15f;\n', this.m_maxForce)
    log('  jd.maxTorque = %.15f;\n', this.m_maxTorque)
    log('  joints[%d] = this.m_world.CreateJoint(jd);\n', this.m_index)
  }
}
