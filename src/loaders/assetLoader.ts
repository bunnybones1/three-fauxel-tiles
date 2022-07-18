import { FileLoader, LoadingManager, Texture, TextureLoader } from 'three'

const __loadingManager = new LoadingManager()

let __fileLoader: FileLoader | undefined
function getFileLoader() {
  if (!__fileLoader) {
    __fileLoader = new FileLoader(__loadingManager)
  }
  return __fileLoader
}

let __textureLoader: TextureLoader | undefined
function getTextureLoader() {
  if (!__textureLoader) {
    __textureLoader = new TextureLoader(__loadingManager)
  }
  return __textureLoader
}

export async function loadJson(url: string): Promise<object> {
  return new Promise<object>((resolve, reject) =>
    getFileLoader().load(
      url,
      (fileContents: string) => resolve(JSON.parse(fileContents)),
      undefined,
      reject
    )
  )
}

export async function loadText(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    getFileLoader().load(
      url,
      (fileContents: string) => resolve(fileContents),
      undefined,
      reject
    )
  )
}

const __currentlyLoadingTextureResolvers = new Map<
  string,
  Array<(texture: Texture) => void>
>()
export async function loadTexture(
  url: string,
  flipY?: boolean
): Promise<Texture> {
  let promise: Promise<Texture>
  if (__currentlyLoadingTextureResolvers.has(url)) {
    promise = new Promise<Texture>((resolve, reject) => {
      __currentlyLoadingTextureResolvers.get(url)!.push(resolve)
    })
  } else {
    promise = new Promise<Texture>((resolve, reject) => {
      __currentlyLoadingTextureResolvers.set(url, [resolve])
      const onLoad = (texture: Texture) => {
        // texture.needsUpdate = true
        texture.name = url
        // texture.encoding = sRGBEncoding
        if (flipY !== undefined) {
          texture.flipY = flipY
        }
        // XXX Using this filter to get rid of NPOT warnings, is not best quality fix later
        // texture.minFilter = NearestFilter
        // texture.magFilter = NearestFilter
        __currentlyLoadingTextureResolvers
          .get(url)!
          .forEach((resolve) => resolve(texture))
        __currentlyLoadingTextureResolvers.delete(url)
      }
      getTextureLoader().load(url, onLoad, undefined, reject)
    })
  }
  return promise
}
