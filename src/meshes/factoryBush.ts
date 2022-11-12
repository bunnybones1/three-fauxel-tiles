import { Material, Mesh, Object3D } from 'three'
import { verticalScale } from '../constants'
import FibonacciSphereGeometry from '../geometries/FibonacciSphereGeometry'
import { longLatToXYZ, pointOnSphereFibonacci } from '../utils/math'
import { mergeMeshes } from '../utils/mergeMeshes'
import { detRandGraphics } from '../utils/random'

let bushGeoA3: FibonacciSphereGeometry | undefined
function getBushGeoA3() {
  if (!bushGeoA3) {
    bushGeoA3 = new FibonacciSphereGeometry(2, 8)
  }
  return bushGeoA3
}

let berryGeo: FibonacciSphereGeometry | undefined
function getBerryGeo() {
  if (!berryGeo) {
    berryGeo = new FibonacciSphereGeometry(3, 15)
  }
  return berryGeo
}

export class BushProps {
  constructor(
    public radius1 = 7,
    public radius2 = 4,
    public knobs = 16,
    public knobs2 = 30,
    public y = 11
  ) {
    //
  }
}

const defaultBushProps = new BushProps()

export function makeRecursiveBush(
  bushMat: Material,
  berryMat: Material,
  bushProps: BushProps = defaultBushProps
) {
  const bushC = new Object3D()
  const bushC2Proto = new Object3D()
  const bushC3Proto = new Mesh(getBushGeoA3(), bushMat)

  for (let i = 0; i < bushProps.knobs2; i++) {
    const bushC3 = bushC3Proto.clone()
    bushC3.position.fromArray(
      longLatToXYZ(
        pointOnSphereFibonacci(i, bushProps.knobs2),
        bushProps.radius2
      )
    )
    bushC3.rotation.set(
      detRandGraphics(-Math.PI, Math.PI),
      detRandGraphics(-Math.PI, Math.PI),
      detRandGraphics(-Math.PI, Math.PI)
    )
    bushC2Proto.add(bushC3)
  }
  for (let i = 0; i < bushProps.knobs; i++) {
    const bushC2 = bushC2Proto.clone(true)
    bushC2.position.fromArray(
      longLatToXYZ(
        pointOnSphereFibonacci(i, bushProps.knobs),
        bushProps.radius1
      )
    )
    bushC.add(bushC2)
    // bushC2.scale.multiplyScalar(rand2(0.8, 1.2))
  }
  bushC.traverse((obj) => {
    if (detRandGraphics() > 0.975 && obj instanceof Mesh) {
      obj.geometry = getBerryGeo()
      obj.material = berryMat
      // obj.scale.multiplyScalar(5.75) //do not scale for now, this will mess up (weaken) normals for some reason
      obj.position.multiplyScalar(1.15)
    }
  })
  bushC.rotation.set(
    detRandGraphics(-Math.PI, Math.PI),
    detRandGraphics(-Math.PI, Math.PI),
    detRandGraphics(-Math.PI, Math.PI)
  )
  const bushBase = new Object3D()
  bushBase.add(bushC)
  bushBase.scale.y *= verticalScale
  bushC.position.y += bushProps.y
  return mergeMeshes(bushBase)
}
