import {
  BufferGeometry,
  Camera,
  Color,
  DoubleSide,
  Group,
  Material,
  Matrix3,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  MeshStandardMaterialParameters,
  Object3D,
  Scene,
  Vector4,
  WebGLRenderer
} from 'three'
import BasicVec4MeshMaterial from '../../materials/BasicVec4MeshMaterial'
import { HeightMeshMaterial } from '../../materials/HeightMeshMaterial'
import { WorldNormalMeshMaterial } from '../../materials/WorldNormalMeshMaterial'
import { defaultNumber, NOOP } from '../../utils/jsUtils'
import { makeSafetyCheckFromConstStringArray } from '../typeHelpers'

const CuratedMaterialTypeStrings = [
  'ironBlack',
  'ground',
  'brick',
  'gold',
  'mortar',
  'drywall',
  'floor',
  'wood',
  'skin',
  'plastic',
  'grass',
  'bush',
  'berry',
  'pants',
  'pantsRed',
  'rock'
] as const

export type CuratedMaterialType = typeof CuratedMaterialTypeStrings[number]

export const isCuratedMaterial = makeSafetyCheckFromConstStringArray(
  CuratedMaterialTypeStrings
)

const MaterialPassTypeStrings = [
  'beauty',
  'normals',
  'depth',
  'customColor',
  'customEmissive',
  // 'customNormal',
  'customRoughnessMetalnessHeight',
  'customTopDownHeight',
  'pointLights'
] as const

export type MaterialPassType = typeof MaterialPassTypeStrings[number]

export const isMaterialPass = makeSafetyCheckFromConstStringArray(
  MaterialPassTypeStrings
)

export const standardMaterialParamLib: {
  [K in CuratedMaterialType]: MeshStandardMaterialParameters
} = {
  ground: {
    roughness: 1,
    color: new Color(0.16, 0.14, 0.13)
  },
  brick: {
    roughness: 1,
    color: new Color(0.5, 0.2, 0.15),
    metalness: 0.3
  },
  gold: {
    roughness: 0.3,
    color: new Color(0.5, 0.4, 0),
    metalness: 1,
    emissive: new Color(0.05, 0, 0)
  },
  ironBlack: {
    roughness: 0.1,
    color: new Color(0.01, 0.01, 0.015),
    metalness: 0.9
  },
  mortar: {
    roughness: 1,
    color: new Color(0.2, 0.2, 0.2)
  },
  drywall: {
    roughness: 1,
    color: new Color(0.8, 0.8, 0.8)
  },
  floor: {
    roughness: 1,
    color: new Color(0.4, 0.32, 0.25)
  },
  wood: {
    roughness: 1,
    color: new Color(0.6, 0.4, 0.3)
  },
  skin: {
    roughness: 1,
    color: new Color(0.8, 0.4, 0.4)
  },
  plastic: {
    roughness: 0.5,
    color: new Color(0.2, 0.25, 0.4)
  },
  rock: {
    roughness: 0.85,
    metalness: 0.95,
    color: new Color(0.2, 0.25, 0.2)
  },
  grass: {
    roughness: 1,
    metalness: 0.95,
    color: new Color(0.2, 0.55, 0.2),
    emissive: new Color(0.2, 0.55, 0.05).multiplyScalar(0.05),
    wireframe: true,
    side: DoubleSide,
    opacity: 0.5
  },
  bush: {
    roughness: 1,
    metalness: 0.95,
    color: new Color(0.125, 0.3, 0.125),
    emissive: new Color(0.2, 0.55, 0.05).multiplyScalar(0.05),
    // wireframe: true,
    opacity: 0.5
  },
  berry: {
    roughness: 0.25,
    metalness: 0.6,
    color: new Color(0.6, 0.05, 0.1325),
    opacity: 0.25
    // wireframe: true
  },
  pants: {
    roughness: 0.65,
    color: new Color(0.2, 0.25, 0.4)
  },
  pantsRed: {
    roughness: 0.65,
    color: new Color(0.5, 0.1, 0.1)
  }
}

const materialCache = new Map<string, Material>()

function __makeMaterial(name: CuratedMaterialType, pass: MaterialPassType) {
  const standardParams = standardMaterialParamLib[name]
  switch (pass) {
    case 'beauty':
      return new MeshStandardMaterial(standardParams)
    case 'normals':
      return new WorldNormalMeshMaterial({
        wireframe: standardParams.wireframe
      })
      break
    case 'depth':
      return new MeshDepthMaterial({
        wireframe: standardParams.wireframe
      })
      break
    case 'customColor':
      const c = new Color(standardParams.color)
      return new BasicVec4MeshMaterial({
        data: new Vector4(c.r, c.g, c.b, standardParams.opacity),
        wireframe: standardParams.wireframe
      })
    case 'customEmissive':
      const e = new Color(standardParams.emissive || 0)
      return new BasicVec4MeshMaterial({
        data: new Vector4(e.r, e.g, e.b, 1),
        wireframe: standardParams.wireframe
      })
    case 'customRoughnessMetalnessHeight':
      return new HeightMeshMaterial({
        data: new Vector4(
          defaultNumber(standardParams.roughness, 0.5),
          defaultNumber(standardParams.metalness, 0.5),
          1,
          1
        ),
        heightChannel: 'b',
        wireframe: standardParams.wireframe
      })
    case 'customTopDownHeight':
      return new HeightMeshMaterial({
        data: new Vector4(0, 0, 0, 1),
        heightChannel: 'b',
        wireframe: standardParams.wireframe
      })
    default:
      throw new Error(`Please add implementation for ${pass}`)
  }
  throw new Error('Unknown material pass requested')
}
export function getMaterial(
  name: CuratedMaterialType,
  pass: MaterialPassType = 'beauty'
) {
  const key = `${name}:${pass}`
  if (!materialCache.has(key)) {
    const mat = __makeMaterial(name, pass)
    mat.name = name
    materialCache.set(key, mat)
  }
  return materialCache.get(key)!.clone()
}

function __onBeforeRenderDoUpdateWorldNormals(
  this: Mesh,
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  geometry: BufferGeometry,
  material: WorldNormalMeshMaterial,
  group: Group
) {
  const modelNormalMatrix = material.uniforms.uModelNormalMatrix
    .value as Matrix3
  modelNormalMatrix.getNormalMatrix(this.matrixWorld)
}
export function changeMaterials(
  node: Object3D,
  pass: MaterialPassType,
  visibleOnly = false
) {
  if (!visibleOnly || (visibleOnly && node.visible)) {
    if (node instanceof Mesh && node.material instanceof Material) {
      if (isCuratedMaterial(node.material.name)) {
        if (node.material instanceof WorldNormalMeshMaterial) {
          node.onBeforeRender = NOOP
        }
        const mat = getMaterial(node.material.name, pass)
        node.material = mat
        if (node.material instanceof WorldNormalMeshMaterial) {
          node.onBeforeRender = __onBeforeRenderDoUpdateWorldNormals
        }
      }
    }
    for (const child of node.children) {
      changeMaterials(child, pass, visibleOnly)
    }
  }
}
