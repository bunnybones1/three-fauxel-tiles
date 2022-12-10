import { Material, Mesh, Object3D, Vector4, WebGLRenderer } from 'three'
import { verticalScale } from '../../../constants'
import {
  changeMeshMaterials,
  getMeshMaterial,
  MaterialPassType
} from '../../../helpers/materials/materialLib'
import { makeSheep } from '../../../meshes/factorySheep'
import { getChamferedBoxGeometry } from '../../../utils/geometry'
import { memoize } from '../../../utils/memoizer'
import TileMaker from '../TileMaker'

export default class SpriteMaker extends TileMaker {
  private _angleRegistry: number[] = []
  constructor(
    pixelsPerTile = 32,
    pixelsPerCacheEdge = 2048,
    passes: MaterialPassType[] = ['beauty']
  ) {
    const dummy = () => new Object3D()

    const bodyMaker = memoize(() => {
      const bodyGeo = getChamferedBoxGeometry(20, 14, 10, 3)
      const obj = new Mesh(bodyGeo, getMeshMaterial('pants'))
      obj.position.y = 17
      const headGeo = getChamferedBoxGeometry(16, 16 * verticalScale, 16, 4)
      const head = new Mesh(headGeo, getMeshMaterial('skin'))
      head.position.y = 16
      obj.add(head)
      const legGeo = getChamferedBoxGeometry(6, 12 * verticalScale, 6, 2)
      const leg = new Mesh(legGeo, getMeshMaterial('pants'))
      leg.position.x = -6
      leg.position.y = -12
      obj.add(leg)
      const leg2 = leg.clone()
      leg2.position.x *= -1
      obj.add(leg2)

      const armGeo = getChamferedBoxGeometry(4, 20 * verticalScale, 4, 1.25)
      const arm = new Mesh(armGeo, getMeshMaterial('pants'))
      arm.position.x = -12
      arm.rotation.z = Math.PI * -0.125
      arm.position.y = -1
      obj.add(arm)
      const arm2 = arm.clone()
      arm2.rotation.z *= -1
      arm2.position.x *= -1
      obj.add(arm2)

      return obj
    })

    const body = () => bodyMaker()

    const body2 = () => {
      const obj = bodyMaker().clone(true)
      obj.traverse((node) => {
        if (
          node instanceof Mesh &&
          node.material instanceof Material &&
          node.material.name === 'pants'
        ) {
          node.material = getMeshMaterial('pantsRed')
        }
      })
      return obj
    }

    const hat = () => {
      const obj = new Mesh(
        getChamferedBoxGeometry(18, 16 * verticalScale, 16, 3),
        getMeshMaterial('gold')
      )
      obj.position.z = -4
      obj.position.y = 35
      obj.scale.y *= verticalScale
      return obj
    }

    const sword = () => {
      const obj = new Mesh(
        getChamferedBoxGeometry(2, 4, 16, 2),
        getMeshMaterial('gold')
      )
      obj.position.x = -14
      obj.position.z = 10
      obj.position.y = 11
      return obj
    }

    const shield = () => {
      const obj = new Mesh(
        getChamferedBoxGeometry(12, 12, 2, 2),
        getMeshMaterial('gold')
      )
      obj.position.x = 12
      obj.position.y = 16
      obj.position.z = 6
      obj.rotation.y = Math.PI * 0.125
      return obj
    }

    const sheep = () => {
      return makeSheep(
        getMeshMaterial('fleeceWhite'),
        getMeshMaterial('fleeceBlack'),
        getMeshMaterial('sheepNose'),
        getMeshMaterial('shinyBlack')
      )
    }

    const indexedMeshes = [dummy, body, body2, hat, sword, shield, sheep]

    super(pixelsPerTile, pixelsPerCacheEdge, passes, indexedMeshes)

    this._pivot.scale.multiplyScalar(0.5)
  }

  getTileId(tileDescription: Uint8Array) {
    throw new Error('Needs angle. Use getTileIdAtAngle()')
    return 0
  }
  getTileIdAtAngle(tileDescription: Uint8Array, angle: number) {
    // const hash = Buffer.from(tileDescription).toString('utf-8')
    const hash = `${tileDescription.toString()}@${angle}`
    let index = this._tileHashRegistry.indexOf(hash)
    if (index === -1) {
      index = this._tileRegistry.length
      if (index >= this._maxTiles) {
        console.error(`no more room for tiles! (${index})`)
      }
      this._tileRegistry.push(tileDescription)
      this._angleRegistry.push(angle)
      this._tileHashRegistry.push(hash)
      this._renderQueue.push(index)
    }
    return index
  }
  render(renderer: WebGLRenderer) {
    if (this._renderQueue.length > 0) {
      const oldViewport = new Vector4()
      const oldScissor = new Vector4()
      renderer.getViewport(oldViewport)
      renderer.getScissor(oldScissor)
      this._scene.updateMatrixWorld(true)
      for (const pass of this._passes) {
        renderer.setRenderTarget(this._renderTargets.get(pass)!)
        const p = this._pixelsPerTile / renderer.getPixelRatio()
        const depthPass = pass === 'customTopDownHeight'
        for (const index of this._renderQueue) {
          const iCol = index % this._tilesPerEdge
          const iRow = ~~(index / this._tilesPerEdge)
          const angle = this._angleRegistry[index]
          if (this._pivot.rotation.y !== angle) {
            this._pivot.rotation.y = angle
            this._pivot.updateMatrixWorld(true)
          }
          const visualProps = this._tileRegistry[index]
          const layer2 = !!(visualProps[0] & 1)
          if (layer2 && depthPass) {
            continue
          }
          for (let j = 0; j < this._indexedMeshes.length; j++) {
            const jb = ~~(j / 8)
            const j8 = j % 8
            const shouldShow = !!(visualProps[jb] & (1 << j8))
            if (this._indexedMeshesVisibility[j] && !shouldShow) {
              this._indexedMeshes[j]().visible = false
            } else if (!this._indexedMeshesVisibility[j] && shouldShow) {
              this._indexedMeshes[j]().visible = true
            }
            this._indexedMeshesVisibility[j] = shouldShow
          }
          renderer.setViewport(iCol * p, iRow * p, p, p)
          renderer.setScissor(iCol * p, iRow * p, p, p)
          changeMeshMaterials(this._scene, pass, true)
          renderer.render(
            this._scene,
            layer2
              ? this._cameraTiltedTop
              : depthPass
              ? this._cameraTopDown
              : this._cameraTiltedBottom
          )
        }
      }
      renderer.setViewport(oldViewport)
      renderer.setScissor(oldScissor)
      renderer.setRenderTarget(null)
      this._renderQueue.length = 0
    }
  }
}
