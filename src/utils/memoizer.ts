export function memoize<T>(generator: () => T) {
  let result: T | undefined
  return function getResult() {
    if (!result) {
      result = generator()
    }
    return result
  }
}
