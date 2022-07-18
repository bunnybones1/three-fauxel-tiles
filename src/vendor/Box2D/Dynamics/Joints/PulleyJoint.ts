/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

// DEBUG: import { Assert, epsilon } from "../../Common/Settings";
import { Abs, Rot, Vec2, XY } from '../../Common/Math'
import { linearSlop, Maybe } from '../../Common/Settings'
import { Body } from '../Body'
import { SolverData } from '../TimeStep'

import { IJointDef, Joint, JointDef, JointType } from './Joint'

export const minPulleyLength = 2

export interface IPulleyJointDef extends IJointDef {
  groundAnchorA?: XY

  groundAnchorB?: XY

  localAnchorA?: XY

  localAnchorB?: XY

  lengthA?: number

  lengthB?: number

  ratio?: number
}

/// Pulley joint definition. This requires two ground anchors,
/// two dynamic body anchor points, and a pulley ratio.
export class PulleyJointDef extends JointDef implements IPulleyJointDef {
  readonly groundAnchorA: Vec2 = new Vec2(-1, 1)

  readonly groundAnchorB: Vec2 = new Vec2(1, 1)

  readonly localAnchorA: Vec2 = new Vec2(-1, 0)

  readonly localAnchorB: Vec2 = new Vec2(1, 0)

  lengthA = 0

  lengthB = 0

  ratio = 1

  constructor() {
    super(JointType.e_pulleyJoint)
    this.collideConnected = true
  }

  Initialize(
    bA: Body,
    bB: Body,
    groundA: Vec2,
    groundB: Vec2,
    anchorA: Vec2,
    anchorB: Vec2,
    r: number
  ): void {
    this.bodyA = bA
    this.bodyB = bB
    this.groundAnchorA.Copy(groundA)
    this.groundAnchorB.Copy(groundB)
    this.bodyA.GetLocalPoint(anchorA, this.localAnchorA)
    this.bodyB.GetLocalPoint(anchorB, this.localAnchorB)
    this.lengthA = Vec2.DistanceVV(anchorA, groundA)
    this.lengthB = Vec2.DistanceVV(anchorB, groundB)
    this.ratio = r
    // DEBUG: Assert(this.ratio > epsilon);
  }
}

export class PulleyJoint extends Joint {
  private static InitVelocityConstraints_s_PA = new Vec2()
  private static InitVelocityConstraints_s_PB = new Vec2()

  private static SolveVelocityConstraints_s_vpA = new Vec2()
  private static SolveVelocityConstraints_s_vpB = new Vec2()
  private static SolveVelocityConstraints_s_PA = new Vec2()
  private static SolveVelocityConstraints_s_PB = new Vec2()

  private static SolvePositionConstraints_s_PA = new Vec2()
  private static SolvePositionConstraints_s_PB = new Vec2()

  private static GetCurrentLengthA_s_p = new Vec2()

  private static GetCurrentLengthB_s_p = new Vec2()
  readonly m_groundAnchorA: Vec2 = new Vec2()
  readonly m_groundAnchorB: Vec2 = new Vec2()

  m_lengthA = 0
  m_lengthB = 0

  // Solver shared
  readonly m_localAnchorA: Vec2 = new Vec2()
  readonly m_localAnchorB: Vec2 = new Vec2()

  m_constant = 0
  m_ratio = 0
  m_impulse = 0

  // Solver temp
  m_indexA = 0
  m_indexB = 0
  readonly m_uA: Vec2 = new Vec2()
  readonly m_uB: Vec2 = new Vec2()
  readonly m_rA: Vec2 = new Vec2()
  readonly m_rB: Vec2 = new Vec2()
  readonly m_localCenterA: Vec2 = new Vec2()
  readonly m_localCenterB: Vec2 = new Vec2()

  m_invMassA = 0
  m_invMassB = 0
  m_invIA = 0
  m_invIB = 0
  m_mass = 0

  readonly m_qA: Rot = new Rot()
  readonly m_qB: Rot = new Rot()
  readonly m_lalcA: Vec2 = new Vec2()
  readonly m_lalcB: Vec2 = new Vec2()

