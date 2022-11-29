export default class LocalStorageMap<K extends string, V> extends Map {
  constructor(
    private _hydrator: (val: string) => V,
    private _dehydrator: (val: V) => string
  ) {
    super()
  }
  has(key: K) {
    return super.has(key) || !!localStorage.getItem(key)
  }
  get(key: K) {
    if (!super.has(key)) {
      const localV = localStorage.getItem(key)
      if (localV) {
        super.set(key, this._hydrator(localV))
      }
    }
    return super.get(key)
  }
  set(key: K, value: V) {
    localStorage.setItem(key, this._dehydrator(value))
    return super.set(key, value)
  }
  delete(key: K) {
    localStorage.removeItem(key)
    return super.delete(key)
  }
}
