export function makeSafetyCheckFromConstStringArray<
  T extends { [index: number]: string }
>(arr: Exclude<T, Array<string>>) {
  type SpecificString = typeof arr[number]
  return function safe(x: string): x is SpecificString {
    return Array.prototype.includes.call(arr, x)
  }
}
