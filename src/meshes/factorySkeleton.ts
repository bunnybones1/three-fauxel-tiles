import { Material, Mesh, Object3D } from 'three'
import { getCachedChamferedBoxGeometry } from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

const C1_1 = Math.PI * 2
const C1_2 = Math.PI
const C1_4 = Math.PI * 0.5
const C1_8 = Math.PI * 0.25
const C1_16 = Math.PI * 0.125

export function makeSkeleton(
  matSkin: Material,
  matBlack: Material,
  matPants: Material,
  time = 0,
  runStrength = 1
) {
  const pivot = new Object3D()
  const hips = new Mesh(getCachedChamferedBoxGeometry(8, 4, 6, 2), matPants)
  hips.position.set(0, 22, 0)

  hips.rotation.y = Math.PI

  const torso = new Mesh(
    getCachedChamferedBoxGeometry(3, 7, 2, 1, 0, 2, 0),
    matSkin
  )
  torso.position.set(0, 4, 0)
  torso.rotation.z = Math.sin(time * C1_1) * 0.3 * runStrength
  torso.rotation.x = -C1_16 * 0.5
  hips.add(torso)

  const torso2 = new Mesh(
    getCachedChamferedBoxGeometry(10, 7, 6, 1, 0, 2, -1),
    matBlack
  )
  torso2.position.set(0, 4, 0)
  torso2.rotation.x =
    -C1_16 + (Math.sin(time * C1_1 * 2 - 2) * 0.5 + 0.5) * -0.3 * runStrength
  torso2.rotation.z = Math.sin(time * C1_1) * 0.3 * runStrength
  torso.add(torso2)

  const neck = new Mesh(
    getCachedChamferedBoxGeometry(3, 5, 3, 1, 0, 4, 0),
    matSkin
  )
  neck.position.set(0, 4, 0)
  neck.rotation.x = -C1_16 * 0.5
  torso2.add(neck)

  const head = new Mesh(
    getCachedChamferedBoxGeometry(10, 10, 10, 3, 0, 5, 0),
    matSkin
  )
  head.scale.setScalar(1.5)
  head.position.set(0, 4, -2)
  head.rotation.x = C1_8
  head.rotation.y = -Math.cos(time * C1_1 + 3.5) * 0.75 * runStrength
  head.rotation.z = Math.sin(time * C1_1 + 3.5) * 0.75 * runStrength
  neck.add(head)

  const headInner = new Mesh(
    getCachedChamferedBoxGeometry(9, 9, 9, 3, 0, 3.5, -1.5),
    matBlack
  )
  head.add(headInner)

  const headDetails = new Object3D()
  head.add(headDetails)
  const jawDetails = new Object3D()
  head.add(jawDetails)

  const mandibleMiddle = new Mesh(
    getCachedChamferedBoxGeometry(3, 3, 1.5, 0.6),
    matSkin
  )
  mandibleMiddle.position.set(0, -1, -7)
  jawDetails.add(mandibleMiddle)
  jawDetails.rotation.x =
    -Math.abs(Math.sin(time * C1_1 - 4)) * 0.5 * runStrength
  jawDetails.rotation.y = Math.sin(time * C1_1 + 5) * 0.25 * runStrength

  for (let s = -1; s <= 1; s += 2) {
    const brow = new Mesh(
      getCachedChamferedBoxGeometry(5, 2, 4, 1, 2 * s, 0, 0),
      matSkin
    )
    brow.position.set(1 * s, 6, -4)
    brow.rotation.z = C1_16 * s
    brow.rotation.x = -C1_16 * 0.5
    headDetails.add(brow)

    const brow2 = new Mesh(
      getCachedChamferedBoxGeometry(5, 2, 4, 1, 2 * s, 0, 0),
      matSkin
    )
    brow2.position.set(1 * s, 3, -4)
    brow2.rotation.x = -C1_16 * 0.5
    brow2.rotation.z = -C1_16 * s
    headDetails.add(brow2)
    const eyeHoleEdge = new Mesh(
      getCachedChamferedBoxGeometry(5, 1.5, 4, 0.6, 2 * s, 0, 0),
      matSkin
    )
    eyeHoleEdge.position.set(4.5 * s, 6.5, -3.5)
    eyeHoleEdge.rotation.x = C1_16 * -0.5
    eyeHoleEdge.rotation.z = -C1_1 * s * 0.25
    headDetails.add(eyeHoleEdge)

    const nose = new Mesh(
      getCachedChamferedBoxGeometry(5, 1.5, 4, 0.6, 2 * s, 0, 0),
      matSkin
    )
    nose.position.set(0.5 * s, 6, -4)
    nose.rotation.x = C1_16 * 0.5
    nose.rotation.z = -C1_1 * s * 0.2
    headDetails.add(nose)
    const maxilla = new Mesh(
      getCachedChamferedBoxGeometry(4, 3, 1.5, 0.6),
      matSkin
    )
    maxilla.position.set(1.2 * s, 1, -6)
    maxilla.rotation.y = -C1_8 * s
    headDetails.add(maxilla)

    const jawSide = new Mesh(
      getCachedChamferedBoxGeometry(1.5, 6, 3, 0.6, 0, 0, 0),
      matSkin
    )
    jawSide.position.set(5 * s, 1, -1)
    jawSide.rotation.x = C1_8
    jawDetails.add(jawSide)

    const mandible = new Mesh(
      getCachedChamferedBoxGeometry(7, 3, 1.5, 0.6),
      matSkin
    )
    mandible.position.set(3 * s, -1, -5)
    mandible.rotation.y = -C1_8 * s
    jawDetails.add(mandible)

    const leg = new Mesh(
      getCachedChamferedBoxGeometry(3, 14, 3, 1, 0, -5, 0),
      matPants
    )
    leg.position.set(-3 * s, 0, 0)
    leg.rotation.z =
      (-0.25 - C1_16 - Math.sin(time * C1_1 + s * C1_4)) * s * 0.5 * runStrength
    leg.rotation.x = C1_16 + Math.sin(time * C1_1 + s * C1_4) * runStrength
    hips.add(leg)
    const shin = new Mesh(
      getCachedChamferedBoxGeometry(4, 14, 4, 1.5, 0, -5, 0),
      matPants
    )
    leg.add(shin)
    shin.position.y = -11
    shin.rotation.x = -C1_8 + Math.sin(time * C1_1 + s * C1_4 - 2) * runStrength
    const foot = new Mesh(
      getCachedChamferedBoxGeometry(5, 10, 4, 1.5, 0, -3, 0),
      matSkin
    )
    shin.add(foot)
    foot.position.y = -11
    foot.rotation.x = C1_4 + C1_16

    for (let i = 0; i < 3; i++) {
      const rib1 = new Mesh(
        getCachedChamferedBoxGeometry(6 + i * 0.5, 1.5, 6, 0.6, 0, 0, 0),
        matSkin
      )
      rib1.position.y = -2 + 3 * i
      rib1.position.x = -2 * s + i * -s * 0.5
      rib1.rotation.z = C1_16 * s
      torso2.add(rib1)
    }

    const bicep = new Mesh(
      getCachedChamferedBoxGeometry(3, 12, 3, 1, 0, -5, 0),
      matSkin
    )
    bicep.position.set(-5 * s, 4, 1)
    bicep.rotation.order = 'YXZ'
    bicep.rotation.x = C1_2 * 0.7
    bicep.rotation.y = C1_4 * s
    bicep.rotation.z =
      C1_8 * s + Math.sin(time * 2 * C1_1 * s + 3) * 0.2 * runStrength
    bicep.rotation.z -= Math.sin(-time * C1_1 + 3) * 0.6 * runStrength
    if (runStrength === 0) {
      bicep.rotation.y = 0
      bicep.rotation.z = -s * 0.25
      bicep.rotation.x = 0
    }

    torso2.add(bicep)
    const forearm = new Mesh(
      getCachedChamferedBoxGeometry(4, 14, 4, 1.5, 0, -5, 0),
      matSkin
    )
    bicep.add(forearm)
    forearm.rotation.order = 'XYZ'
    forearm.position.y = -11
    forearm.rotation.z = s
    forearm.rotation.y = s * 2
    // forearm.rotation.x = Math.sin(-time * C1_1 * 2 + 2) + 2
    // forearm.rotation.x = -C1_8 * s + Math.sin(time * C1_1 * 2 + s * C1_4 + 1)
    const hand = new Mesh(
      getCachedChamferedBoxGeometry(5, 5, 2.5, 1, 0, -2, 0),
      matSkin
    )
    forearm.add(hand)
    hand.position.y = -11
    const finger = new Mesh(
      getCachedChamferedBoxGeometry(1, 3, 1, 0.3, 0, -1.5, 0),
      matSkin
    )
    hand.add(finger)
    finger.position.y = -3
    finger.rotation.x = -0.25
    const fingerB = finger.clone()
    fingerB.position.y = -2
    finger.add(fingerB)
    const fingerC = finger.clone()
    fingerC.position.y = -2
    fingerB.add(fingerC)
    finger.position.x = s * 0.5
    const fingerPointer = finger.clone()
    hand.add(fingerPointer)
    fingerPointer.position.x = 1.5 * s
    fingerPointer.scale.setScalar(0.8)
    const fingerRing = finger.clone()
    hand.add(fingerRing)
    fingerRing.position.x = -1 * s
    fingerRing.scale.setScalar(0.8)
    const fingerPinky = finger.clone()
    hand.add(fingerPinky)
    fingerPinky.position.x = -2 * s
    fingerPinky.scale.setScalar(0.65)
    const thumb = finger.clone()
    hand.add(thumb)
    thumb.position.set(s * 2, -1, 0)
    thumb.scale.set(1, 0.5, 1)
    thumb.rotation.order = 'ZXY'
    thumb.rotation.set(-C1_8, s * -C1_4, C1_8 * s)
    // hand.rotation.x = C1_4 + C1_16
  }

  pivot.add(hips)
  pivot.scale.setScalar(1.2)

  return mergeMeshes(pivot)
}
