import CharacterGamePadController from '~/controllers/CharacterGamePadController'
import CharacterKeyboardController from '~/controllers/CharacterKeyboardController'
import ICharacterController from '~/controllers/ICharacterController'
import { rigToGamePad } from '~/helpers/utils/gamePad'
import { rigToKeyboard } from '~/input/getKeyboardInput'
import {
  Box2DPreviewMesh,
  debugPolygonPhysics
} from '~/meshes/Box2DPreviewMesh'
import AvatarContactListener from '~/physics/AvatarContactListener'
import { createPhysicBox } from '~/physics/bodyHelpers'
import PhysicsCharacter from '~/physics/PhysicsCharacter'
import { World } from '~/vendor/Box2D/Box2D'

import TestPhysicsScene from './TestPhysics'

export default class TestCharacterControlScene extends TestPhysicsScene {
  private _postUpdate: (dt: number) => void
  constructor() {
    super()

    //temporary, so we don't need graphics
    debugPolygonPhysics.value = true

    for (let i = 0; i < 10; i++) {
      createPhysicBox(this.sim.world, i - 5, -0.3, 0.5, 0.1)
    }

    this._postUpdate = startControllableCharacters(
      this.sim.world,
      this.b2Preview
    )
  }

  update(dt: number) {
    super.update(dt) //does actual physics
    this._postUpdate(dt)
  }
}

export function startControllableCharacters(
  b2World: World,
  b2Preview: Box2DPreviewMesh
) {
  let firstCharacter: PhysicsCharacter | undefined

  const postUpdates: Array<(dt: number) => void> = []

  const avatarContactListener = new AvatarContactListener()
  b2World.SetContactListener(avatarContactListener)

  const makeCharacter = (controller: ICharacterController) => {
    const pChar = new PhysicsCharacter(
      b2World,
      avatarContactListener,
      controller
    )
    postUpdates.push(pChar.postPhysicsUpdate.bind(pChar))
    if (!firstCharacter) {
      firstCharacter = pChar
    }
  }

  rigToGamePad((gamePadAPI) =>
    makeCharacter(new CharacterGamePadController(gamePadAPI))
  )

  // hacky way of testing two characters on a keyboard
  // rigToKeyboard(keyboardAPI => {
  //   makeCharacter(new CharacterKeyboardController(keyboardAPI))
  //   makeCharacter(new CharacterKeyboardController(keyboardAPI, true))
  // })

  rigToKeyboard((keyboardAPI) =>
    makeCharacter(new CharacterKeyboardController(keyboardAPI))
  )

  const postUpdate = (dt: number) => {
    if (firstCharacter) {
      b2Preview.offset.Copy(firstCharacter.avatarBody.GetPosition())
    }
    for (const pu of postUpdates) {
      pu(dt)
    }
  }
  return postUpdate
}
