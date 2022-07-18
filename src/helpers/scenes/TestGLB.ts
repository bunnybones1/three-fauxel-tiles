import {
  AnimationMixer,
  Box3,
  CubeCamera,
  LoadingManager,
  Mesh,
  Object3D,
  PMREMGenerator,
  WebGLRenderer
} from 'three'
import TestLightingScene from './TestLighting'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class TestGLBScene extends TestLightingScene {
  animMixer: AnimationMixer
  cubeCamera: CubeCamera
  cubeCameraReady = false
  monster: Object3D
  constructor() {
    super(false, true)

    const loadingManager = new LoadingManager()
    const gltfLoader = new GLTFLoader(loadingManager)

    gltfLoader.load(
      //   "https://ipfs.io/ipfs/QmZpMiq31VfvL5kUcxD9AzVhunJyvngSMvurfrCUqemPwr",
      // "https://ipfs.io/ipfs/QmZxavjHxGgtf7R1qcapVczqnp1taGDh7hx51nNvMRndJK",
      //   'https://ipfs.io/ipfs/QmVvHsRNKs97zaeqLyne5TyAwVuUHQkpedFVmCRHyVc1sN',
      'https://ipfs.io/ipfs/QmZpihdgVwfJ27sTYaAR8AVTjy4oijo7u93GmX71W2Qqva',
      // "https://ipfs.io/ipfs/Qmd7J66cpbhaRzzWRPHbgaTMRrg5oRP7TogdaqmAsL6rz9",
      // "https://ipfs.io/ipfs/QmaH4KXxXvy41DpMYUMRixsJjy4VjQUbvZTPkrrYdSJoWU",
      // "https://ipfs.io/ipfs/QmZwZ2QZh4SjJFFaj8xYqs4UgMkM67QDtANxQwfiBrYkSu",
      (gltf) => {
        if (gltf.animations[0]) {
          const animMixer = new AnimationMixer(gltf.scene)
          animMixer.clipAction(gltf.animations[0]).play()
          this.animMixer = animMixer
        }
        for (let index = gltf.scene.children.length - 1; index >= 0; index--) {
          const child = gltf.scene.children[index]

          child.traverse((obj) => {
            if (obj instanceof Mesh) {
              obj.castShadow = true
              obj.receiveShadow = true
            }
          })
        }
        this.scene.add(gltf.scene)
        gltf.scene.updateMatrixWorld()
        const bounds = new Box3().setFromObject(gltf.scene)
        this.monster = gltf.scene
        const s = bounds.max.y - bounds.min.y
        gltf.scene.position.y = -bounds.min.y / s
        gltf.scene.position.z += 0.2
        gltf.scene.scale.multiplyScalar(1 / s)
      },
      (ev) => {
        /* */
      },
      (ev) => {
        // debugger;
      }
    )
  }
  render(renderer: WebGLRenderer, dt: number) {
    if (!this.scene.environment) {
      const p = new PMREMGenerator(renderer)
      const pt = p.fromScene(this.scene, 0.1, 0.001, 1000)
      this.scene.environment = pt.texture
    }
    super.render(renderer, dt)
  }
  update(dt: number) {
    super.update(dt)
    if (this.animMixer) {
      this.animMixer.update(dt)
    }
  }
}
