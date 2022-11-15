import {
  BufferGeometry,
  Camera,
  Color,
  ColorRepresentation,
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
  'silver',
  'iron',
  'copper',
  'mortar',
  'drywall',
  'floor',
  'wood',
  'woodMaple',
  'bark',
  'barkMaple',
  'skin',
  'plastic',
  'grass',
  'bush',
  'leafMaple',
  'pineNeedle',
  'berry',
  'pants',
  'pantsRed',
  'rock',
  'cyberGlow',
  'cyberPanel',
  'water'
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
    color: new Color(1, 1, 1),
    vertexColors: true
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
  silver: {
    roughness: 0.3,
    color: new Color(0.5, 0.5, 0.5),
    metalness: 1,
    emissive: new Color(0, 0, 0)
  },
  iron: {
    roughness: 0.9,
    color: new Color(0.5, 0.1, 0),
    metalness: 1,
    emissive: new Color(0, 0, 0)
  },
  copper: {
    roughness: 0.9,
    color: new Color(0.1, 0.5, 0.2),
    metalness: 1,
    emissive: new Color(0, 0, 0)
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
  woodMaple: {
    roughness: 1,
    color: new Color(0.6, 0.4, 0.3).addScalar(0.1)
  },
  bark: {
    roughness: 1,
    metalness: 0.8,
    color: new Color(0.6, 0.4, 0.3).addScalar(-0.3)
  },
  barkMaple: {
    roughness: 1,
    metalness: 0.8,
    color: new Color(0.6, 0.4, 0.3).addScalar(-0.15)
  },
  skin: {
    roughness: 1,
    color: new Color(0.8, 0.4, 0.4)
  },
  plastic: {
    roughness: 0.5,
    color: new Color(0.2, 0.25, 0.4)
  },
  water: {
    roughness: 0.1,
    metalness: 0.05,
    color: new Color(1, 1, 1),
    vertexColors: true
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
  leafMaple: {
    roughness: 1,
    metalness: 0.95,
    color: new Color(0.75, 0.5, 0.125),
    emissive: new Color(0.2, 0.55, 0.05).multiplyScalar(0.05),
    // wireframe: true,
    opacity: 0.5
  },
  pineNeedle: {
    roughness: 0.8,
    metalness: 0.95,
    color: new Color(0.1, 0.3, 0.1),
    emissive: new Color(0.1, 0.45, 0.05).multiplyScalar(0.05),
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
  },
  cyberGlow: {
    roughness: 0.65,
    color: new Color(0.2, 0.2, 0.2),
    emissive: new Color(0.05, 0.55, 0.15)
  },
  cyberPanel: {
    roughness: 0.05,
    metalness: 0.7,
    color: new Color(0.1, 0.1, 0.1)
  }
}

const materialCache = new Map<string, Material>()

function __colorToVec4(color?: ColorRepresentation, opacity = 1) {
  const c = new Color(color)
  return new Vector4(c.r, c.g, c.b, opacity)
}

function __makeMeshMaterial(name: CuratedMaterialType, pass: MaterialPassType) {
  const standardParams = standardMaterialParamLib[name]
  switch (pass) {
    case 'beauty':
      return new MeshStandardMaterial(standardParams)
    case 'normals':
      return new WorldNormalMeshMaterial({
        wireframe: standardParams.wireframe
      })
    case 'depth':
      return new MeshDepthMaterial({
        wireframe: standardParams.wireframe
      })
    case 'customColor':
      return new BasicVec4MeshMaterial({
        data: __colorToVec4(standardParams.color, standardParams.opacity),
        wireframe: standardParams.wireframe,
        vertexColors: standardParams.vertexColors
      })
    case 'customEmissive':
      return new BasicVec4MeshMaterial({
        data: __colorToVec4(standardParams.emissive || 0, 1),
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
}
export function getMeshMaterial(
  name: CuratedMaterialType,
  pass: MaterialPassType = 'beauty'
) {
  const key = `${name}:${pass}`
  if (!materialCache.has(key)) {
    const mat = __makeMeshMaterial(name, pass)
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
export function changeMeshMaterials(
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
        const mat = getMeshMaterial(node.material.name, pass)
        node.material = mat
        if (node.material instanceof WorldNormalMeshMaterial) {
          node.onBeforeRender = __onBeforeRenderDoUpdateWorldNormals
        }
      }
    }
    for (const child of node.children) {
      changeMeshMaterials(child, pass, visibleOnly)
    }
  }
}
