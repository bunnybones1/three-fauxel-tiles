import { Mesh, Object3D } from 'three'

export function findOnlyVisibleMeshes(node: Object3D, results: Mesh[] = []) {
  if (node.visible) {
    if (node instanceof Mesh) {
      results.push(node)
    }
    for (const child of node.children) {
      findOnlyVisibleMeshes(child, results)
    }
  }
  return results
}
