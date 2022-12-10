import { Material, Mesh, Object3D, SphereBufferGeometry } from 'three'
import { getChamferedBoxGeometry } from '../utils/geometry'
import { mergeMeshes } from '../utils/mergeMeshes'

export function makeSheep(
  matFleecePrimary: Material,
  matFleeceSecondary: Material,
  matNose: Material,
  matEyes: Material
) {
  const pivot = new Object3D()
  const body = new Mesh(
    getChamferedBoxGeometry(24, 26, 34, 8),
    matFleecePrimary
  )
  body.position.y = 20

  //leg back
  const legBack = new Mesh(
    getChamferedBoxGeometry(10, 20, 14, 4),
    matFleecePrimary
  )
  legBack.position.x = -10
  legBack.position.z = 7
  legBack.rotation.x = Math.PI * 0.125
  body.add(legBack)
  const shinBack = new Mesh(
    getChamferedBoxGeometry(5, 20, 7, 2),
    matFleeceSecondary
  )
  shinBack.position.y = -10
  shinBack.position.z = 4
  shinBack.rotation.x = Math.PI * -0.25
  legBack.add(shinBack)
  const legBack2 = legBack.clone()
  legBack2.position.x *= -1
  body.add(legBack2)
  body.position.y = 20

  //leg front
  const legFront = new Mesh(
    getChamferedBoxGeometry(10, 20, 14, 4),
    matFleecePrimary
  )
  legFront.position.x = -8
  legFront.position.z = -7
  legFront.rotation.x = Math.PI * -0.125
  body.add(legFront)
  const shinFront = new Mesh(
    getChamferedBoxGeometry(5, 20, 7, 2),
    matFleeceSecondary
  )
  shinFront.position.y = -10
  shinFront.position.z = -4
  shinFront.rotation.x = Math.PI * 0.25
  legFront.add(shinFront)
  const legFront2 = legFront.clone()
  legFront2.position.x *= -1
  body.add(legFront2)
  body.position.y = 20

  //tail
  const tail = new Mesh(getChamferedBoxGeometry(6, 12, 10, 3), matFleecePrimary)
  tail.position.z = 17
  tail.position.y = 4
  tail.rotation.x = Math.PI * -0.125
  body.add(tail)

  //head
  const head = new Mesh(
    getChamferedBoxGeometry(12, 20, 12, 4),
    matFleecePrimary
  )
  head.position.z = -17
  head.position.y = 10
  head.rotation.x = Math.PI * 0.25
  body.add(head)

  //ears
  const earContainer = new Object3D()
  const ear = new Mesh(getChamferedBoxGeometry(8, 2, 8, 1), matFleecePrimary)
  ear.position.x = -8
  earContainer.position.y = 4
  ear.rotation.y = Math.PI * 0.25
  earContainer.rotation.x = Math.PI * 0.125
  const ear2 = ear.clone()
  ear2.position.x *= -1
  earContainer.add(ear2)
  earContainer.add(ear)
  earContainer.scale.z = 0.5
  head.add(earContainer)

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
  const nose = new Mesh(getChamferedBoxGeometry(6, 4, 4, 1), matNose)
  nose.position.z = -4
  nose.position.y = -7
  nose.rotation.x = Math.PI * 0.25
  head.add(nose)

  body.rotation.y = Math.PI

  pivot.add(body)

  return mergeMeshes(pivot)
}
