import { cleanRemoveFromArrayMap, pushToArrayMap } from '~/utils/arrayUtils'
import { getContactBetweenSensorAndRigidBody } from '~/utils/physics'
import { Contact, ContactListener, Fixture } from '~/vendor/Box2D/Box2D'

type SCB = (other: Fixture) => void

export default class AvatarContactListener extends ContactListener {
  contactPairs = new Map<Fixture, Fixture[]>()
  sensorBeginCallbacks = new Map<Fixture, SCB[]>()
  sensorEndCallbacks = new Map<Fixture, SCB[]>()
  constructor() {
    super()
  }
  listenForSensorBeginContact(sensor: Fixture, scb: SCB) {
    pushToArrayMap(this.sensorBeginCallbacks, sensor, scb)
  }
  listenForSensorEndContact(sensor: Fixture, scb: SCB) {
    pushToArrayMap(this.sensorEndCallbacks, sensor, scb)
  }
  BeginContact(contact: Contact) {
    const contactPair = getContactBetweenSensorAndRigidBody(contact)
    if (contactPair) {
      if (this.sensorBeginCallbacks.has(contactPair.sensor)) {
        for (const scb of this.sensorBeginCallbacks.get(contactPair.sensor)!) {
          scb(contactPair.rigidBody)
        }
      }
      pushToArrayMap(
        this.contactPairs,
        contactPair.sensor,
        contactPair.rigidBody
      )
    }
  }

  EndContact(contact: Contact) {
    const contactPair = getContactBetweenSensorAndRigidBody(contact)
    if (contactPair) {
      if (this.sensorEndCallbacks.has(contactPair.sensor)) {
        for (const scb of this.sensorEndCallbacks.get(contactPair.sensor)!) {
          scb(contactPair.rigidBody)
        }
      }
      if (contactPair) {
        cleanRemoveFromArrayMap(
          this.contactPairs,
          contactPair.sensor,
          contactPair.rigidBody
        )
      }
    }
  }
}
