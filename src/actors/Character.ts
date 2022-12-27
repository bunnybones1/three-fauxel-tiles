import { Object3D, Vector2 } from 'three'
import ICharacterController from '../controllers/ICharacterController'
import CharacterMesh from '../meshes/CharacterMesh'
import AvatarContactListener from '../physics/AvatarContactListener'
import PhysicsCharacter from '../physics/PhysicsCharacter'
import { World } from '../vendor/Box2D/Box2D'

export default class Character {
  visuals: Object3D
  private _physics: PhysicsCharacter
  get physics(): PhysicsCharacter {
    return this._physics
  }
  constructor(
    world: World,
    label = '',
    contactListener: AvatarContactListener,
    controller: ICharacterController
  ) {
    this._physics = new PhysicsCharacter(world, contactListener, controller)
    const s = new Vector2(0.1, 0.1)
    const visuals = new Object3D()
    const padding = 0.0027
    const w = s.x + padding
    const h = s.y + padding
    const torsoMesh = new CharacterMesh(w, h, label)
    visuals.add(torsoMesh)
    this.visuals = visuals
  }
  update(dt: number) {
    const char = this._physics
    const pos = char.avatarBody.GetPosition()
    this.visuals.position.set(pos.x, pos.y, 0)
    char.postPhysicsUpdate(dt)
  }
}
