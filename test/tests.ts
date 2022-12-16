// import TestPhysicsTileMapPNGScene from '~/helpers/scenes/TestPhysicsTileMapPNG'
// import TestSpritesOnTileMapScene from '~/helpers/scenes/TestSpritesOnTileMapScene'
import TestTileMapScene from './helpers/scenes/TestTileMapScene'

import TestCachedScrollingJitTileShaderScene from './helpers/scenes/cachedScrollingJitTileViewShader'
import TestCachedScrollingMeshesViewShaderScene from './helpers/scenes/TestCachedScrollingMeshesViewShaderScene'
import TestCachedScrollingNoiseViewShaderScene from './helpers/scenes/TestCachedScrollingNoiseViewShaderScene'
// import TestCharacterControlScene from './helpers/scenes/TestCharacterControl'
// import TestCharacterControlOnTextScene from './helpers/scenes/TestCharacterControlOnText'
// import TestGLBScene from './helpers/scenes/TestGLB'
// import TestGraphicsCharacterScene from './helpers/scenes/TestGraphicsCharacter'
// import TestGraphicsLevelScene from './helpers/scenes/TestGraphicsLevel'
import TestJitPointTilesAndSpritesScene from './helpers/scenes/TestJitPointTilesAndSpritesScene'
import TestJitPointTilesScene from './helpers/scenes/TestJitPointTilesScene'
import TestJitTilesScene from './helpers/scenes/TestJitTilesScene'
// import TestKeyboardCharacterScene from './helpers/scenes/TestKeyboardCharacter'
import TestKeyboardInputScene from './helpers/scenes/TestKeyboardInput'
import BaseTestScene from './helpers/scenes/BaseTestScene'
import TestNoiseShaderScene from './helpers/scenes/TestNoiseShaderScene'
// import TestPhysicsScene from './helpers/scenes/TestPhysics'
// import TestPhysicsCharacterScene from './helpers/scenes/TestPhysicsCharacter'
// import TestPhysicsConcaveBodiesScene from './helpers/scenes/TestPhysicsConcaveBodies'
// import TestPhysicsPNGScene from './helpers/scenes/TestPhysicsPNG'
import TestPixelTextScene from './helpers/scenes/TestPixelText'
import TestModelScene from './helpers/scenes/TestModelScene'
import TestModel2Scene from './helpers/scenes/TestModel2Scene'
import TestModel3Scene from './helpers/scenes/TestModel3Scene'
import TestModel4Scene from './helpers/scenes/TestModel4Scene'
// import TestStencilsScene from './helpers/scenes/TestStencils'
// import TestTextScene from './helpers/scenes/TestText'
// import TestTextPhysicsScene from './helpers/scenes/TestTextPhysics'
// import TestTileViewBufferScene from './helpers/scenes/TestTileViewBufferScene'

export const testClasses: { [K: string]: any } = {
  keyboard: TestKeyboardInputScene,
  base: BaseTestScene,
  // glb: TestGLBScene,
  // physics: TestPhysicsScene,
  // textPhysics: TestTextPhysicsScene,
  // text: TestTextScene,
  pixelText: TestPixelTextScene, //pass
  tileMap: TestTileMapScene, //pass
  // spritesOnTileMap: TestSpritesOnTileMapScene,
  jitTiles: TestJitTilesScene, //pass
  jitPointTiles: TestJitPointTilesScene, //fail
  jitPointTilesAndSprites: TestJitPointTilesAndSpritesScene,
  noiseShader: TestNoiseShaderScene, //pass
  model: TestModelScene, //pass
  model2: TestModel2Scene, //pass
  model3: TestModel3Scene, //pass
  model4: TestModel4Scene, //pass
  cachedScrollingNoiseViewShader: TestCachedScrollingNoiseViewShaderScene, //pass
  cachedScrollingMeshesViewShader: TestCachedScrollingMeshesViewShaderScene, //pass
  cachedScrollingJitTileViewShader: TestCachedScrollingJitTileShaderScene //fail
  // tileViewBuffer: TestTileViewBufferScene
}
