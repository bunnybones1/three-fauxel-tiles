import { TextSettings } from './TextSettings'

const centered: Partial<TextSettings> = {
  align: 'center',
  vAlign: 'center'
}
const left: Partial<TextSettings> = {
  ...centered,
  align: 'left'
}
const right: Partial<TextSettings> = {
  ...centered,
  align: 'right'
}
const title: Partial<TextSettings> = {
  ...centered,
  width: 300
}
export const textLayouts = {
  centered,
  left,
  right,
  title
}
