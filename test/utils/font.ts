export function getHorizontalBias(align: string): number {
  switch (align) {
    case 'left':
      return 0
    case 'center':
      return -0.5
    case 'right':
      return -1
    default:
      return 0
  }
}
export function getVerticalBias(vAlign: string): number {
  switch (vAlign) {
    case 'top':
      return 1
    case 'center':
      return 0.5
    case 'bottom':
      return 0
    default:
      return 0
  }
}
