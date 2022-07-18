import {
  BufferGeometry,
  Camera,
  Group,
  Material,
  Mesh,
  Scene,
  WebGLRenderer,
  WebGLStencilBuffer
} from 'three'
import { materialLibrary } from '~/materials/library'

export function makeScoopMesh(mesh: Mesh) {
  const maskMesh = new Mesh(mesh.geometry, materialLibrary.scoopMask)
  maskMesh.renderOrder = mesh.renderOrder - 1
  mesh.add(maskMesh)

  maskMesh.onBeforeRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    maskPreRender(renderer.context, renderer.state.buffers.stencil)
  }
  maskMesh.onAfterRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    maskPostRender(renderer.context, renderer.state.buffers.stencil)
  }

  mesh.onBeforeRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    meshPreRender(renderer.context, renderer.state.buffers.stencil)
  }
  mesh.onAfterRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    meshPostRender(renderer.context, renderer.state.buffers.stencil)
  }
}

function maskPreRender(c: WebGLRenderingContext, b: WebGLStencilBuffer) {
  b.setTest(true)
  b.setClear(1)
  b.setMask(0xff)
  // c.stencilOpSeparate(c.BACK, c.KEEP, c.KEEP, c.REPLACE)
  // c.stencilOpSeparate(c.BACK, c.KEEP, c.KEEP, c.KEEP)
  b.setOp(c.KEEP, c.KEEP, c.REPLACE)
  // c.stencilFuncSeparate(c.BACK, c.EQUAL, 2, 0xff)
  b.setFunc(c.ALWAYS, 2, 0xff)
}
function maskPostRender(c: WebGLRenderingContext, b: WebGLStencilBuffer) {
  //
}

function meshPreRender(c: WebGLRenderingContext, b: WebGLStencilBuffer) {
  // c.stencilFuncSeparate(c.BACK, c.EQUAL, 2, 0xff)
  b.setFunc(c.EQUAL, 2, 0xff)
  b.setMask(0x00)
}
function meshPostRender(c: WebGLRenderingContext, b: WebGLStencilBuffer) {
  b.setTest(false)
}
