import { Mesh } from 'three'
import { isNumber } from 'util'
import { materialLibrary } from '~/materials/library'
import TextMesh from '~/text/TextMesh'
import { textSettings } from '~/text/TextSettings'
import { getCachedChamferedBoxGeometry } from '~/utils/geometry'
import { PPM } from '~/utils/measurements'

const med = textSettings.keyLabel
const doubleSymbol = textSettings.keyLabelDouble
const small = textSettings.keyLabelSmall
function getFont(str: string) {
  if (str.length > 1 && str.length <= 3 && str[0] === 'F') {
    const chunks = str.split('F')
    if (isNumber(chunks[1])) {
      return doubleSymbol
    }
  }
  switch (str.length) {
    case 1:
      return med
    case 2:
      return small
    case 3:
      return str.includes('\n') ? doubleSymbol : small
    default:
      return small
  }
}
export default class KeyButtonMesh extends Mesh {
  constructor(
    width: number,
    height: number,
    depth: number,
    label = '',
    chamfer = 0.005
  ) {
    super(
      getCachedChamferedBoxGeometry(width, height, depth, chamfer),
      materialLibrary.keyboardPlasticKey
    )
    if (label !== '') {
      const labelMesh = new TextMesh(label, {
        ...getFont(label),
        width: (width - 0.003) * PPM
      })
      labelMesh.position.y += 0.0052
      labelMesh.rotation.x = -Math.PI * 0.5
      this.add(labelMesh)
    }
    this.renderOrder = 10
    this.castShadow = true
    this.receiveShadow = true
  }
}