  constructor(def: IPulleyJointDef) {
    super(def)

    this.m_groundAnchorA.Copy(Maybe(def.groundAnchorA, new Vec2(-1, 1)))
    this.m_groundAnchorB.Copy(Maybe(def.groundAnchorB, new Vec2(1, 0)))
    this.m_localAnchorA.Copy(Maybe(def.localAnchorA, new Vec2(-1, 0)))
    this.m_localAnchorB.Copy(Maybe(def.localAnchorB, new Vec2(1, 0)))

    this.m_lengthA = Maybe(def.lengthA, 0)
    this.m_lengthB = Maybe(def.lengthB, 0)

    // DEBUG: Assert(Maybe(def.ratio, 1) !== 0);
    this.m_ratio = Maybe(def.ratio, 1)

    this.m_constant =
      Maybe(def.lengthA, 0) + this.m_ratio * Maybe(def.lengthB, 0)

    this.m_impulse = 0
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

    const cA: Vec2 = data.positions[this.m_indexA].c
    const aA: number = data.positions[this.m_indexA].a
    const vA: Vec2 = data.velocities[this.m_indexA].v
    let wA: number = data.velocities[this.m_indexA].w

    const cB: Vec2 = data.positions[this.m_indexB].c
    const aB: number = data.positions[this.m_indexB].a
    const vB: Vec2 = data.velocities[this.m_indexB].v
    let wB: number = data.velocities[this.m_indexB].w

    // Rot qA(aA), qB(aB);
    const qA: Rot = this.m_qA.SetAngle(aA)
    const qB: Rot = this.m_qB.SetAngle(aB)

    // m_rA = Mul(qA, m_localAnchorA - m_localCenterA);
    Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA)
    Rot.MulRV(qA, this.m_lalcA, this.m_rA)
    // m_rB = Mul(qB, m_localAnchorB - m_localCenterB);
    Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB)
    Rot.MulRV(qB, this.m_lalcB, this.m_rB)

    // Get the pulley axes.
    // m_uA = cA + m_rA - m_groundAnchorA;
    this.m_uA.Copy(cA).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA)
    // m_uB = cB + m_rB - m_groundAnchorB;
    this.m_uB.Copy(cB).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB)

    const lengthA: number = this.m_uA.Length()
    const lengthB: number = this.m_uB.Length()

    if (lengthA > 10 * linearSlop) {
      this.m_uA.SelfMul(1 / lengthA)
    } else {
      this.m_uA.SetZero()
    }

    if (lengthB > 10 * linearSlop) {
      this.m_uB.SelfMul(1 / lengthB)
    } else {
      this.m_uB.SetZero()
    }

    // Compute effective mass.
    const ruA: number = Vec2.CrossVV(this.m_rA, this.m_uA)
    const ruB: number = Vec2.CrossVV(this.m_rB, this.m_uB)

    const mA: number = this.m_invMassA + this.m_invIA * ruA * ruA
    const mB: number = this.m_invMassB + this.m_invIB * ruB * ruB

    this.m_mass = mA + this.m_ratio * this.m_ratio * mB

    if (this.m_mass > 0) {
      this.m_mass = 1 / this.m_mass
    }

    if (data.step.warmStarting) {
      // Scale impulses to support variable time steps.
      this.m_impulse *= data.step.dtRatio

      // Warm starting.
      // Vec2 PA = -(m_impulse) * m_uA;
      const PA: Vec2 = Vec2.MulSV(
        -this.m_impulse,
        this.m_uA,
        PulleyJoint.InitVelocityConstraints_s_PA
      )
      // Vec2 PB = (-m_ratio * m_impulse) * m_uB;
      const PB: Vec2 = Vec2.MulSV(
        -this.m_ratio * this.m_impulse,
        this.m_uB,
        PulleyJoint.InitVelocityConstraints_s_PB
      )

      // vA += m_invMassA * PA;
      vA.SelfMulAdd(this.m_invMassA, PA)
      wA += this.m_invIA * Vec2.CrossVV(this.m_rA, PA)
      // vB += m_invMassB * PB;
      vB.SelfMulAdd(this.m_invMassB, PB)
      wB += this.m_invIB * Vec2.CrossVV(this.m_rB, PB)
    } else {
      this.m_impulse = 0
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

    // Vec2 vpA = vA + Cross(wA, m_rA);
    const vpA: Vec2 = Vec2.AddVCrossSV(
      vA,
      wA,
      this.m_rA,
      PulleyJoint.SolveVelocityConstraints_s_vpA
    )
    // Vec2 vpB = vB + Cross(wB, m_rB);
    const vpB: Vec2 = Vec2.AddVCrossSV(
      vB,
      wB,
      this.m_rB,
      PulleyJoint.SolveVelocityConstraints_s_vpB
    )

    const Cdot: number =
      -Vec2.DotVV(this.m_uA, vpA) - this.m_ratio * Vec2.DotVV(this.m_uB, vpB)
    const impulse: number = -this.m_mass * Cdot
    this.m_impulse += impulse

    // Vec2 PA = -impulse * m_uA;
    const PA: Vec2 = Vec2.MulSV(
      -impulse,
      this.m_uA,
      PulleyJoint.SolveVelocityConstraints_s_PA
    )
    // Vec2 PB = -m_ratio * impulse * m_uB;
    const PB: Vec2 = Vec2.MulSV(
      -this.m_ratio * impulse,
      this.m_uB,
      PulleyJoint.SolveVelocityConstraints_s_PB
    )
    // vA += m_invMassA * PA;
    vA.SelfMulAdd(this.m_invMassA, PA)
    wA += this.m_invIA * Vec2.CrossVV(this.m_rA, PA)
    // vB += m_invMassB * PB;
    vB.SelfMulAdd(this.m_invMassB, PB)
    wB += this.m_invIB * Vec2.CrossVV(this.m_rB, PB)

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB
  }
  SolvePositionConstraints(data: SolverData): boolean {
    const cA: Vec2 = data.positions[this.m_indexA].c
    let aA: number = data.positions[this.m_indexA].a
    const cB: Vec2 = data.positions[this.m_indexB].c
    let aB: number = data.positions[this.m_indexB].a

    // Rot qA(aA), qB(aB);
    const qA: Rot = this.m_qA.SetAngle(aA)
    const qB: Rot = this.m_qB.SetAngle(aB)

    // Vec2 rA = Mul(qA, m_localAnchorA - m_localCenterA);
    Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA)
    const rA: Vec2 = Rot.MulRV(qA, this.m_lalcA, this.m_rA)
    // Vec2 rB = Mul(qB, m_localAnchorB - m_localCenterB);
    Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB)
    const rB: Vec2 = Rot.MulRV(qB, this.m_lalcB, this.m_rB)

    // Get the pulley axes.
    // Vec2 uA = cA + rA - m_groundAnchorA;
    const uA = this.m_uA.Copy(cA).SelfAdd(rA).SelfSub(this.m_groundAnchorA)
    // Vec2 uB = cB + rB - m_groundAnchorB;
    const uB = this.m_uB.Copy(cB).SelfAdd(rB).SelfSub(this.m_groundAnchorB)

    const lengthA: number = uA.Length()
    const lengthB: number = uB.Length()

    if (lengthA > 10 * linearSlop) {
      uA.SelfMul(1 / lengthA)
    } else {
      uA.SetZero()
    }

    if (lengthB > 10 * linearSlop) {
      uB.SelfMul(1 / lengthB)
    } else {
      uB.SetZero()
    }

    // Compute effective mass.
    const ruA: number = Vec2.CrossVV(rA, uA)
    const ruB: number = Vec2.CrossVV(rB, uB)

    const mA: number = this.m_invMassA + this.m_invIA * ruA * ruA
    const mB: number = this.m_invMassB + this.m_invIB * ruB * ruB

    let mass: number = mA + this.m_ratio * this.m_ratio * mB

    if (mass > 0) {
      mass = 1 / mass
    }

    const C: number = this.m_constant - lengthA - this.m_ratio * lengthB
    const linearError: number = Abs(C)

    const impulse: number = -mass * C

    // Vec2 PA = -impulse * uA;
    const PA: Vec2 = Vec2.MulSV(
      -impulse,
      uA,
      PulleyJoint.SolvePositionConstraints_s_PA
    )
    // Vec2 PB = -m_ratio * impulse * uB;
    const PB: Vec2 = Vec2.MulSV(
      -this.m_ratio * impulse,
      uB,
      PulleyJoint.SolvePositionConstraints_s_PB
    )

    // cA += m_invMassA * PA;
    cA.SelfMulAdd(this.m_invMassA, PA)
    aA += this.m_invIA * Vec2.CrossVV(rA, PA)
    // cB += m_invMassB * PB;
    cB.SelfMulAdd(this.m_invMassB, PB)
    aB += this.m_invIB * Vec2.CrossVV(rB, PB)

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB

    return linearError < linearSlop
  }

  GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out)
  }

  GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out)
  }

  GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // Vec2 P = m_impulse * m_uB;
    // return inv_dt * P;
    out.x = inv_dt * this.m_impulse * this.m_uB.x
    out.y = inv_dt * this.m_impulse * this.m_uB.y
    return out
  }

  GetReactionTorque(inv_dt: number): number {
    return 0
  }

  GetGroundAnchorA() {
    return this.m_groundAnchorA
  }

  GetGroundAnchorB() {
    return this.m_groundAnchorB
  }

  GetLengthA() {
    return this.m_lengthA
  }

  GetLengthB() {
    return this.m_lengthB
  }

  GetRatio() {
    return this.m_ratio
  }
  GetCurrentLengthA() {
    // Vec2 p = m_bodyA->GetWorldPoint(m_localAnchorA);
    // Vec2 s = m_groundAnchorA;
    // Vec2 d = p - s;
    // return d.Length();
    const p = this.m_bodyA.GetWorldPoint(
      this.m_localAnchorA,
      PulleyJoint.GetCurrentLengthA_s_p
    )
    const s = this.m_groundAnchorA
    return Vec2.DistanceVV(p, s)
  }
  GetCurrentLengthB() {
    // Vec2 p = m_bodyB->GetWorldPoint(m_localAnchorB);
    // Vec2 s = m_groundAnchorB;
    // Vec2 d = p - s;
    // return d.Length();
    const p = this.m_bodyB.GetWorldPoint(
      this.m_localAnchorB,
      PulleyJoint.GetCurrentLengthB_s_p
    )
    const s = this.m_groundAnchorB
    return Vec2.DistanceVV(p, s)
  }

  Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex
    const indexB = this.m_bodyB.m_islandIndex

    log('  const jd: PulleyJointDef = new PulleyJointDef();\n')
    log('  jd.bodyA = bodies[%d];\n', indexA)
    log('  jd.bodyB = bodies[%d];\n', indexB)
    log(
      '  jd.collideConnected = %s;\n',
      this.m_collideConnected ? 'true' : 'false'
    )
    log(
      '  jd.groundAnchorA.Set(%.15f, %.15f);\n',
      this.m_groundAnchorA.x,
      this.m_groundAnchorA.y
    )
    log(
      '  jd.groundAnchorB.Set(%.15f, %.15f);\n',
      this.m_groundAnchorB.x,
      this.m_groundAnchorB.y
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
    log('  jd.lengthA = %.15f;\n', this.m_lengthA)
    log('  jd.lengthB = %.15f;\n', this.m_lengthB)
    log('  jd.ratio = %.15f;\n', this.m_ratio)
    log('  joints[%d] = this.m_world.CreateJoint(jd);\n', this.m_index)
  }

  ShiftOrigin(newOrigin: Vec2) {
    this.m_groundAnchorA.SelfSub(newOrigin)
    this.m_groundAnchorB.SelfSub(newOrigin)
  }
}
