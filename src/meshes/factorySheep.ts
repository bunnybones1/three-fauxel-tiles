import { Material, Mesh, Object3D, SphereBufferGeometry } from 'three'
import { Easing } from '../animation/Easing'
import {
  getCachedChamferedBoxGeometry,
  getChamferedBoxGeometry
} from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

const C1_1 = Math.PI * 2
const C1_2 = Math.PI
const C1_4 = Math.PI * 0.5
const C1_8 = Math.PI * 0.25

export function makeSheep(
  matFleecePrimary: Material,
  matFleeceSecondary: Material,
  matNose: Material,
  matEyes: Material,
  time = 0,
  runStrength = 1
) {
  const pivot = new Object3D()
  const body = new Mesh(
    getCachedChamferedBoxGeometry(24, 26, 34, 8),
    matFleecePrimary
  )
  const angle = time * C1_1
  const phaseBody = angle * 0.5 - C1_4
  body.position.y =
    18 + Easing.Quadratic.Out(Math.cos(phaseBody)) * 30 * runStrength

  const bodyAngle = Easing.Quadratic.In(time) * C1_1
  body.rotation.x = Math.sin(-bodyAngle) * 0.4 * runStrength
  //leg back
  const legBack = new Mesh(
    getCachedChamferedBoxGeometry(10, 20, 14, 4),
    matFleecePrimary
  )
  legBack.position.x = -10
  legBack.position.z = 7
  legBack.position.y = Math.cos(angle + 1) * 4 * runStrength
  //   const legBackAngle = Math.cos(angle * 0.5 - C1_4) * 1.5
  const legBackAngle =
    Math.sin(Easing.Quadratic.InOut((time + 1.5) % 1) * C1_1) * 1.3

  legBack.rotation.x = Math.PI * 0.125 + legBackAngle * runStrength
  body.add(legBack)
  const shinBack = new Mesh(
    getCachedChamferedBoxGeometry(5, 20, 7, 2),
    matFleeceSecondary
  )
  shinBack.position.y = -10
  shinBack.position.z = 4
  shinBack.rotation.x = Math.PI * -0.25
  legBack.add(shinBack)
  const legBack2 = legBack.clone()
  legBack2.position.x *= -1
  body.add(legBack2)

  //leg front
  const legFront = new Mesh(
    getCachedChamferedBoxGeometry(10, 20, 14, 4),
    matFleecePrimary
  )
  legFront.position.x = -8
  legFront.position.z = -7 + Math.sin(angle - 1) * 4 * runStrength
  legBack.position.y = Math.cos(angle) * 4 * runStrength
  const legFrontAngle =
    Math.sin(Easing.Quadratic.InOut((time + 0.6) % 1) * C1_1) * 1.3
  legFront.rotation.x = Math.PI * -0.125 + (legFrontAngle + 0.25) * runStrength
  body.add(legFront)
  const shinFront = new Mesh(
    getCachedChamferedBoxGeometry(5, 20, 7, 2),
    matFleeceSecondary
  )
  shinFront.position.y = -10
  shinFront.position.z = -4
  shinFront.rotation.x = Math.PI * 0.25
  legFront.add(shinFront)
  const legFront2 = legFront.clone()
  legFront2.position.x *= -1
  body.add(legFront2)

  //tail
  const tail = new Mesh(
    getCachedChamferedBoxGeometry(8, 12, 10, 3),
    matFleecePrimary
  )
  tail.position.z = 17
  const tailPhase = Math.sin(angle + 2.5) * 0.5 + 0.5
  tail.position.y = 4 + tailPhase * 6 * runStrength
  tail.rotation.x = Math.PI * -0.125 - tailPhase * 2 * runStrength
  body.add(tail)

  //head
  const head = new Mesh(
    getCachedChamferedBoxGeometry(12, 20, 12, 4),
    matFleecePrimary
  )
  const headPhase = Math.sin(angle - 0.5) * 0.5 + 0.5
  const headPhase2 = Math.sin(angle + 1) * 0.5 + 0.5
  head.position.z = -17 + headPhase2 * -4 * runStrength
  head.position.y = 10 + headPhase * 4 * runStrength
  head.rotation.x = Math.PI * 0.25 + headPhase * 1.5 * runStrength
  body.add(head)

  //ears
  const earContainer = new Object3D()
  const ear = new Mesh(
    getCachedChamferedBoxGeometry(8, 2, 8, 1),
    matFleecePrimary
  )
  ear.position.x = -8
  ear.rotation.y = Math.PI * 0.25
  earContainer.position.y = 4
  earContainer.rotation.x = Math.PI * 0.125
  earContainer.scale.z = 0.5
  const ear2Container = earContainer.clone()
  earContainer.add(ear)
  const ear2 = ear.clone()
  ear2.position.x *= -1
  ear2Container.add(ear2)
  const earPhase = Math.sin(angle - 2) * 0.5 + 0.5
  earContainer.position.x = earPhase * -3 * runStrength
  earContainer.rotation.z = -earPhase * runStrength
  earContainer.rotation.x = -earPhase * runStrength
  ear2Container.position.x = earPhase * 3 * runStrength
  ear2Container.rotation.z = earPhase * runStrength
  ear2Container.rotation.x = -earPhase * runStrength
  head.add(earContainer)
  head.add(ear2Container)

  //eyes
  const eyeGeo = new SphereBufferGeometry(2, 16, 8)
  const eye = new Mesh(eyeGeo, matEyes)
  eye.position.x = -6
  eye.position.y = -1
  eye.position.z = -2
  const eye2 = eye.clone()
  eye2.position.x *= -1
  head.add(eye2)
  head.add(eye)

  //nose
  const nose = new Mesh(getCachedChamferedBoxGeometry(6, 4, 4, 1), matNose)
  nose.position.z = -4
  nose.position.y = -7
  nose.rotation.x = Math.PI * 0.25
  head.add(nose)

  body.rotation.y = Math.PI

  pivot.add(body)

  return mergeMeshes(pivot)
}
