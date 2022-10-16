// src/utils/location.ts
import { Color as Color2 } from "three";

// src/utils/colors.ts
import { Color, MeshBasicMaterial } from "three";

// src/utils/math.ts
import {
  Plane,
  Ray,
  Raycaster,
  Vector2,
  Vector3
} from "three";

// src/device.ts
var Device = class {
  width;
  height;
  aspect;
  deviceWidth;
  deviceHeight;
  deviceAspect;
  orientation;
  pixelRatio;
  targetFPS = 60;
  useTouch;
  type;
  listeners = /* @__PURE__ */ new Set();
  cachedPPCm = -1;
  constructor() {
    window.addEventListener("resize", () => {
      this.handleChange();
      setTimeout(this.handleChange, 50);
    });
    this.handleChange();
  }
  handleChange = () => {
    this.useTouch = /Mobi|Android|iPhone|iPad|BlackBerry|Windows Phone|webOS/i.test(navigator.userAgent);
    if (this.width === window.innerWidth && this.height === window.innerHeight) {
      return;
    }
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.deviceHeight = Math.min(this.width, this.height);
    this.deviceWidth = Math.max(this.width, this.height);
    this.deviceAspect = this.deviceWidth / this.deviceHeight;
    this.pixelRatio = window.devicePixelRatio;
    this.orientation = this.aspect < 1 ? "portrait" : "landscape";
    this.type = this.useTouch ? this.deviceWidth < 1024 && this.deviceAspect > 1.6 ? "mobile" : "tablet" : "desktop";
    this.listeners.forEach((listener) => listener());
  };
  onChange(listener, firstOneForFree = false) {
    this.listeners.add(listener);
    if (firstOneForFree) {
      listener();
    }
    return () => this.listeners.delete(listener);
  }
  get isMobile() {
    return this.type === "mobile";
  }
  get isTablet() {
    return this.type === "tablet";
  }
  get isDesktop() {
    return this.type === "desktop";
  }
  get pixelsPerCm() {
    if (this.cachedPPCm === -1) {
      const div = document.createElement("div");
      div.style.height = "1in";
      const body = document.getElementsByTagName("body")[0];
      body.appendChild(div);
      const ppi = getComputedStyle(div, null).getPropertyValue("height");
      body.removeChild(div);
      this.cachedPPCm = parseFloat(ppi) * 2.54;
    }
    return this.cachedPPCm;
  }
  get screenHeightCms() {
    return this.height / this.pixelsPerCm;
  }
  get screenWidthCms() {
    return this.width / this.pixelsPerCm;
  }
  get screenShorterCms() {
    return Math.min(this.width, this.height) / this.pixelsPerCm;
  }
  setFPS(fps = 60) {
    this.targetFPS = fps;
  }
};
var device = new Device();
window.device = device;
var device_default = device;

// src/utils/math.ts
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
function wrap(val, min, max) {
  const range = max - min;
  return ((val - min) % range + range) % range + min;
}
var TWO_PI = 2 * Math.PI;
var RADIANS_TO_DEGREES = 180 / Math.PI;
var DEGREES_TO_RADIANS = Math.PI / 180;
var ray = new Ray();
var flatPlane = new Plane(new Vector3(0, -1, 0), 1);
var anyPlane = new Plane(new Vector3(0, -1, 0), 1);
var intersection = new Vector3();
var __v2 = new Vector2();
var __raycaster = new Raycaster();
var tau = Math.PI * 2;
var tauAndHalf = Math.PI * 3;
function rand2(scale = 1, offset = 0) {
  return (Math.random() * 2 - 1) * scale + offset;
}
function inferDirection(val, tolerance = 1e-5) {
  if (val < -tolerance) {
    return -1;
  } else if (val > tolerance) {
    return 1;
  } else {
    return 0;
  }
}
var phi = (Math.sqrt(5) + 1) * 0.5 - 1;
var ga = phi * Math.PI * 2;
function pointOnSphereFibonacci(index, total) {
  return [ga * index, Math.asin(-1 + 2 * index / total)];
}
function longLatToXYZ(longLat, radius) {
  const long = longLat[0];
  const lat = longLat[1];
  return [
    Math.cos(lat) * Math.cos(long) * radius,
    Math.sin(lat) * radius,
    Math.cos(lat) * Math.sin(long) * radius
  ];
}
function powerOfTwo(x) {
  return Math.log2(x) % 1 === 0;
}
function assertPowerOfTwo(x) {
  if (!powerOfTwo(x)) {
    throw new Error(`${x} is not a power of two`);
  }
}

// src/utils/colors.ts
var __whiteColor = new Color(1, 1, 1);
var __tempColor = new Color();

// src/utils/location.ts
function getUrlParam(param) {
  __setReminder(param);
  return new URL(window.location.href).searchParams.get(param);
}
function getUrlFlag(param) {
  const result = getUrlParam(param);
  return !!(result === "" || result && result !== "false");
}
function __getUrlNumber(param, defaultVal, parser, min = -Infinity, max = Infinity) {
  return clamp(parser(getUrlParam(param) || defaultVal.toString()), min, max);
}
function getUrlFloat(param, defaultVal, min = -Infinity, max = Infinity) {
  return __getUrlNumber(param, defaultVal, parseFloat, min, max);
}
function getUrlInt(param, defaultVal, min = -Infinity, max = Infinity) {
  return __getUrlNumber(param, defaultVal, parseInt, min, max);
}
var __keysToRemember = [];
var __reminderQueued = false;
function __setReminder(name) {
  if (!__keysToRemember.includes(name)) {
    __keysToRemember.push(name);
    if (!__reminderQueued) {
      __reminderQueued = true;
      setTimeout(() => {
        console.log("Nice Parameters to try: " + __keysToRemember.join(", "));
        __reminderQueued = false;
      }, 2e3);
    }
  }
}

// src/constants.ts
var RESET_USER_SETTINGS_TO_DEFAULTS = getUrlFlag("resetSettings");
var initOffset = {
  x: getUrlInt("x", 0),
  y: getUrlInt("y", 0)
};
var sunSpeed = getUrlFloat("sunSpeed", -1e-3);
var sunOffset = getUrlFloat("sunOffset", 0.5);
var verticalScale = Math.SQRT2 / 2;

// src/helpers/utils/NoiseHelper2D.ts
import { makeNoise2D } from "fast-simplex-noise";

// src/utils/random.ts
function sfc32(a, b, c, d) {
  return function deterministicRandom() {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = a + b | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
var genPhysics = sfc32(100, 200, 300, 444);
var genGraphics = sfc32(100, 200, 300, 444);
function detRandGraphics(min = 0, max = 1) {
  return genGraphics() * (max - min) + min;
}
var genGrass = sfc32(100, 200, 300, 444);
function detRandGrass(min = 0, max = 1) {
  return genGrass() * (max - min) + min;
}
var genLights = sfc32(100, 200, 300, 444);
var genRocks = sfc32(100, 200, 300, 444);
function detRandRocks(min = 0, max = 1) {
  return genRocks() * (max - min) + min;
}
var genTrees = sfc32(100, 200, 300, 444);
function detRandTrees(min = 0, max = 1) {
  return genTrees() * (max - min) + min;
}
var genTreesMaple = sfc32(100, 200, 300, 444);
function detRandTreesMaple(min = 0, max = 1) {
  return genTreesMaple() * (max - min) + min;
}
var genWoodPlanks = sfc32(100, 152, 353, 504);
function detRandWoodPlanks(min = 0, max = 1) {
  return genWoodPlanks() * (max - min) + min;
}

// src/helpers/utils/NoiseHelper2D.ts
var NoiseHelper2D = class {
  constructor(_scale, _offsetX = 0, _offsetY = 0, seed = 0, _strength = 1) {
    this._scale = _scale;
    this._offsetX = _offsetX;
    this._offsetY = _offsetY;
    this._strength = _strength;
    const randGenerator = sfc32(100 + seed, 200 + seed, 300 + seed, 444 + seed);
    this._noise = makeNoise2D(randGenerator);
  }
  _noise;
  getValue(x, y) {
    return this._noise(x * this._scale + this._offsetX, y * this._scale + this._offsetY) * this._strength;
  }
};

// src/helpers/utils/ThreshNoiseHelper2D.ts
var ThreshNoiseHelper2D = class {
  constructor(noiseLayers, _defaultThresh = 0) {
    this._defaultThresh = _defaultThresh;
    this._noiseLayers = noiseLayers instanceof NoiseHelper2D ? [noiseLayers] : noiseLayers;
  }
  static simple(scale, offsetX, offsetY, thresh, seed, strength) {
    return new ThreshNoiseHelper2D(new NoiseHelper2D(scale, offsetX, offsetY, seed, strength), thresh);
  }
  _noiseLayers;
  getValue(x, y) {
    let val = 0;
    for (const noise of this._noiseLayers) {
      val += noise.getValue(x, y);
    }
    return val;
  }
  getTreshold(x, y, thresh = this._defaultThresh) {
    return this.getValue(x, y) > thresh ? 1 : 0;
  }
};

// src/rendering/tileMaker/mapTileMaker/JITTileSampler.ts
var masks32 = [];
for (let i = 0; i < 32; i++) {
  masks32[i] = 1 << i;
}
var metaTileStrings = [
  "floor",
  "beam",
  "bricks",
  "drywall",
  "grass",
  "bush",
  "goldPile",
  "lampPost",
  "testObject",
  "pyramid",
  "rockyGround",
  "rocks",
  "goldOreForRocks",
  "harvested",
  "treePine",
  "maturePlant",
  "treeMaple"
];
var visualPropertyLookupStrings = [
  "layer2",
  "floor",
  "beamCenter",
  "beamN",
  "beamE",
  "beamS",
  "beamW",
  "beamNS",
  "beamEW",
  "bricks0",
  "bricks1",
  "bricks2",
  "bricks3",
  "bricks4",
  "bricks5",
  "bricks6",
  "bricks7",
  "bricks8",
  "bricks9",
  "bricks10",
  "bricks11",
  "ground",
  "grassC",
  "grassN",
  "grassNE",
  "grassE",
  "grassSE",
  "grassS",
  "grassSW",
  "grassW",
  "grassNW",
  "bushC",
  "bushN",
  "bushNE",
  "bushE",
  "bushSE",
  "bushS",
  "bushSW",
  "bushW",
  "bushNW",
  "goldPile",
  "lampPost",
  "testObject",
  "pyramid",
  "rockyGround",
  "rocksC",
  "rocksCBig",
  "rocksN",
  "rocksNE",
  "rocksE",
  "rocksSE",
  "rocksS",
  "rocksSW",
  "rocksW",
  "rocksNW",
  "goldOreForRocks",
  "goldOreForBigRocks",
  "rockCrumbsC",
  "rockCrumbsN",
  "rockCrumbsNE",
  "rockCrumbsE",
  "rockCrumbsSE",
  "rockCrumbsS",
  "rockCrumbsSW",
  "rockCrumbsW",
  "rockCrumbsNW",
  "treePineC",
  "treePineN",
  "treePineNE",
  "treePineE",
  "treePineSE",
  "treePineS",
  "treePineSW",
  "treePineW",
  "treePineNW",
  "treePineMatureC",
  "treePineMatureN",
  "treePineMatureNE",
  "treePineMatureE",
  "treePineMatureSE",
  "treePineMatureS",
  "treePineMatureSW",
  "treePineMatureW",
  "treePineMatureNW",
  "treePineStump",
  "treePineStumpMature",
  "treeMapleC",
  "treeMapleN",
  "treeMapleNE",
  "treeMapleE",
  "treeMapleSE",
  "treeMapleS",
  "treeMapleSW",
  "treeMapleW",
  "treeMapleNW",
  "treeMapleMatureC",
  "treeMapleMatureN",
  "treeMapleMatureNE",
  "treeMapleMatureE",
  "treeMapleMatureSE",
  "treeMapleMatureS",
  "treeMapleMatureSW",
  "treeMapleMatureW",
  "treeMapleMatureNW",
  "treeMapleStump",
  "treeMapleStumpMature"
];
var masks8 = [];
for (let i = 0; i < 8; i++) {
  masks8[i] = 1 << i;
}
var JITTileSampler = class {
  constructor(_tileMaker, _viewWidthInTiles, _viewHeightInTiles) {
    this._tileMaker = _tileMaker;
    this._viewWidthInTiles = _viewWidthInTiles;
    this._viewHeightInTiles = _viewHeightInTiles;
    this.bytesPerTile = Math.ceil(visualPropertyLookupStrings.length / 8);
    const seed = 1;
    const floorNoise = ThreshNoiseHelper2D.simple(0.1, 0, 0, 0.5, seed);
    const beamNoise = ThreshNoiseHelper2D.simple(0.08, -100, -100, 0.4, seed);
    const bricksNoise = ThreshNoiseHelper2D.simple(0.06, -50, -50, 0.5, seed);
    const drywallNoise = ThreshNoiseHelper2D.simple(0.05, 20, 20, 0.5, seed);
    const grassNoise = ThreshNoiseHelper2D.simple(0.15, 100, 200, -0.2, seed);
    const bushNoise = ThreshNoiseHelper2D.simple(0.3, 300, 200, 0.25, seed);
    const goldNoise = ThreshNoiseHelper2D.simple(3, -300, 200, 0.75, seed);
    const lampPostNoise = ThreshNoiseHelper2D.simple(3, -1300, 200, 0.75, seed);
    const testObjectNoise = ThreshNoiseHelper2D.simple(3, -100, -300, 0.75, seed);
    const pyramidNoise = ThreshNoiseHelper2D.simple(3, -204, -121, 0.85, seed);
    const rockyGroundNoise = ThreshNoiseHelper2D.simple(3, 204, -121, 0.25, seed);
    const rocksNoise = ThreshNoiseHelper2D.simple(0.05, 604, -121, 0.7, seed);
    const goldOreForRocksNoise = new ThreshNoiseHelper2D([
      new NoiseHelper2D(0.05, 604, -121, seed),
      new NoiseHelper2D(0.8, 604, -121, seed, 0.2)
    ], 0.97);
    const harvestedNoise = ThreshNoiseHelper2D.simple(0.08, -500, -100, 0.35, seed);
    const treePineNoise = ThreshNoiseHelper2D.simple(0.3, -200, -400, 0.5, seed);
    const plantMatureNoise = ThreshNoiseHelper2D.simple(3, -340, -460, 0.25, seed);
    const treeMapleNoise = ThreshNoiseHelper2D.simple(0.3, 200, 400, 0.6, seed);
    this.metaNoiseGenerators = [
      floorNoise,
      beamNoise,
      bricksNoise,
      drywallNoise,
      grassNoise,
      bushNoise,
      goldNoise,
      lampPostNoise,
      testObjectNoise,
      pyramidNoise,
      rockyGroundNoise,
      rocksNoise,
      goldOreForRocksNoise,
      harvestedNoise,
      treePineNoise,
      plantMatureNoise,
      treeMapleNoise
    ];
  }
  get offsetX() {
    return this._offsetX;
  }
  set offsetX(value) {
    this._offsetsDirty = true;
    this._offsetX = value;
  }
  get offsetY() {
    return this._offsetY;
  }
  set offsetY(value) {
    this._offsetsDirty = true;
    this._offsetY = value;
  }
  get tileMaker() {
    return this._tileMaker;
  }
  set tileMaker(value) {
    throw new Error("Cannot change tileMaker during runtime");
  }
  metaNoiseGenerators;
  bytesPerTile;
  localMetaProps;
  visProps;
  metaCache = /* @__PURE__ */ new Map();
  metaPropertyMasks;
  dirtyMeta = /* @__PURE__ */ new Set();
  dirtyVis = /* @__PURE__ */ new Set();
  _offsetX = initOffset.x;
  _offsetY = initOffset.y;
  _offsetsDirty;
  get offsetsDirty() {
    return this._offsetsDirty;
  }
  set offsetsDirty(value) {
    this._offsetsDirty = value;
  }
  _offsetXOld = initOffset.x;
  _offsetYOld = initOffset.y;
  flipMeta(x, y, meta, validate = true) {
    this.writeMeta(x, y, this.metaBitsFlip(this.sampleMeta(x, y), meta));
    if (validate) {
      this.validateLocalMeta(x, y);
    }
  }
  metaBitsHas(val, maskName) {
    return val & masks32[metaTileStrings.indexOf(maskName)];
  }
  metaBitsFlip(val, maskName) {
    return val ^ masks32[metaTileStrings.indexOf(maskName)];
  }
  visualBitsEnable(val, maskName) {
    const i = visualPropertyLookupStrings.indexOf(maskName);
    const ib = ~~(i / 8);
    const i8 = i % 8;
    val[ib] |= masks8[i8];
  }
  localMetaBitsFlip(maskName) {
    this.localMetaProps = this.metaBitsFlip(this.localMetaProps, maskName);
  }
  localMetaBitsHas(maskName) {
    return this.metaBitsHas(this.localMetaProps, maskName);
  }
  writeMeta(x, y, meta) {
    const key = x + ":" + y;
    if (this.metaCache.has(key) && this.metaCache.get(key)) {
      this.metaCache.set(key, meta);
    }
    this.dirtyMeta.add(key);
    this.localMetaProps = meta;
  }
  sampleMeta(x, y) {
    const key = x + ":" + y;
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key);
    }
    this.localMetaProps = this.metaNoiseGenerators.reduce((accum, noise, j) => {
      return accum + (noise.getTreshold(x, y) << j);
    }, 0);
    return this.validateLocalMeta(x, y);
  }
  validateLocalMeta(x, y) {
    const key = x + ":" + y;
    if (!this.localMetaBitsHas("floor") && this.localMetaBitsHas("beam")) {
      this.localMetaBitsFlip("beam");
    }
    if (this.localMetaBitsHas("beam") && this.localMetaBitsHas("grass")) {
      this.localMetaBitsFlip("grass");
    }
    if (!this.localMetaBitsHas("beam") && this.localMetaBitsHas("bricks")) {
      this.localMetaBitsFlip("bricks");
    }
    if (this.localMetaBitsHas("floor") && this.localMetaBitsHas("grass")) {
      this.localMetaBitsFlip("grass");
    }
    if (this.localMetaBitsHas("floor") && this.localMetaBitsHas("bush")) {
      this.localMetaBitsFlip("bush");
    }
    if (!this.localMetaBitsHas("grass") && this.localMetaBitsHas("bush")) {
      this.localMetaBitsFlip("bush");
    }
    if (this.localMetaBitsHas("testObject") && (this.localMetaBitsHas("bush") || this.localMetaBitsHas("pyramid"))) {
      this.localMetaBitsFlip("testObject");
    }
    if (this.localMetaBitsHas("lampPost") && (this.localMetaBitsHas("beam") || this.localMetaBitsHas("bush") || this.localMetaBitsHas("bricks") || this.localMetaBitsHas("goldPile") || this.localMetaBitsHas("testObject"))) {
      this.localMetaBitsFlip("lampPost");
    }
    if (this.localMetaBitsHas("pyramid") && (this.localMetaBitsHas("bush") || this.localMetaBitsHas("beam") || this.localMetaBitsHas("lampPost") || this.localMetaBitsHas("lampPost") || this.localMetaBitsHas("grass") || !this.localMetaBitsHas("floor") || this.localMetaBitsHas("goldPile"))) {
      this.localMetaBitsFlip("pyramid");
    }
    if (this.localMetaBitsHas("rockyGround") && (this.localMetaBitsHas("beam") || this.localMetaBitsHas("bush") || this.localMetaBitsHas("floor") || this.localMetaBitsHas("grass") || this.localMetaBitsHas("bricks") || this.localMetaBitsHas("goldPile") || this.localMetaBitsHas("testObject"))) {
      this.localMetaBitsFlip("rockyGround");
    }
    if (this.localMetaBitsHas("rocks")) {
      const wasHarvested = this.localMetaBitsHas("harvested");
      const hasGold = this.localMetaBitsHas("goldOreForRocks");
      this.localMetaProps = 0;
      this.localMetaBitsFlip("rocks");
      if (hasGold) {
        this.localMetaBitsFlip("goldOreForRocks");
      }
      if (wasHarvested) {
        this.localMetaBitsFlip("harvested");
      }
    }
    const hasAnyTree = this.localMetaBitsHas("treePine") || this.localMetaBitsHas("treeMaple");
    if (hasAnyTree && this.localMetaBitsHas("bush")) {
      this.localMetaBitsFlip("bush");
    }
    if (hasAnyTree && this.localMetaBitsHas("goldPile")) {
      this.localMetaBitsFlip("goldPile");
    }
    if (hasAnyTree && this.localMetaBitsHas("testObject")) {
      this.localMetaBitsFlip("testObject");
    }
    if (this.localMetaBitsHas("lampPost") || !this.localMetaBitsHas("grass")) {
      if (this.localMetaBitsHas("treePine")) {
        this.localMetaBitsFlip("treePine");
      }
      if (this.localMetaBitsHas("treeMaple")) {
        this.localMetaBitsFlip("treeMaple");
      }
    }
    if (this.localMetaBitsHas("treePine") && this.localMetaBitsHas("treeMaple")) {
      this.localMetaBitsFlip("treeMaple");
    }
    if (getUrlFlag("simple")) {
      const item = this.localMetaBitsHas("floor");
      const item2 = this.localMetaBitsHas("beam");
      const item3 = this.localMetaBitsHas("bricks");
      this.localMetaProps = 0;
      if (item) {
        this.localMetaBitsFlip("floor");
      }
      if (item2) {
        this.localMetaBitsFlip("beam");
      }
      if (item3) {
        this.localMetaBitsFlip("bricks");
      }
    }
    this.metaCache.set(key, this.localMetaProps);
    return this.localMetaProps;
  }
  myVisualBitsEnable(maskName) {
    this.visualBitsEnable(this.visProps, maskName);
  }
  sampleVis(x, y) {
    const metaPropsN = this.sampleMeta(x, y - 1);
    const metaPropsNE = this.sampleMeta(x + 1, y - 1);
    const metaPropsE = this.sampleMeta(x + 1, y);
    const metaPropsSE = this.sampleMeta(x + 1, y + 1);
    const metaPropsS = this.sampleMeta(x, y + 1);
    const metaPropsSW = this.sampleMeta(x - 1, y + 1);
    const metaPropsW = this.sampleMeta(x - 1, y);
    const metaPropsNW = this.sampleMeta(x - 1, y - 1);
    const metaProps = this.sampleMeta(x, y);
    this.localMetaProps = metaProps;
    this.visProps = new Uint8Array(this.bytesPerTile);
    this.myVisualBitsEnable(this.localMetaBitsHas("floor") ? "floor" : "ground");
    const propMaskGrass = masks32[metaTileStrings.indexOf("grass")];
    if (this.localMetaBitsHas("grass")) {
      this.myVisualBitsEnable("grassC");
      if (metaPropsN & propMaskGrass) {
        this.myVisualBitsEnable("grassN");
      }
      if (metaPropsE & propMaskGrass) {
        this.myVisualBitsEnable("grassE");
      }
      if (metaPropsS & propMaskGrass) {
        this.myVisualBitsEnable("grassS");
      }
      if (metaPropsW & propMaskGrass) {
        this.myVisualBitsEnable("grassW");
      }
      if (metaPropsNE & propMaskGrass && metaPropsN & propMaskGrass && metaPropsE & propMaskGrass) {
        this.myVisualBitsEnable("grassNE");
      }
      if (metaPropsNW & propMaskGrass && metaPropsN & propMaskGrass && metaPropsW & propMaskGrass) {
        this.myVisualBitsEnable("grassNW");
      }
      if (metaPropsSE & propMaskGrass && metaPropsS & propMaskGrass && metaPropsE & propMaskGrass) {
        this.myVisualBitsEnable("grassSE");
      }
      if (metaPropsSW & propMaskGrass && metaPropsS & propMaskGrass && metaPropsW & propMaskGrass) {
        this.myVisualBitsEnable("grassSW");
      }
    }
    const propMaskBush = masks32[metaTileStrings.indexOf("bush")];
    if (this.localMetaBitsHas("bush")) {
      this.myVisualBitsEnable("bushC");
      if (metaPropsN & propMaskBush) {
        this.myVisualBitsEnable("bushN");
      }
      if (metaPropsE & propMaskBush) {
        this.myVisualBitsEnable("bushE");
      }
      if (metaPropsS & propMaskBush) {
        this.myVisualBitsEnable("bushS");
      }
      if (metaPropsW & propMaskBush) {
        this.myVisualBitsEnable("bushW");
      }
      if (metaPropsNE & propMaskBush && metaPropsN & propMaskBush && metaPropsE & propMaskBush) {
        this.myVisualBitsEnable("bushNE");
      }
      if (metaPropsNW & propMaskBush && metaPropsN & propMaskBush && metaPropsW & propMaskBush) {
        this.myVisualBitsEnable("bushNW");
      }
      if (metaPropsSE & propMaskBush && metaPropsS & propMaskBush && metaPropsE & propMaskBush) {
        this.myVisualBitsEnable("bushSE");
      }
      if (metaPropsSW & propMaskBush && metaPropsS & propMaskBush && metaPropsW & propMaskBush) {
        this.myVisualBitsEnable("bushSW");
      }
    }
    const propMaskBeam = masks32[metaTileStrings.indexOf("beam")];
    const beamC = metaProps & propMaskBeam;
    const beamN = metaPropsN & propMaskBeam;
    const beamE = metaPropsE & propMaskBeam;
    const beamS = metaPropsS & propMaskBeam;
    const beamW = metaPropsW & propMaskBeam;
    if (beamC) {
      if (beamE && beamW && !beamS && !beamN) {
        this.myVisualBitsEnable("beamEW");
      } else if (!beamE && !beamW && beamS && beamN) {
        this.myVisualBitsEnable("beamNS");
      } else {
        this.myVisualBitsEnable("beamCenter");
        if (beamE) {
          this.myVisualBitsEnable("beamE");
        }
        if (beamW) {
          this.myVisualBitsEnable("beamW");
        }
        if (beamN) {
          this.myVisualBitsEnable("beamN");
        }
        if (beamS) {
          this.myVisualBitsEnable("beamS");
        }
      }
    }
    const propMaskBricks = masks32[metaTileStrings.indexOf("bricks")];
    if (metaProps & propMaskBricks) {
      const bricksS = metaPropsN & propMaskBricks;
      const bricksE = metaPropsE & propMaskBricks;
      const bricksN = metaPropsS & propMaskBricks;
      const bricksW = metaPropsW & propMaskBricks;
      if (bricksN) {
        this.myVisualBitsEnable("bricks0");
        this.myVisualBitsEnable("bricks1");
      } else if (!(beamC && beamS)) {
        this.myVisualBitsEnable("bricks8");
      }
      if (bricksE) {
        this.myVisualBitsEnable("bricks2");
        this.myVisualBitsEnable("bricks3");
      } else if (!(beamC && beamE)) {
        this.myVisualBitsEnable("bricks9");
      }
      if (bricksW) {
        this.myVisualBitsEnable("bricks7");
        this.myVisualBitsEnable("bricks6");
      } else if (!(beamC && beamW)) {
        this.myVisualBitsEnable("bricks11");
      }
      if (bricksS) {
        this.myVisualBitsEnable("bricks4");
        this.myVisualBitsEnable("bricks5");
      } else if (!(beamC && beamN)) {
        this.myVisualBitsEnable("bricks10");
      }
    }
    const propMaskGold = masks32[metaTileStrings.indexOf("goldPile")];
    if (metaProps & propMaskGold) {
      this.myVisualBitsEnable("goldPile");
    }
    const propMaskLampPost = masks32[metaTileStrings.indexOf("lampPost")];
    if (metaProps & propMaskLampPost) {
      this.myVisualBitsEnable("lampPost");
    }
    const propMaskTestObject = masks32[metaTileStrings.indexOf("testObject")];
    if (metaProps & propMaskTestObject) {
      this.myVisualBitsEnable("testObject");
    }
    const propMaskPyramid = masks32[metaTileStrings.indexOf("pyramid")];
    if (metaProps & propMaskPyramid) {
      this.myVisualBitsEnable("pyramid");
    }
    const propMaskRockyGround = masks32[metaTileStrings.indexOf("rockyGround")];
    if (metaProps & propMaskRockyGround) {
      this.myVisualBitsEnable("rockyGround");
    }
    const propMaskRocks = masks32[metaTileStrings.indexOf("rocks")];
    const propMaskHarvested = masks32[metaTileStrings.indexOf("harvested")];
    const isRocksC = metaProps & propMaskRocks;
    const isHarvestedC = metaProps & propMaskHarvested;
    const isGoldOre = this.localMetaBitsHas("goldOreForRocks");
    if (isRocksC) {
      const isRocksN = metaPropsN & propMaskRocks;
      const isHarvestedN = metaPropsN & propMaskHarvested;
      const isRocksE = metaPropsE & propMaskRocks;
      const isHarvestedE = metaPropsE & propMaskHarvested;
      const isRocksS = metaPropsS & propMaskRocks;
      const isHarvestedS = metaPropsS & propMaskHarvested;
      const isRocksW = metaPropsW & propMaskRocks;
      const isHarvestedW = metaPropsW & propMaskHarvested;
      const isRocksNE = metaPropsNE & propMaskRocks;
      const isHarvestedNE = metaPropsNE & propMaskHarvested;
      const isRocksSE = metaPropsSE & propMaskRocks;
      const isHarvestedSE = metaPropsSE & propMaskHarvested;
      const isRocksSW = metaPropsSW & propMaskRocks;
      const isHarvestedSW = metaPropsSW & propMaskHarvested;
      const isRocksNW = metaPropsNW & propMaskRocks;
      const isHarvestedNW = metaPropsNW & propMaskHarvested;
      this.myVisualBitsEnable(isHarvestedC ? "rockCrumbsC" : "rocksC");
      if (isRocksN) {
        this.myVisualBitsEnable(isHarvestedN || isHarvestedC ? "rockCrumbsN" : "rocksN");
      }
      if (isRocksS) {
        this.myVisualBitsEnable(isHarvestedS || isHarvestedC ? "rockCrumbsS" : "rocksS");
      }
      if (isRocksE) {
        this.myVisualBitsEnable(isHarvestedE || isHarvestedC ? "rockCrumbsE" : "rocksE");
      }
      if (isRocksW) {
        this.myVisualBitsEnable(isHarvestedW || isHarvestedC ? "rockCrumbsW" : "rocksW");
      }
      if (isRocksW && isRocksN && isRocksNW) {
        this.myVisualBitsEnable(isHarvestedW || isHarvestedN || isHarvestedNW || isHarvestedC ? "rockCrumbsNW" : "rocksNW");
      }
      if (isRocksE && isRocksN && isRocksNE) {
        this.myVisualBitsEnable(isHarvestedE || isHarvestedN || isHarvestedNE || isHarvestedC ? "rockCrumbsNE" : "rocksNE");
      }
      if (isRocksW && isRocksS && isRocksSW) {
        this.myVisualBitsEnable(isHarvestedW || isHarvestedS || isHarvestedSW || isHarvestedC ? "rockCrumbsSW" : "rocksSW");
      }
      if (isRocksE && isRocksS && isRocksSE) {
        this.myVisualBitsEnable(isHarvestedE || isHarvestedS || isHarvestedSE || isHarvestedC ? "rockCrumbsSE" : "rocksSE");
      }
      if (!isHarvestedC) {
        if (isRocksN && isRocksE && isRocksS && isRocksW && !isHarvestedN && !isHarvestedE && !isHarvestedS && !isHarvestedW) {
          this.myVisualBitsEnable("rocksCBig");
          if (isGoldOre) {
            this.myVisualBitsEnable("goldOreForBigRocks");
          }
        } else {
          if (isGoldOre) {
            this.myVisualBitsEnable("goldOreForRocks");
          }
        }
      }
    }
    const propMaskMaturePlant = masks32[metaTileStrings.indexOf("maturePlant")];
    const propMaskTreePine = masks32[metaTileStrings.indexOf("treePine")];
    if (metaProps & propMaskTreePine && !(metaProps & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaProps & propMaskMaturePlant ? "Mature" : ""}C`);
    }
    if (metaPropsE & propMaskTreePine && !(metaPropsE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsE & propMaskMaturePlant ? "Mature" : ""}E`);
    }
    if (metaPropsW & propMaskTreePine && !(metaPropsW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsW & propMaskMaturePlant ? "Mature" : ""}W`);
    }
    if (metaPropsN & propMaskTreePine && !(metaPropsN & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsN & propMaskMaturePlant ? "Mature" : ""}N`);
    }
    if (metaPropsS & propMaskTreePine && !(metaPropsS & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsS & propMaskMaturePlant ? "Mature" : ""}S`);
    }
    if (metaPropsNE & propMaskTreePine && !(metaPropsNE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsNE & propMaskMaturePlant ? "Mature" : ""}NE`);
    }
    if (metaPropsSW & propMaskTreePine && !(metaPropsSW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsSW & propMaskMaturePlant ? "Mature" : ""}SW`);
    }
    if (metaPropsNW & propMaskTreePine && !(metaPropsNW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsNW & propMaskMaturePlant ? "Mature" : ""}NW`);
    }
    if (metaPropsSE & propMaskTreePine && !(metaPropsSE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treePine${metaPropsSE & propMaskMaturePlant ? "Mature" : ""}SE`);
    }
    if (metaProps & propMaskTreePine && metaProps & propMaskHarvested) {
      this.myVisualBitsEnable(`treePineStump${metaProps & propMaskMaturePlant ? "Mature" : ""}`);
    }
    const propMaskTreeMaple = masks32[metaTileStrings.indexOf("treeMaple")];
    if (metaProps & propMaskTreeMaple && !(metaProps & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaProps & propMaskMaturePlant ? "Mature" : ""}C`);
    }
    if (metaPropsE & propMaskTreeMaple && !(metaPropsE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsE & propMaskMaturePlant ? "Mature" : ""}E`);
    }
    if (metaPropsW & propMaskTreeMaple && !(metaPropsW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsW & propMaskMaturePlant ? "Mature" : ""}W`);
    }
    if (metaPropsN & propMaskTreeMaple && !(metaPropsN & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsN & propMaskMaturePlant ? "Mature" : ""}N`);
    }
    if (metaPropsS & propMaskTreeMaple && !(metaPropsS & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsS & propMaskMaturePlant ? "Mature" : ""}S`);
    }
    if (metaPropsNE & propMaskTreeMaple && !(metaPropsNE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsNE & propMaskMaturePlant ? "Mature" : ""}NE`);
    }
    if (metaPropsSW & propMaskTreeMaple && !(metaPropsSW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsSW & propMaskMaturePlant ? "Mature" : ""}SW`);
    }
    if (metaPropsNW & propMaskTreeMaple && !(metaPropsNW & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsNW & propMaskMaturePlant ? "Mature" : ""}NW`);
    }
    if (metaPropsSE & propMaskTreeMaple && !(metaPropsSE & propMaskHarvested)) {
      this.myVisualBitsEnable(`treeMaple${metaPropsSE & propMaskMaturePlant ? "Mature" : ""}SE`);
    }
    if (metaProps & propMaskTreeMaple && metaProps & propMaskHarvested) {
      this.myVisualBitsEnable(`treeMapleStump${metaProps & propMaskMaturePlant ? "Mature" : ""}`);
    }
    const idBottom = this._tileMaker.getTileId(this.visProps);
    const visProps2 = this.visProps.slice();
    visProps2[0] |= 1;
    const idTop = this._tileMaker.getTileId(visProps2);
    return {
      idBottom,
      idTop
    };
  }
  updateMeta() {
    if (this.dirtyMeta.size > 0) {
      this.dirtyMeta.forEach((v) => {
        const coords = v.split(":").map((v2) => parseInt(v2));
        const x = coords[0];
        const y = coords[1];
        for (let cY = -1; cY <= 1; cY++) {
          for (let cX = -1; cX <= 1; cX++) {
            const visKey = `${x + cX}:${y + cY}`;
            this.dirtyVis.add(visKey);
          }
        }
      });
      this.dirtyMeta.clear();
      return true;
    } else {
      return false;
    }
  }
  updateVis(bottomPointsGeo, topPointsGeo) {
    if (this._offsetsDirty) {
      this._offsetsDirty = false;
      if (this._offsetX !== this._offsetXOld) {
        let xMin = this._offsetX < this._offsetXOld ? this._offsetX : this._offsetXOld;
        let xMax = this._offsetX > this._offsetXOld ? this._offsetX : this._offsetXOld;
        if (this._offsetX === xMax) {
          xMin += this._viewWidthInTiles;
          xMax += this._viewWidthInTiles;
        }
        for (let iCol = xMin; iCol < xMax; iCol++) {
          for (let iRow = 0; iRow < this._viewHeightInTiles; iRow++) {
            const x = iCol;
            const y = this._offsetY + iRow;
            const key = `${x}:${y}`;
            this.dirtyVis.add(key);
          }
        }
      }
      if (this._offsetY !== this._offsetYOld) {
        let yMin = this._offsetY < this._offsetYOld ? this._offsetY : this._offsetYOld;
        let yMax = this._offsetY > this._offsetYOld ? this._offsetY : this._offsetYOld;
        if (this._offsetY === yMax) {
          yMin += this._viewHeightInTiles;
          yMax += this._viewHeightInTiles;
        }
        for (let iRow = yMin; iRow < yMax; iRow++) {
          for (let iCol = 0; iCol < this._viewWidthInTiles; iCol++) {
            const x = this._offsetX + iCol;
            const y = iRow;
            const key = `${x}:${y}`;
            this.dirtyVis.add(key);
          }
        }
      }
      this._offsetXOld = this._offsetX;
      this._offsetYOld = this._offsetY;
    }
    if (this.dirtyVis.size > 0) {
      const xyBottomAttr = bottomPointsGeo.getAttribute("xy");
      const xyBottomArr = xyBottomAttr.array;
      const idBottomAttr = bottomPointsGeo.getAttribute("id");
      const idBottomArr = idBottomAttr.array;
      const xyTopAttr = topPointsGeo.getAttribute("xy");
      const xyTopArr = xyTopAttr.array;
      const idTopAttr = topPointsGeo.getAttribute("id");
      const idTopArr = idTopAttr.array;
      this.dirtyVis.forEach((v) => {
        const coords = v.split(":").map((v2) => parseInt(v2));
        const i = bottomPointsGeo.drawRange.count;
        const i2 = i * 2;
        const x = coords[0];
        const y = coords[1];
        const xWrapped = wrap(x, 0, this._viewWidthInTiles);
        const yWrapped = wrap(y, 0, this._viewHeightInTiles);
        xyBottomArr[i2] = xWrapped;
        xyBottomArr[i2 + 1] = yWrapped;
        xyBottomArr[i2 + 2] = xWrapped;
        xyBottomArr[i2 + 3] = yWrapped + 1;
        xyTopArr[i2] = xWrapped;
        xyTopArr[i2 + 1] = yWrapped;
        xyTopArr[i2 + 2] = xWrapped;
        xyTopArr[i2 + 3] = yWrapped + 1;
        const sampleDown = this.sampleVis(x, y - 1);
        const sampleCenter = this.sampleVis(x, y);
        const sampleUp = this.sampleVis(x, y + 1);
        idBottomArr[i] = sampleCenter.idBottom;
        idBottomArr[i + 1] = sampleUp.idBottom;
        idTopArr[i] = sampleDown.idTop;
        idTopArr[i + 1] = sampleCenter.idTop;
        bottomPointsGeo.drawRange.count += 2;
        topPointsGeo.drawRange.count += 2;
      });
      xyBottomAttr.needsUpdate = true;
      idBottomAttr.needsUpdate = true;
      xyTopAttr.needsUpdate = true;
      idTopAttr.needsUpdate = true;
      this.dirtyVis.clear();
      return true;
    } else {
      return false;
    }
  }
};

// src/rendering/tileMaker/mapTileMaker/MapTileMaker.ts
import {
  BoxBufferGeometry as BoxBufferGeometry2,
  Mesh as Mesh11,
  Object3D as Object3D12,
  SphereGeometry,
  TorusKnotBufferGeometry,
  Vector4 as Vector44
} from "three";

// src/geometries/FibonacciSphereGeometry.ts
import triangulate from "delaunay-triangulate";
import { BufferAttribute, BufferGeometry, Vector3 as Vector32 } from "three";
var FibonacciSphereGeometry = class extends BufferGeometry {
  constructor(radius, total) {
    super();
    radius = radius !== void 0 ? radius : 20;
    total = total !== void 0 ? total : 20;
    const verticeArrays = [];
    const vertices = [];
    let i;
    let hash;
    let uniqueIndex;
    for (i = 0; i < total; i++) {
      const longLat = pointOnSphereFibonacci(i, total);
      const long = longLat[0];
      const lat = longLat[1];
      const vertArr = [
        Math.cos(lat) * Math.cos(long) * radius,
        Math.sin(lat) * radius,
        Math.cos(lat) * Math.sin(long) * radius
      ];
      verticeArrays.push(vertArr);
      vertices.push(new Vector32().fromArray(vertArr));
    }
    const tetras = triangulate(verticeArrays);
    const triangles = [];
    for (i = 0; i < tetras.length; i++) {
      const tetra = tetras[i];
      triangles.push(tetra[0], tetra[1], tetra[3]);
      triangles.push(tetra[0], tetra[2], tetra[1]);
      triangles.push(tetra[0], tetra[3], tetra[2]);
      triangles.push(tetra[3], tetra[1], tetra[2]);
    }
    const uniques = [];
    const counts = [];
    let tempTri = [];
    function uniqueTriOrderSort(a, b) {
      return a - b;
    }
    for (i = 0; i < triangles.length; i += 3) {
      tempTri[0] = triangles[i];
      tempTri[1] = triangles[i + 1];
      tempTri[2] = triangles[i + 2];
      tempTri = tempTri.sort(uniqueTriOrderSort);
      hash = tempTri[0] + "," + tempTri[1] + "," + tempTri[2];
      uniqueIndex = uniques.indexOf(hash);
      if (uniqueIndex === -1) {
        uniqueIndex = uniques.length;
        uniques.push(hash);
        counts.push(0);
      }
      counts[uniqueIndex]++;
    }
    const indices = [];
    for (i = 0; i < triangles.length; i += 3) {
      tempTri[0] = triangles[i];
      tempTri[1] = triangles[i + 1];
      tempTri[2] = triangles[i + 2];
      tempTri = tempTri.sort(uniqueTriOrderSort);
      hash = tempTri[0] + "," + tempTri[1] + "," + tempTri[2];
      uniqueIndex = uniques.indexOf(hash);
      if (counts[uniqueIndex] === 1) {
        indices.push(triangles[i]);
        indices.push(triangles[i + 2]);
        indices.push(triangles[i + 1]);
      }
    }
    const positionArray = new Float32Array(verticeArrays.length * 3);
    for (let i2 = 0; i2 < verticeArrays.length; i2++) {
      const i3 = i2 * 3;
      const vertArr = verticeArrays[i2];
      positionArray[i3] = vertArr[0];
      positionArray[i3 + 1] = vertArr[1];
      positionArray[i3 + 2] = vertArr[2];
    }
    this.setAttribute("position", new BufferAttribute(positionArray, 3));
    this.setIndex(indices);
    this.computeVertexNormals();
  }
};

// src/geometries/GrassGeometry.ts
import {
  BufferGeometry as BufferGeometry2,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3 as Vector33
} from "three";
var GrassGeometry = class extends BufferGeometry2 {
  constructor(count = 200) {
    super();
    const itemSize = 3;
    const posArr = new Float32Array(count * 3 * itemSize);
    const normalArr = new Float32Array(count * 3 * itemSize);
    const pos = new Vector33();
    const posA = new Vector33();
    const posB = new Vector33();
    const offset = new Vector33();
    const normalUp = new Vector33(0, 1, 0);
    const normal = new Vector33(0, 1, 0);
    const ab = new Vector33(0, 1, 0);
    const grassScale = 1;
    for (let i = 0; i < count; i++) {
      const angle = detRandGrass(-Math.PI, Math.PI);
      offset.x = Math.cos(angle) * 2 * grassScale;
      offset.z = Math.sin(angle) * 2 * grassScale;
      const i9 = i * 9;
      const polarAngle = detRandGrass(-Math.PI, Math.PI);
      const polarDistance = (1 - Math.pow(1 - detRandGrass(0, 1), 2)) * 15;
      pos.set(Math.cos(polarAngle) * polarDistance, 0, Math.sin(polarAngle) * polarDistance);
      posA.copy(pos).add(offset);
      posB.copy(pos).sub(offset);
      pos.y += detRandGrass(1, 3) * grassScale;
      posA.toArray(posArr, i9);
      pos.toArray(posArr, i9 + 3);
      posB.toArray(posArr, i9 + 6);
      normal.subVectors(posA, posB);
      ab.subVectors(pos, posA);
      normal.cross(ab);
      normal.normalize();
      normalUp.set(0, 1, 0);
      normalUp.lerp(normal, 0);
      normalUp.normalize();
      normalUp.toArray(normalArr, i9);
      normalUp.toArray(normalArr, i9 + 6);
      normalUp.lerp(normal, 0.1);
      normalUp.normalize();
      normalUp.toArray(normalArr, i9 + 3);
    }
    const indexArr = new Uint16Array(count * 3);
    const count3 = count * 3;
    for (let i = 0; i < count3; i++) {
      indexArr[i] = i;
    }
    const posAttr = new Float32BufferAttribute(posArr, itemSize);
    this.setAttribute("position", posAttr);
    const normalAttr = new Float32BufferAttribute(normalArr, itemSize);
    this.setAttribute("normal", normalAttr);
    const index = new Uint16BufferAttribute(indexArr, 1);
    this.setIndex(index);
  }
};

// src/geometries/PyramidGeometry.ts
import { BufferGeometry as BufferGeometry3, Vector3 as Vector34 } from "three";
var PyramidGeometry = class extends BufferGeometry3 {
  constructor() {
    super();
    const vc = new Vector34(0, 1, 0);
    const vlt = new Vector34(-0.5, 0, -0.5);
    const vlb = new Vector34(-0.5, 0, 0.5);
    const vrb = new Vector34(0.5, 0, 0.5);
    const vrt = new Vector34(0.5, 0, -0.5);
    const pts = [vc, vlt, vlb, vc, vlb, vrb, vc, vrb, vrt, vc, vrt, vlt];
    this.setFromPoints(pts);
    this.computeVertexNormals();
  }
};

// src/helpers/materials/materialLib.ts
import {
  Color as Color3,
  DoubleSide as DoubleSide4,
  Material,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  Vector4 as Vector43
} from "three";

// src/materials/BasicVec4MeshMaterial/index.ts
import { DoubleSide, RawShaderMaterial, Uniform, Vector4 } from "three";

// src/utils/jsUtils.ts
function NOOP() {
}
function buildParameters(defaults, options) {
  if (defaults === options) {
    return defaults;
  }
  const final = {};
  for (const key in defaults) {
    if (defaults[key] !== void 0) {
      final[key] = defaults[key];
    }
  }
  for (const key in options) {
    if (options[key] !== void 0) {
      final[key] = options[key];
    }
  }
  return final;
}
function defaultNumber(val, defVal) {
  return val !== void 0 ? val : defVal;
}

// src/materials/BasicVec4MeshMaterial/frag.glsl
var frag_default = "precision highp float;\nuniform vec4 color;\n\nvoid main() {\n	gl_FragColor = color;\n}";

// src/materials/BasicVec4MeshMaterial/vert.glsl
var vert_default = "precision highp float;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nattribute vec3 position;\n\nvoid main() {\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

// src/materials/BasicVec4MeshMaterial/index.ts
var __defaultParams = {
  data: new Vector4(0.5, 0.5, 0.5, 0.5)
};
var BasicVec4MeshMaterial = class extends RawShaderMaterial {
  constructor(options = {}) {
    const params = buildParameters(__defaultParams, options);
    const uniforms = {
      color: new Uniform(params.data)
    };
    super({
      uniforms,
      vertexShader: vert_default,
      fragmentShader: frag_default,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      wireframe: params.wireframe || false
    });
  }
};

// src/materials/HeightMeshMaterial/index.ts
import { DoubleSide as DoubleSide2, RawShaderMaterial as RawShaderMaterial2, Uniform as Uniform2, Vector4 as Vector42 } from "three";

// src/materials/HeightMeshMaterial/frag.glsl
var frag_default2 = "precision highp float;\nuniform vec4 color;\nvarying float vHeight;\n\n\nvoid main() {\n	gl_FragColor = color;\n	gl_FragColor.HEIGHT_CHANNEL = vHeight * 0.5;\n}";

// src/materials/HeightMeshMaterial/vert.glsl
var vert_default2 = "precision highp float;\n\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nattribute vec3 position;\nvarying float vHeight;\n\nvoid main() {\n    vec4 pos = vec4( position, 1.0 );\n    vec4 mPosition = modelMatrix * pos;\n    vec4 mvPosition = modelViewMatrix * pos;\n    gl_Position = projectionMatrix * mvPosition;\n    vHeight = mPosition.y / 32.0;\n}";

// src/materials/HeightMeshMaterial/index.ts
var __defaultParams2 = {
  data: new Vector42(0.5, 0.5, 0.5, 0.5),
  heightChannel: "b"
};
var HeightMeshMaterial = class extends RawShaderMaterial2 {
  constructor(options = {}) {
    const params = buildParameters(__defaultParams2, options);
    const uniforms = {
      color: new Uniform2(params.data)
    };
    const defines = {
      HEIGHT_CHANNEL: params.heightChannel
    };
    super({
      uniforms,
      defines,
      vertexShader: vert_default2,
      fragmentShader: frag_default2,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide2,
      wireframe: params.wireframe || false
    });
  }
};

// src/materials/WorldNormalMeshMaterial/index.ts
import { DoubleSide as DoubleSide3, Matrix3, RawShaderMaterial as RawShaderMaterial3, Uniform as Uniform3 } from "three";

// src/materials/WorldNormalMeshMaterial/frag.glsl
var frag_default3 = "precision highp float;\nvarying vec4 vColor;\n\n\nvoid main() {\n	gl_FragColor = vColor;\n}";

// src/materials/WorldNormalMeshMaterial/vert.glsl
var vert_default3 = "precision highp float;\n\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat3 uModelNormalMatrix;\n// uniform mat3 normalMatrix;\nattribute vec3 normal;\nattribute vec3 position;\nvarying vec4 vColor;\n\nvoid main() {\n    vec4 pos = vec4( position, 1.0 );\n    vec3 mNormal = normalize(uModelNormalMatrix * normal);\n    vec4 mvPosition = modelViewMatrix * pos;\n    gl_Position = projectionMatrix * mvPosition;\n    vColor = vec4(mNormal * 0.5 + 0.5, 1.0);\n}";

// src/materials/WorldNormalMeshMaterial/index.ts
var __defaultParams3 = {};
var WorldNormalMeshMaterial = class extends RawShaderMaterial3 {
  modelNormalMatrix;
  constructor(options = {}) {
    const modelNormalMatrix = new Matrix3();
    modelNormalMatrix.elements[0] = Math.random();
    modelNormalMatrix.elements[1] = Math.random();
    modelNormalMatrix.elements[2] = Math.random();
    modelNormalMatrix.elements[3] = Math.random();
    modelNormalMatrix.elements[4] = Math.random();
    const params = buildParameters(__defaultParams3, options);
    const uniforms = {
      uModelNormalMatrix: new Uniform3(modelNormalMatrix)
    };
    super({
      uniforms,
      vertexShader: vert_default3,
      fragmentShader: frag_default3,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide3,
      wireframe: params.wireframe || false
    });
    this.modelNormalMatrix = this.uniforms.uModelNormalMatrix.value;
  }
};

// src/helpers/typeHelpers.ts
function makeSafetyCheckFromConstStringArray(arr) {
  return function safe(x) {
    return Array.prototype.includes.call(arr, x);
  };
}

// src/helpers/materials/materialLib.ts
var CuratedMaterialTypeStrings = [
  "ironBlack",
  "ground",
  "brick",
  "gold",
  "mortar",
  "drywall",
  "floor",
  "wood",
  "woodMaple",
  "bark",
  "barkMaple",
  "skin",
  "plastic",
  "grass",
  "bush",
  "leafMaple",
  "pineNeedle",
  "berry",
  "pants",
  "pantsRed",
  "rock"
];
var isCuratedMaterial = makeSafetyCheckFromConstStringArray(CuratedMaterialTypeStrings);
var MaterialPassTypeStrings = [
  "beauty",
  "normals",
  "depth",
  "customColor",
  "customEmissive",
  "customRoughnessMetalnessHeight",
  "customTopDownHeight",
  "pointLights"
];
var isMaterialPass = makeSafetyCheckFromConstStringArray(MaterialPassTypeStrings);
var standardMaterialParamLib = {
  ground: {
    roughness: 1,
    color: new Color3(0.16, 0.14, 0.13)
  },
  brick: {
    roughness: 1,
    color: new Color3(0.5, 0.2, 0.15),
    metalness: 0.3
  },
  gold: {
    roughness: 0.3,
    color: new Color3(0.5, 0.4, 0),
    metalness: 1,
    emissive: new Color3(0.05, 0, 0)
  },
  ironBlack: {
    roughness: 0.1,
    color: new Color3(0.01, 0.01, 0.015),
    metalness: 0.9
  },
  mortar: {
    roughness: 1,
    color: new Color3(0.2, 0.2, 0.2)
  },
  drywall: {
    roughness: 1,
    color: new Color3(0.8, 0.8, 0.8)
  },
  floor: {
    roughness: 1,
    color: new Color3(0.4, 0.32, 0.25)
  },
  wood: {
    roughness: 1,
    color: new Color3(0.6, 0.4, 0.3)
  },
  woodMaple: {
    roughness: 1,
    color: new Color3(0.6, 0.4, 0.3).addScalar(0.1)
  },
  bark: {
    roughness: 1,
    metalness: 0.8,
    color: new Color3(0.6, 0.4, 0.3).addScalar(-0.3)
  },
  barkMaple: {
    roughness: 1,
    metalness: 0.8,
    color: new Color3(0.6, 0.4, 0.3).addScalar(-0.15)
  },
  skin: {
    roughness: 1,
    color: new Color3(0.8, 0.4, 0.4)
  },
  plastic: {
    roughness: 0.5,
    color: new Color3(0.2, 0.25, 0.4)
  },
  rock: {
    roughness: 0.85,
    metalness: 0.95,
    color: new Color3(0.2, 0.25, 0.2)
  },
  grass: {
    roughness: 1,
    metalness: 0.95,
    color: new Color3(0.2, 0.55, 0.2),
    emissive: new Color3(0.2, 0.55, 0.05).multiplyScalar(0.05),
    wireframe: true,
    side: DoubleSide4,
    opacity: 0.5
  },
  bush: {
    roughness: 1,
    metalness: 0.95,
    color: new Color3(0.125, 0.3, 0.125),
    emissive: new Color3(0.2, 0.55, 0.05).multiplyScalar(0.05),
    opacity: 0.5
  },
  leafMaple: {
    roughness: 1,
    metalness: 0.95,
    color: new Color3(0.75, 0.5, 0.125),
    emissive: new Color3(0.2, 0.55, 0.05).multiplyScalar(0.05),
    opacity: 0.5
  },
  pineNeedle: {
    roughness: 0.8,
    metalness: 0.95,
    color: new Color3(0.1, 0.3, 0.1),
    emissive: new Color3(0.1, 0.45, 0.05).multiplyScalar(0.05),
    opacity: 0.5
  },
  berry: {
    roughness: 0.25,
    metalness: 0.6,
    color: new Color3(0.6, 0.05, 0.1325),
    opacity: 0.25
  },
  pants: {
    roughness: 0.65,
    color: new Color3(0.2, 0.25, 0.4)
  },
  pantsRed: {
    roughness: 0.65,
    color: new Color3(0.5, 0.1, 0.1)
  }
};
var materialCache = /* @__PURE__ */ new Map();
function __makeMeshMaterial(name, pass) {
  const standardParams = standardMaterialParamLib[name];
  switch (pass) {
    case "beauty":
      return new MeshStandardMaterial(standardParams);
    case "normals":
      return new WorldNormalMeshMaterial({
        wireframe: standardParams.wireframe
      });
      break;
    case "depth":
      return new MeshDepthMaterial({
        wireframe: standardParams.wireframe
      });
      break;
    case "customColor":
      const c = new Color3(standardParams.color);
      return new BasicVec4MeshMaterial({
        data: new Vector43(c.r, c.g, c.b, standardParams.opacity),
        wireframe: standardParams.wireframe
      });
    case "customEmissive":
      const e = new Color3(standardParams.emissive || 0);
      return new BasicVec4MeshMaterial({
        data: new Vector43(e.r, e.g, e.b, 1),
        wireframe: standardParams.wireframe
      });
    case "customRoughnessMetalnessHeight":
      return new HeightMeshMaterial({
        data: new Vector43(defaultNumber(standardParams.roughness, 0.5), defaultNumber(standardParams.metalness, 0.5), 1, 1),
        heightChannel: "b",
        wireframe: standardParams.wireframe
      });
    case "customTopDownHeight":
      return new HeightMeshMaterial({
        data: new Vector43(0, 0, 0, 1),
        heightChannel: "b",
        wireframe: standardParams.wireframe
      });
    default:
      throw new Error(`Please add implementation for ${pass}`);
  }
  throw new Error("Unknown material pass requested");
}
function getMeshMaterial(name, pass = "beauty") {
  const key = `${name}:${pass}`;
  if (!materialCache.has(key)) {
    const mat = __makeMeshMaterial(name, pass);
    mat.name = name;
    materialCache.set(key, mat);
  }
  return materialCache.get(key).clone();
}
function __onBeforeRenderDoUpdateWorldNormals(renderer, scene, camera, geometry, material, group) {
  const modelNormalMatrix = material.uniforms.uModelNormalMatrix.value;
  modelNormalMatrix.getNormalMatrix(this.matrixWorld);
}
function changeMeshMaterials(node, pass, visibleOnly = false) {
  if (!visibleOnly || visibleOnly && node.visible) {
    if (node instanceof Mesh && node.material instanceof Material) {
      if (isCuratedMaterial(node.material.name)) {
        if (node.material instanceof WorldNormalMeshMaterial) {
          node.onBeforeRender = NOOP;
        }
        const mat = getMeshMaterial(node.material.name, pass);
        node.material = mat;
        if (node.material instanceof WorldNormalMeshMaterial) {
          node.onBeforeRender = __onBeforeRenderDoUpdateWorldNormals;
        }
      }
    }
    for (const child of node.children) {
      changeMeshMaterials(child, pass, visibleOnly);
    }
  }
}

// src/utils/geometry.ts
import { SphereBufferGeometry, Vector3 as Vector35 } from "three";
function getChamferedBoxGeometry(width, height, depth, chamfer = 5e-3) {
  const geo = new SphereBufferGeometry(0.02, 8, 5, Math.PI * 0.125);
  const posArr = geo.attributes.position.array;
  const normArr = geo.attributes.normal.array;
  const tempVec = new Vector35();
  const tempPos = new Vector35();
  const halfWidth = width * 0.5 - chamfer;
  const halfHeight = height * 0.5 - chamfer;
  const halfDepth = depth * 0.5 - chamfer;
  for (let i3 = 0; i3 < normArr.length; i3 += 3) {
    tempVec.fromArray(normArr, i3);
    tempPos.fromArray(posArr, i3);
    tempVec.round();
    if (tempVec.y === 1) {
      tempVec.set(0, 1, 0);
    }
    if (tempVec.y === -1) {
      tempVec.set(0, -1, 0);
    }
    tempVec.toArray(normArr, i3);
    tempVec.multiplyScalar(chamfer);
    tempVec.x += halfWidth * inferDirection(tempPos.x);
    tempVec.y += halfHeight * inferDirection(tempPos.y);
    tempVec.z += halfDepth * inferDirection(tempPos.z);
    tempVec.toArray(posArr, i3);
  }
  return geo;
}
var __cachedChamferedBoxGeometry = /* @__PURE__ */ new Map();
function getCachedChamferedBoxGeometry(width, height, depth, chamfer = 5e-3) {
  const key = `${width};${height};${depth};${chamfer};`;
  if (!__cachedChamferedBoxGeometry.has(key)) {
    __cachedChamferedBoxGeometry.set(key, getChamferedBoxGeometry(width, height, depth, chamfer));
  }
  return __cachedChamferedBoxGeometry.get(key);
}

// src/meshes/factoryRocks.ts
import { Mesh as Mesh2, Object3D as Object3D3, Vector3 as Vector36 } from "three";
var tiltRange = 0.2;
function makeRocks(mat, scale = 0, chamfer = 0.5) {
  const pivot = new Object3D3();
  const pos = new Vector36();
  for (let i = 0; i < 80; i++) {
    pos.set(detRandRocks(-1, 1), detRandRocks(0, 1), detRandRocks(-1, 1)).normalize();
    if (pos.x + pos.z > 1) {
      continue;
    }
    const size = ~~detRandRocks(6, 16) + scale * 0.5;
    const rocks = new Mesh2(getCachedChamferedBoxGeometry(size, 4, size * 0.5, chamfer), mat);
    rocks.rotation.z = Math.PI * -0.25;
    rocks.position.copy(pos);
    rocks.position.multiplyScalar(12);
    rocks.position.y += scale - 4;
    rocks.rotation.x += detRandRocks(-tiltRange, tiltRange);
    rocks.rotation.y += detRandRocks(-tiltRange, tiltRange);
    rocks.rotation.z += detRandRocks(-tiltRange, tiltRange);
    pivot.add(rocks);
  }
  pivot.rotation.y = Math.PI * -0.1;
  return pivot;
}

// src/meshes/factoryRockCrumbs.ts
import { Mesh as Mesh3, Object3D as Object3D4, Vector3 as Vector37 } from "three";
var tiltRange2 = 0.3;
function makeRockCrumbs(mat, chamfer = 0.5) {
  const pivot = new Object3D4();
  const pos = new Vector37();
  for (let i = 0; i < 20; i++) {
    pos.set(detRandRocks(-1, 1), 0, detRandRocks(-1, 1));
    if (pos.x + pos.z > 1) {
      continue;
    }
    const size = ~~detRandRocks(2, 5);
    const rocks = new Mesh3(getCachedChamferedBoxGeometry(size, 4, size * 0.5, chamfer), mat);
    rocks.rotation.z = Math.PI * -0.25;
    rocks.position.copy(pos);
    rocks.position.multiplyScalar(12);
    rocks.rotation.x += detRandRocks(-tiltRange2, tiltRange2);
    rocks.rotation.y += detRandRocks(-tiltRange2, tiltRange2);
    rocks.rotation.z += detRandRocks(-tiltRange2, tiltRange2);
    pivot.add(rocks);
  }
  pivot.rotation.y = Math.PI * -0.1;
  return pivot;
}

// src/meshes/factoryTreePine.ts
import {
  CylinderBufferGeometry,
  Mesh as Mesh4,
  Object3D as Object3D5,
  Vector3 as Vector38
} from "three";
function makeTreePineStumpMature(matBark, matWood) {
  const tiltRange3 = 0.1;
  const height = 10;
  const baseRadius = 5;
  const pivot = new Object3D5();
  const wood = new Mesh4(new CylinderBufferGeometry(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 80; i++) {
    const size = ~~detRandTrees(6, 8);
    const bark = new Mesh4(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTrees(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2));
    const angle = detRandTrees(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTrees(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  return pivot;
}
function makeTreePineStump(matBark, matWood) {
  const tiltRange3 = 0.1;
  const height = 5;
  const baseRadius = 3;
  const pivot = new Object3D5();
  const wood = new Mesh4(new CylinderBufferGeometry(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 60; i++) {
    const size = ~~detRandTrees(3, 5);
    const bark = new Mesh4(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTrees(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2));
    const angle = detRandTrees(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTrees(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  return pivot;
}
function makeTreePineMature(matBark, matLeaf, matWood) {
  const tiltRange3 = 0.1;
  const height = 32;
  const baseRadius = 5;
  const baseRadiusInner = baseRadius - 1;
  const pivot = new Object3D5();
  const wood = new Mesh4(new CylinderBufferGeometry(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 260; i++) {
    const size = ~~detRandTrees(6, 8);
    const bark = new Mesh4(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTrees(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2));
    const angle = detRandTrees(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTrees(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  const pineNeedleProto = new Mesh4(__getNeedleGeo(), matLeaf);
  const twigLength = 4;
  const twigProto = new Mesh4(__getTwigGeo(twigLength), matBark);
  __addPineNeedles(twigProto, pineNeedleProto, twigLength);
  const tLayer = 2;
  for (let iLayer = 0; iLayer < tLayer; iLayer++) {
    const lRatio = iLayer / tLayer;
    const tB = 7;
    for (let iB = 0; iB < tB; iB++) {
      const bRatio = (iB + lRatio) / tB;
      const aB = Math.PI * 2 * bRatio;
      const branch = new Object3D5();
      let lastTwig = branch;
      const tTwig = 9 - iLayer * 2;
      for (let iTwig = 0; iTwig < tTwig; iTwig++) {
        const twigTilt = 0.05 * iTwig;
        const newTwig = twigProto.clone();
        lastTwig.add(newTwig);
        newTwig.rotation.x = detRandTrees(-twigTilt, twigTilt);
        newTwig.rotation.z = detRandTrees(-twigTilt, twigTilt);
        newTwig.rotation.y = Math.PI;
        newTwig.position.y = twigLength;
        lastTwig = newTwig;
      }
      pivot.add(branch);
      branch.position.set(Math.cos(aB) * baseRadiusInner, 25 + iLayer * 8, Math.sin(aB) * baseRadiusInner);
      branch.rotation.z = -Math.PI * 0.65;
      branch.rotation.y = aB;
    }
  }
  return pivot;
}
function makeTreePine(matBark, matLeaf) {
  const tiltRange3 = 0.1;
  const height = 32;
  const baseRadius = 0;
  const baseRadiusInner = baseRadius - 1;
  const pivot = new Object3D5();
  for (let i = 0; i < 160; i++) {
    const size = ~~detRandTrees(6, 8);
    const bark = new Mesh4(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTrees(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTrees(0, 2));
    const angle = detRandTrees(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTrees(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTrees(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  const twigLength = 5;
  const pineNeedleProto = new Mesh4(__getNeedleGeo(), matLeaf);
  const twigProto = new Mesh4(__getTwigGeo(twigLength), matBark);
  __addPineNeedles(twigProto, pineNeedleProto, twigLength);
  const tLayer = 3;
  for (let iLayer = 0; iLayer < tLayer; iLayer++) {
    const lRatio = iLayer / tLayer;
    const tB = 9 - iLayer * 2;
    for (let iB = 0; iB < tB; iB++) {
      const bRatio = (iB + lRatio) / tB;
      const aB = Math.PI * 2 * bRatio;
      const branch = new Object3D5();
      branch.scale.multiplyScalar(0.75);
      let lastTwig = branch;
      const tTwig = 7 - iLayer * 2;
      for (let iTwig = 0; iTwig < tTwig; iTwig++) {
        const twigTilt = 0.05 * iTwig;
        const newTwig = twigProto.clone();
        lastTwig.add(newTwig);
        newTwig.rotation.x = detRandTrees(-twigTilt, twigTilt);
        newTwig.rotation.z = detRandTrees(-twigTilt, twigTilt);
        newTwig.rotation.y = Math.PI;
        newTwig.position.y = twigLength;
        lastTwig = newTwig;
      }
      pivot.add(branch);
      branch.position.set(Math.cos(aB) * baseRadiusInner, 25 + iLayer * 8, Math.sin(aB) * baseRadiusInner);
      branch.rotation.z = -Math.PI * (0.75 + iLayer * 0.1);
      branch.rotation.y = aB;
    }
  }
  const topperPivot = new Object3D5();
  const topperProto = new Object3D5();
  __addPineNeedles(topperProto, pineNeedleProto, 0);
  pivot.add(topperPivot);
  topperPivot.position.y = height + 14;
  topperPivot.rotation.x = Math.PI;
  for (let i = 0; i < 3; i++) {
    const newTopper = topperProto.clone();
    newTopper.rotation.y = i * Math.PI;
    newTopper.position.y = i * 3;
    newTopper.scale.setScalar(0.5 + i * 0.3);
    topperPivot.add(newTopper);
  }
  return pivot;
}
var __needleGeo;
function __getNeedleGeo() {
  if (!__needleGeo) {
    __needleGeo = getChamferedBoxGeometry(2, 4, 2, 1);
    const posArr = __needleGeo.attributes.position.array;
    const vec = new Vector38();
    for (let i3 = 0; i3 < posArr.length; i3 += 3) {
      vec.fromArray(posArr, i3);
      vec.y = (vec.y + 2) * 3;
      vec.toArray(posArr, i3);
    }
  }
  return __needleGeo;
}
function __addPineNeedles(target, pineNeedleProto, offsetY) {
  const tNeedles = 5;
  const needleTilt = 0.5;
  for (let i = 0; i < tNeedles; i++) {
    const a = Math.PI * 2 * i / tNeedles;
    const x = Math.cos(a) * needleTilt;
    const y = Math.sin(a) * needleTilt;
    const pineNeedle = pineNeedleProto.clone();
    pineNeedle.position.y = offsetY;
    pineNeedle.rotation.x = x;
    pineNeedle.rotation.z = y;
    target.add(pineNeedle);
  }
}
var __twigGeos = /* @__PURE__ */ new Map();
function __getTwigGeo(twigLength) {
  if (!__twigGeos.has(twigLength)) {
    const twigGeo = new CylinderBufferGeometry(1, 1, twigLength, 8, 1);
    const twigPosArr = twigGeo.attributes.position.array;
    const vec = new Vector38();
    for (let i3 = 0; i3 < twigPosArr.length; i3 += 3) {
      vec.fromArray(twigPosArr, i3);
      vec.y += twigLength * 0.5;
      vec.toArray(twigPosArr, i3);
    }
    __twigGeos.set(twigLength, twigGeo);
  }
  return __twigGeos.get(twigLength);
}

// src/meshes/factoryTreeMaple.ts
import {
  CylinderBufferGeometry as CylinderBufferGeometry2,
  Mesh as Mesh5,
  Object3D as Object3D6,
  Quaternion,
  Vector3 as Vector39
} from "three";
function makeTreeMapleStumpMature(matBark, matWood) {
  const tiltRange3 = 0.1;
  const height = 10;
  const baseRadius = 5;
  const pivot = new Object3D6();
  const wood = new Mesh5(new CylinderBufferGeometry2(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 80; i++) {
    const size = ~~detRandTreesMaple(6, 8);
    const bark = new Mesh5(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTreesMaple(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2));
    const angle = detRandTreesMaple(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTreesMaple(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  return pivot;
}
function makeTreeMapleStump(matBark, matWood) {
  const tiltRange3 = 0.1;
  const height = 5;
  const baseRadius = 3;
  const pivot = new Object3D6();
  const wood = new Mesh5(new CylinderBufferGeometry2(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 60; i++) {
    const size = ~~detRandTreesMaple(3, 5);
    const bark = new Mesh5(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTreesMaple(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2));
    const angle = detRandTreesMaple(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTreesMaple(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  return pivot;
}
function makeTreeMapleMature(matBark, matLeaf, matWood) {
  const tiltRange3 = 0.1;
  const height = 32;
  const baseRadius = 5;
  const baseRadiusInner = baseRadius - 1;
  const pivot = new Object3D6();
  const wood = new Mesh5(new CylinderBufferGeometry2(baseRadius, baseRadius, height, 16), matWood);
  pivot.add(wood);
  wood.position.y = height * 0.5;
  for (let i = 0; i < 260; i++) {
    const size = ~~detRandTreesMaple(6, 8);
    const bark = new Mesh5(getCachedChamferedBoxGeometry(2, size, 4, 1), matBark);
    bark.rotation.order = "YXZ";
    const y = Math.pow(detRandTreesMaple(), 2);
    const tiltAmt = Math.pow(1 - y, 4);
    const radius = baseRadius + tiltAmt * 8 + Math.round(detRandTreesMaple(0, 2));
    const angle = detRandTreesMaple(0, Math.PI * 2);
    bark.position.set(Math.cos(angle) * radius, y * height, Math.sin(angle) * radius);
    bark.rotation.y = -angle;
    bark.rotation.z = tiltAmt * 1;
    bark.rotation.x += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.y += detRandTreesMaple(-tiltRange3, tiltRange3);
    bark.rotation.z += detRandTreesMaple(-tiltRange3, tiltRange3);
    pivot.add(bark);
  }
  return pivot;
}
function makeTreeMaple(matBark, matLeaf) {
  const cylinderGeo = __getTwigGeo2(0.8, 1, 1, 16);
  function getChunk(radius, height2) {
    const cylinder = new Mesh5(cylinderGeo, matBark);
    cylinder.scale.set(radius, height2, radius);
    cylinder.rotation.x = Math.PI * 0.5;
    const cylinderPivot = new Object3D6();
    cylinderPivot.add(cylinder);
    return cylinderPivot;
  }
  const tiltRange3 = 0.05;
  const height = 32;
  const baseRadius = 0;
  const baseRadiusInner = baseRadius - 1;
  const leafProto = new Mesh5(__getLeafGeo(), matLeaf);
  const pivot = new Object3D6();
  const base = new Object3D6();
  const vec1 = new Vector39(0, 100, 0);
  base.lookAt(vec1);
  pivot.add(base);
  function grow(lastChunk, radius, length, growthEnergy = 0, isNew = false) {
    growthEnergy += 0.05;
    const tiltRangeLocal = tiltRange3 + growthEnergy;
    if (radius > 1) {
      radius -= 0.3;
      const newChunk = getChunk(radius, length);
      lastChunk.add(newChunk);
      if (!isNew) {
        newChunk.position.z = length - 1;
      }
      newChunk.rotation.x = detRandTreesMaple(-tiltRangeLocal, tiltRangeLocal);
      newChunk.rotation.y = detRandTreesMaple(-tiltRangeLocal, tiltRangeLocal);
      newChunk.rotation.z = detRandTreesMaple(0, Math.PI * 20);
      newChunk.updateMatrixWorld();
      const quat1 = new Quaternion();
      quat1.setFromEuler(newChunk.rotation);
      newChunk.lookAt(vec1);
      newChunk.quaternion.slerp(quat1, 0.85);
      grow(newChunk, radius, length, growthEnergy);
      if (detRandTreesMaple(0.05, 1) < growthEnergy - (radius - 4) * 0.2) {
        growthEnergy = -0.025;
        const newGrowth = new Object3D6();
        newGrowth.rotation.order = "XYZ";
        newGrowth.rotation.x = Math.PI * 0.25;
        newChunk.rotation.x = -Math.PI * 0.25;
        lastChunk.add(newGrowth);
        grow(newGrowth, radius, length, growthEnergy, true);
      }
    } else {
      __addLeaves(lastChunk, leafProto, length - 1);
    }
  }
  grow(base, 6.5, 7, 0, true);
  pivot.rotation.y = Math.PI * -0.4;
  pivot.scale.multiplyScalar(0.75);
  pivot.scale.y *= 0.7;
  return pivot;
}
var __twigGeos2 = /* @__PURE__ */ new Map();
function __getTwigGeo2(radiusTop, radiusBottom, length, radialSegs) {
  const key = `${radiusTop}:${radiusBottom}:${length}:${radialSegs}`;
  if (!__twigGeos2.has(key)) {
    const twigGeo = new CylinderBufferGeometry2(radiusTop, radiusBottom, length, radialSegs, 1);
    const twigPosArr = twigGeo.attributes.position.array;
    const vec = new Vector39();
    for (let i3 = 0; i3 < twigPosArr.length; i3 += 3) {
      vec.fromArray(twigPosArr, i3);
      vec.y += length * 0.5;
      vec.toArray(twigPosArr, i3);
    }
    __twigGeos2.set(key, twigGeo);
  }
  return __twigGeos2.get(key);
}
var __leafGeo;
function __getLeafGeo() {
  if (!__leafGeo) {
    __leafGeo = getChamferedBoxGeometry(3, 3, 4, 1);
    const posArr = __leafGeo.attributes.position.array;
    const vec = new Vector39();
    for (let i3 = 0; i3 < posArr.length; i3 += 3) {
      vec.fromArray(posArr, i3);
      vec.z = (vec.z + 2) * 3;
      vec.toArray(posArr, i3);
    }
  }
  return __leafGeo;
}
function __addLeaves(target, leafProto, offsetY) {
  const tLeaves = 7;
  const leafTilt = 0.8;
  for (let i = 0; i < tLeaves; i++) {
    const a = Math.PI * 2 * i / tLeaves;
    const x = Math.cos(a) * leafTilt;
    const y = Math.sin(a) * leafTilt;
    const leaf = leafProto.clone();
    leaf.position.z = offsetY;
    leaf.rotation.x = x;
    leaf.rotation.y = y;
    target.add(leaf);
  }
}

// src/meshes/factoryGoldPile.ts
import { Mesh as Mesh6, Object3D as Object3D7, Vector3 as Vector310 } from "three";
function makeGoldPile(goldChunkGeo, goldMat, radius = 16, knobs = 170, y = -12) {
  const goldPile = new Object3D7();
  const goldChunk = new Mesh6(goldChunkGeo, goldMat);
  const pos = new Vector310();
  for (let i = 0; i < knobs; i++) {
    pos.fromArray(longLatToXYZ(pointOnSphereFibonacci(i, knobs), radius));
    if (pos.y > -y) {
      const goldCoin = goldChunk.clone();
      goldCoin.scale.y *= 0.2;
      goldCoin.position.copy(pos);
      goldCoin.rotation.set(rand2(0.2), rand2(0.2), rand2(0.2));
      goldPile.add(goldCoin);
    }
  }
  goldPile.position.y += y;
  return goldPile;
}

// src/meshes/factoryLampPost.ts
import {
  CylinderBufferGeometry as CylinderBufferGeometry3,
  Mesh as Mesh7,
  Object3D as Object3D8,
  TorusBufferGeometry
} from "three";
function makeLampPost(ironBlackMat) {
  const lampPost = new Object3D8();
  const ironCylinder = new Mesh7(new CylinderBufferGeometry3(0.5, 0.5, 1, 16, 1), ironBlackMat);
  const cylPosArr = ironCylinder.geometry.attributes.position.array;
  for (let i = 1; i < cylPosArr.length; i += 3) {
    cylPosArr[i] += 0.5;
  }
  const ring = new Mesh7(new TorusBufferGeometry(0.45, 0.1, 32, 16), ironBlackMat);
  const lampPole = ironCylinder.clone();
  lampPost.add(lampPole);
  lampPole.scale.set(6, 12, 6);
  const lampPole2 = ironCylinder.clone();
  lampPole2.scale.set(3, 39, 3);
  lampPost.add(lampPole2);
  const middleRing = ring.clone();
  middleRing.scale.set(8, 8, 8);
  middleRing.position.y = 12;
  middleRing.rotation.x = Math.PI * 0.5;
  lampPost.add(middleRing);
  const middleRing2 = middleRing.clone();
  middleRing2.position.y = 2;
  lampPost.add(middleRing2);
  const lampPole3 = lampPole2.clone();
  lampPole3.scale.set(2, 9, 2);
  lampPole3.position.y = 38;
  lampPole3.rotation.z = Math.PI * -0.25;
  lampPost.add(lampPole3);
  const lampPole4 = lampPole2.clone();
  lampPole4.scale.set(2, 6, 2);
  lampPole4.position.x = 6;
  lampPole4.position.y = 44;
  lampPole4.rotation.z = Math.PI * -0.5;
  lampPost.add(lampPole4);
  const lampShade = new Mesh7(getChamferedBoxGeometry(8, 4, 8, 2), ironBlackMat);
  lampShade.position.set(12, 43, 0);
  lampPost.add(lampShade);
  return lampPost;
}

// src/meshes/factoryBush.ts
import { Mesh as Mesh8, Object3D as Object3D9 } from "three";
var bushGeoA3;
function getBushGeoA3() {
  if (!bushGeoA3) {
    bushGeoA3 = new FibonacciSphereGeometry(2, 8);
  }
  return bushGeoA3;
}
var berryGeo;
function getBerryGeo() {
  if (!berryGeo) {
    berryGeo = new FibonacciSphereGeometry(3, 15);
  }
  return berryGeo;
}
var BushProps = class {
  constructor(radius1 = 7, radius2 = 4, knobs = 16, knobs2 = 30, y = 11) {
    this.radius1 = radius1;
    this.radius2 = radius2;
    this.knobs = knobs;
    this.knobs2 = knobs2;
    this.y = y;
  }
};
var defaultBushProps = new BushProps();
function makeRecursiveBush(bushMat, berryMat, bushProps = defaultBushProps) {
  const bushC = new Object3D9();
  const bushC2Proto = new Object3D9();
  const bushC3Proto = new Mesh8(getBushGeoA3(), bushMat);
  for (let i = 0; i < bushProps.knobs2; i++) {
    const bushC3 = bushC3Proto.clone();
    bushC3.position.fromArray(longLatToXYZ(pointOnSphereFibonacci(i, bushProps.knobs2), bushProps.radius2));
    bushC3.rotation.set(detRandGraphics(-Math.PI, Math.PI), detRandGraphics(-Math.PI, Math.PI), detRandGraphics(-Math.PI, Math.PI));
    bushC2Proto.add(bushC3);
  }
  for (let i = 0; i < bushProps.knobs; i++) {
    const bushC2 = bushC2Proto.clone(true);
    bushC2.position.fromArray(longLatToXYZ(pointOnSphereFibonacci(i, bushProps.knobs), bushProps.radius1));
    bushC.add(bushC2);
  }
  bushC.traverse((obj) => {
    if (detRandGraphics() > 0.975 && obj instanceof Mesh8) {
      obj.geometry = getBerryGeo();
      obj.material = berryMat;
      obj.position.multiplyScalar(1.15);
    }
  });
  bushC.rotation.set(detRandGraphics(-Math.PI, Math.PI), detRandGraphics(-Math.PI, Math.PI), detRandGraphics(-Math.PI, Math.PI));
  const bushBase = new Object3D9();
  bushBase.add(bushC);
  bushBase.scale.y *= verticalScale;
  bushC.position.y += bushProps.y;
  return bushBase;
}

// src/utils/memoizer.ts
function memoize(generator) {
  let result;
  return function getResult() {
    if (!result) {
      result = generator();
    }
    return result;
  };
}

// src/meshes/factoryBrickWall.ts
import { BoxBufferGeometry, Mesh as Mesh9, Object3D as Object3D10 } from "three";
function makeBrickWall(brickMat, mortarMat, colStart, colEnd) {
  const brickWidth = 7;
  const brickHeight = 3;
  const brickGap = 1;
  const brickSpacingX = brickWidth + brickGap;
  const brickSpacingY = brickHeight;
  const brickGeo = getChamferedBoxGeometry(brickWidth, brickHeight, 4.5, 1);
  const brickWallRoot = new Object3D10();
  for (let iRow = 0; iRow < 11; iRow++) {
    for (let iCol = -1; iCol < 1; iCol++) {
      const budge = iRow % 2 * 0.5 - 0.25;
      const brick = new Mesh9(brickGeo, brickMat);
      brick.position.set((iCol + budge) * brickSpacingX + brickWidth * 0.5, (iRow + 0.5) * brickSpacingY, 0);
      brickWallRoot.add(brick);
    }
  }
  const mortar = new Mesh9(new BoxBufferGeometry((colEnd - colStart) * brickSpacingX - 1, 32, 1), mortarMat);
  mortar.position.x = -1;
  mortar.position.y = 16;
  mortar.position.z = -0.75;
  brickWallRoot.add(mortar);
  return brickWallRoot;
}

// src/rendering/tileMaker/TileMaker.ts
import {
  BackSide,
  BoxGeometry,
  LinearEncoding,
  Mesh as Mesh10,
  MeshDepthMaterial as MeshDepthMaterial2,
  NearestFilter,
  Object3D as Object3D11,
  OrthographicCamera,
  Scene as Scene2,
  WebGLRenderTarget
} from "three";
var TileMaker = class {
  constructor(_pixelsPerTile = 32, pixelsPerCacheEdge = 2048, _passes = ["beauty"], indexedMeshMakers) {
    this._pixelsPerTile = _pixelsPerTile;
    this._passes = _passes;
    assertPowerOfTwo(_pixelsPerTile);
    assertPowerOfTwo(pixelsPerCacheEdge);
    this._tilesPerEdge = pixelsPerCacheEdge / _pixelsPerTile;
    this._maxTiles = Math.pow(this._tilesPerEdge, 2);
    for (const pass of _passes) {
      this._renderTargets.set(pass, new WebGLRenderTarget(pixelsPerCacheEdge, pixelsPerCacheEdge, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        encoding: LinearEncoding,
        generateMipmaps: false
      }));
    }
    console.log("performance.now", performance.now());
    const scene = this._scene;
    scene.autoUpdate = false;
    this._cameraTiltedBottom.rotateX(Math.PI * -0.25);
    this._cameraTiltedBottom.position.set(0, 32, 32);
    scene.add(this._cameraTiltedBottom);
    this._cameraTiltedTop.rotateX(Math.PI * -0.25);
    this._cameraTiltedTop.position.set(0, 32, 32);
    scene.add(this._cameraTiltedTop);
    this._cameraTopDown.rotateX(Math.PI * -0.5);
    this._cameraTopDown.position.set(0, 0, 0);
    scene.add(this._cameraTopDown);
    const pivot = new Object3D11();
    scene.add(pivot);
    const memoScene = (generator) => {
      const memodGenerator = memoize(generator);
      return function generatorAndAdder() {
        const obj = memodGenerator();
        if (!obj.parent) {
          pivot.add(obj);
          obj.updateWorldMatrix(false, true);
        }
        return obj;
      };
    };
    this._pivot = pivot;
    const zLimiter = new Mesh10(new BoxGeometry(32, 32, 32), new MeshDepthMaterial2({ side: BackSide, colorWrite: false }));
    zLimiter.position.y += 16;
    scene.add(zLimiter);
    this._indexedMeshes = indexedMeshMakers.map(memoScene);
    this._indexedMeshesVisibility = new Array(indexedMeshMakers.length);
  }
  _pivot;
  get passes() {
    return this._passes;
  }
  set passes(value) {
    throw new Error("You cannot change passes during runtime.");
  }
  _renderQueue = [];
  _tileRegistry = [];
  _tileHashRegistry = [];
  _scene = new Scene2();
  _cameraTiltedBottom = new OrthographicCamera(-16, 16, (0 * 32 + 16) * verticalScale, (0 * 32 - 16) * verticalScale, 0, 64);
  _cameraTiltedTop = new OrthographicCamera(-16, 16, (1 * 32 + 16) * verticalScale, (1 * 32 - 16) * verticalScale, 0, 64);
  _cameraTopDown = new OrthographicCamera(-16, 16, 16, -16, -64, 64);
  _renderTargets = /* @__PURE__ */ new Map();
  _tileTexNeedsUpdate = true;
  _indexedMeshesVisibility;
  _indexedMeshes;
  _tilesPerEdge;
  _maxTiles;
  getTexture(pass = "beauty") {
    if (this._renderTargets.has(pass)) {
      return this._renderTargets.get(pass).texture;
    } else {
      debugger;
      throw new Error(`pass "${pass}" not supported`);
    }
  }
  getTileId(tileDescription) {
    const hash = tileDescription.toString();
    let index = this._tileHashRegistry.indexOf(hash);
    if (index === -1) {
      index = this._tileRegistry.length;
      if (index >= this._maxTiles) {
        console.error(`no more room for tiles! (${index})`);
      }
      this._tileRegistry.push(tileDescription);
      this._tileHashRegistry.push(hash);
      this._renderQueue.push(index);
      this._tileTexNeedsUpdate = true;
    }
    return index;
  }
};

// src/rendering/tileMaker/mapTileMaker/MapTileMaker.ts
var MapTileMaker = class extends TileMaker {
  constructor(pixelsPerTile = 32, pixelsPerCacheEdge = 2048, passes = ["beauty"]) {
    const dummy = memoize(() => new Object3D12());
    const brickMat = getMeshMaterial("brick");
    const mortarMat = getMeshMaterial("mortar");
    const drywallMat = getMeshMaterial("drywall");
    const floorMat = getMeshMaterial("floor");
    const groundMat = getMeshMaterial("ground");
    const ballMat = getMeshMaterial("plastic");
    const grassMat = getMeshMaterial("grass");
    const rocksMat = getMeshMaterial("rock");
    const bushMat = getMeshMaterial("bush");
    const berryMat = getMeshMaterial("berry");
    const woodMat = getMeshMaterial("wood");
    const ball = new Mesh11(new SphereGeometry(16, 32, 16), ballMat);
    ball.scale.y = Math.SQRT1_2;
    const floor = () => {
      const floorBoard = new Mesh11(getChamferedBoxGeometry(8, 4, 32, 1), floorMat);
      const floorBoardPair = new Object3D12();
      floorBoardPair.add(floorBoard);
      const floorBoard2 = floorBoard.clone();
      floorBoardPair.add(floorBoard2);
      floorBoard.position.z = -16;
      floorBoard2.position.z = 16;
      const floor2 = new Mesh11(new BoxBufferGeometry2(32, 2, 32), floorMat);
      detRandWoodPlanks();
      for (let i = 0; i < 4; i++) {
        const c = floorBoardPair.clone();
        c.position.x = i * 8 - 12;
        c.position.z = ~~detRandWoodPlanks(-14, 14);
        floor2.add(c);
      }
      floor2.position.y = -1;
      return floor2;
    };
    const ground = () => {
      const obj = new Mesh11(new BoxBufferGeometry2(32, 2, 32), groundMat);
      obj.position.y = -1;
      return obj;
    };
    const drywall = new Mesh11(new BoxBufferGeometry2(32, 32, 2), drywallMat);
    const getBrickWall = memoize(() => makeBrickWall(brickMat, mortarMat, -1, 1));
    const brickWallSectionSC = memoize(() => {
      const obj = getBrickWall().clone();
      obj.position.z = 8;
      obj.position.x = 0;
      return obj;
    });
    const brickWallSectionEC = memoize(() => {
      const obj = getBrickWall().clone();
      obj.position.x = 8;
      obj.rotation.y = Math.PI * 0.5;
      return obj;
    });
    const brickWallSectionNC = memoize(() => {
      const obj = getBrickWall().clone();
      obj.position.z = -8;
      obj.rotation.y = Math.PI;
      return obj;
    });
    const brickWallSectionWC = memoize(() => {
      const obj = getBrickWall().clone();
      obj.position.x = -8;
      obj.rotation.y = Math.PI * -0.5;
      return obj;
    });
    const moveRelX = (brickWall, amt) => {
      brickWall.position.x += Math.cos(brickWall.rotation.y) * amt;
      brickWall.position.z += Math.sin(brickWall.rotation.y) * amt;
    };
    const makeBrickWallSectionsL = (brickWallC) => {
      brickWallC.updateMatrixWorld();
      const brickWallL = brickWallC.clone(true);
      moveRelX(brickWallL, -16);
      return brickWallL;
    };
    const makeBrickWallSectionsR = (brickWallC) => {
      const brickWallR = brickWallC.clone(true);
      moveRelX(brickWallR, 16);
      return brickWallR;
    };
    const brickWallSectionSL = () => makeBrickWallSectionsL(brickWallSectionSC());
    const brickWallSectionSR = () => makeBrickWallSectionsR(brickWallSectionSC());
    const brickWallSectionWL = () => makeBrickWallSectionsL(brickWallSectionWC());
    const brickWallSectionWR = () => makeBrickWallSectionsR(brickWallSectionWC());
    const brickWallSectionNL = () => makeBrickWallSectionsL(brickWallSectionNC());
    const brickWallSectionNR = () => makeBrickWallSectionsR(brickWallSectionNC());
    const brickWallSectionEL = () => makeBrickWallSectionsL(brickWallSectionEC());
    const brickWallSectionER = () => makeBrickWallSectionsR(brickWallSectionEC());
    const woodBeamGeo = getChamferedBoxGeometry(6, 32, 6, 1);
    const beamCenter = () => {
      const beamCenter2 = new Mesh11(woodBeamGeo, woodMat);
      beamCenter2.position.y = 16;
      return beamCenter2;
    };
    const makeStud = memoize(() => {
      const woodStudGeo = getChamferedBoxGeometry(4, 32 - 6, 6, 1);
      const stud = new Mesh11(woodStudGeo, woodMat);
      stud.position.y = 16;
      return stud;
    });
    const makeBeamFullSectionEW = () => {
      const woodPlateGeo = getChamferedBoxGeometry(36, 3, 6, 1);
      const bottomPlate = new Mesh11(woodPlateGeo, woodMat);
      bottomPlate.position.y = 1.5;
      const topPlate = new Mesh11(woodPlateGeo, woodMat);
      topPlate.position.y = 32 - 1.5;
      const beamFullSectionEW2 = new Object3D12();
      beamFullSectionEW2.add(bottomPlate);
      beamFullSectionEW2.add(topPlate);
      const stud = makeStud().clone();
      beamFullSectionEW2.add(stud);
      const stud2 = stud.clone();
      stud2.position.x -= 16;
      beamFullSectionEW2.add(stud2);
      const stud3 = stud.clone();
      stud3.position.x += 16;
      beamFullSectionEW2.add(stud3);
      return beamFullSectionEW2;
    };
    const beamFullSectionEW = makeBeamFullSectionEW;
    const beamFullSectionNS = () => {
      const obj = beamFullSectionEW().clone(true);
      obj.rotation.y = Math.PI * 0.5;
      return obj;
    };
    const makeShortBeam = memoize(() => {
      const woodPlateShortGeo = getChamferedBoxGeometry(15, 3, 6, 1);
      const bottomShortPlate = new Mesh11(woodPlateShortGeo, woodMat);
      bottomShortPlate.position.x = 1;
      bottomShortPlate.position.y = 1.5;
      const topShortPlate = new Mesh11(woodPlateShortGeo, woodMat);
      topShortPlate.position.x = 1;
      topShortPlate.position.y = 32 - 1.5;
      const shortBeam = new Object3D12();
      shortBeam.add(topShortPlate);
      shortBeam.add(bottomShortPlate);
      const stud4 = makeStud().clone();
      stud4.position.x = -4.5;
      const stud5 = makeStud().clone();
      stud5.position.x = 6.5;
      shortBeam.add(stud4);
      shortBeam.add(stud5);
      shortBeam.position.x = 16 - 13 * 0.5;
      return shortBeam;
    });
    const beamE = () => {
      const obj = new Object3D12();
      obj.add(makeShortBeam().clone());
      return obj;
    };
    const beamS = () => {
      const obj = new Object3D12();
      obj.add(makeShortBeam().clone());
      obj.rotation.y = Math.PI * 0.5;
      return obj;
    };
    const beamW = () => {
      const obj = new Object3D12();
      obj.add(makeShortBeam().clone());
      obj.rotation.y = Math.PI;
      return obj;
    };
    const beamN = () => {
      const obj = new Object3D12();
      obj.add(makeShortBeam().clone());
      obj.rotation.y = Math.PI * -0.5;
      return obj;
    };
    drywall.position.y = 16;
    drywall.position.z = -4;
    const grassGeoA = memoize(() => new GrassGeometry());
    const grassGeoH = memoize(() => new GrassGeometry());
    const grassGeoV = memoize(() => new GrassGeometry());
    const grassGeoCorner = memoize(() => new GrassGeometry());
    const grassC = () => new Mesh11(grassGeoA(), grassMat);
    const grassN = () => {
      const obj = new Mesh11(grassGeoV(), grassMat);
      obj.position.set(0, 0, 16);
      return obj;
    };
    const grassNE = () => {
      const obj = new Mesh11(grassGeoCorner(), grassMat);
      obj.position.set(16, 0, 16);
      return obj;
    };
    const grassE = () => {
      const obj = new Mesh11(grassGeoH(), grassMat);
      obj.position.set(16, 0, 0);
      return obj;
    };
    const grassSE = () => {
      const obj = new Mesh11(grassGeoCorner(), grassMat);
      obj.position.set(16, 0, -16);
      return obj;
    };
    const grassS = () => {
      const obj = new Mesh11(grassGeoV(), grassMat);
      obj.position.set(0, 0, -16);
      return obj;
    };
    const grassSW = () => {
      const obj = new Mesh11(grassGeoCorner(), grassMat);
      obj.position.set(-16, 0, -16);
      return obj;
    };
    const grassW = () => {
      const obj = new Mesh11(grassGeoH(), grassMat);
      obj.position.set(-16, 0, 0);
      return obj;
    };
    const grassNW = () => {
      const obj = new Mesh11(grassGeoCorner(), grassMat);
      obj.position.set(-16, 0, 16);
      return obj;
    };
    const bushC = () => makeRecursiveBush(bushMat, berryMat);
    const bushVProto = memoize(() => makeRecursiveBush(bushMat, berryMat));
    const bushHProto = memoize(() => makeRecursiveBush(bushMat, berryMat));
    const bushCornerProto = memoize(() => makeRecursiveBush(bushMat, berryMat, new BushProps(16, 8, 24, 60, 22)));
    const bushN = () => {
      const obj = bushVProto().clone(true);
      obj.position.set(0, 0, 16);
      return obj;
    };
    const bushNE = () => {
      const obj = bushCornerProto().clone(true);
      obj.position.set(16, 0, 16);
      return obj;
    };
    const bushE = () => {
      const obj = bushHProto().clone(true);
      obj.position.set(16, 0, 0);
      return obj;
    };
    const bushSE = () => {
      const obj = bushNE().clone(true);
      obj.position.set(16, 0, -16);
      return obj;
    };
    const bushS = () => {
      const obj = bushN().clone(true);
      obj.position.set(0, 0, -16);
      return obj;
    };
    const bushSW = () => {
      const obj = bushNE().clone(true);
      obj.position.set(-16, 0, -16);
      return obj;
    };
    const bushW = () => {
      const obj = bushHProto().clone(true);
      obj.position.set(-16, 0, 0);
      return obj;
    };
    const bushNW = () => {
      const obj = bushNE().clone(true);
      obj.position.set(-16, 0, 16);
      return obj;
    };
    const goldMat = getMeshMaterial("gold");
    const goldChunkGeo = new FibonacciSphereGeometry(4, 17);
    const goldPile = () => makeGoldPile(goldChunkGeo, goldMat);
    const ironBlackMat = getMeshMaterial("ironBlack");
    const lampPost = () => makeLampPost(ironBlackMat);
    const testObject = () => {
      const obj = new Mesh11(new TorusKnotBufferGeometry(10, 2, 48, 8), getMeshMaterial("plastic"));
      obj.position.y = 12;
      obj.rotation.x = Math.PI * 0.5;
      obj.scale.y *= verticalScale;
      return obj;
    };
    const pyramid = () => {
      const pyramidGeo = new PyramidGeometry();
      const obj = new Mesh11(pyramidGeo, getMeshMaterial("floor"));
      const pyramidTop = new Mesh11(pyramidGeo, getMeshMaterial("gold"));
      obj.add(pyramidTop);
      pyramidTop.scale.setScalar(0.2);
      pyramidTop.position.y = 0.82;
      obj.scale.set(30, 16, 30);
      return obj;
    };
    const rockyGround = () => {
      const pyramidGeo = new PyramidGeometry();
      const rockyGroundProto = new Mesh11(pyramidGeo, getMeshMaterial("ground"));
      const obj = new Object3D12();
      for (let i = 0; i < 12; i++) {
        const rocky = rockyGroundProto.clone();
        obj.add(rocky);
        rocky.scale.set(detRandRocks(3, 10), detRandRocks(0.25, 0.5), detRandRocks(3, 10));
        rocky.rotation.y = detRandRocks(0, Math.PI * 2);
        rocky.position.set(detRandRocks(-12, 12), 0, detRandRocks(-12, 12));
      }
      return obj;
    };
    const rocksA = memoize(() => makeRocks(rocksMat, 0));
    const rocksABig = memoize(() => makeRocks(rocksMat, 0));
    const rocksH = memoize(() => makeRocks(rocksMat, 4));
    const rocksV = memoize(() => makeRocks(rocksMat, 4));
    const rocksCorner = memoize(() => makeRocks(rocksMat, 8));
    const rocksC = () => rocksA();
    const rocksN = () => {
      const obj = rocksV().clone();
      obj.position.set(0, 0, 16);
      return obj;
    };
    const rocksNE = () => {
      const obj = rocksCorner().clone();
      obj.position.set(16, 0, 16);
      return obj;
    };
    const rocksE = () => {
      const obj = rocksH().clone();
      obj.position.set(16, 0, 0);
      return obj;
    };
    const rocksSE = () => {
      const obj = rocksCorner().clone();
      obj.position.set(16, 0, -16);
      return obj;
    };
    const rocksS = () => {
      const obj = rocksV().clone();
      obj.position.set(0, 0, -16);
      return obj;
    };
    const rocksSW = () => {
      const obj = rocksCorner().clone();
      obj.position.set(-16, 0, -16);
      return obj;
    };
    const rocksW = () => {
      const obj = rocksH().clone();
      obj.position.set(-16, 0, 0);
      return obj;
    };
    const rocksNW = () => {
      const obj = rocksCorner().clone();
      obj.position.set(-16, 0, 16);
      return obj;
    };
    const rocksCBig = () => {
      const obj = rocksABig().clone();
      obj.position.y += 12;
      return obj;
    };
    const goldOreForRocks = () => makeRocks(goldMat, 0, 2);
    const goldOreForBigRocks = () => makeRocks(goldMat, 10, 2);
    const rockCrumbsA = memoize(() => makeRockCrumbs(rocksMat));
    const rockCrumbsH = memoize(() => makeRockCrumbs(rocksMat));
    const rockCrumbsV = memoize(() => makeRockCrumbs(rocksMat));
    const rockCrumbsCorner = memoize(() => makeRockCrumbs(rocksMat));
    const rockCrumbsC = () => {
      const obj = rockCrumbsA().clone();
      return obj;
    };
    const rockCrumbsN = () => {
      const obj = rockCrumbsV().clone();
      obj.position.set(0, 0, 16);
      return obj;
    };
    const rockCrumbsNE = () => {
      const obj = rockCrumbsCorner().clone();
      obj.position.set(16, 0, 16);
      return obj;
    };
    const rockCrumbsE = () => {
      const obj = rockCrumbsH().clone();
      obj.position.set(16, 0, 0);
      return obj;
    };
    const rockCrumbsSE = () => {
      const obj = rockCrumbsCorner().clone();
      obj.position.set(16, 0, -16);
      return obj;
    };
    const rockCrumbsS = () => {
      const obj = rockCrumbsV().clone();
      obj.position.set(0, 0, -16);
      return obj;
    };
    const rockCrumbsSW = () => {
      const obj = rockCrumbsCorner().clone();
      obj.position.set(-16, 0, -16);
      return obj;
    };
    const rockCrumbsW = () => {
      const obj = rockCrumbsH().clone();
      obj.position.set(-16, 0, 0);
      return obj;
    };
    const rockCrumbsNW = () => {
      const obj = rockCrumbsCorner().clone();
      obj.position.set(-16, 0, 16);
      return obj;
    };
    const treePine = memoize(() => makeTreePine(getMeshMaterial("bark"), getMeshMaterial("pineNeedle")));
    const treePineC = () => {
      const obj = treePine().clone();
      return obj;
    };
    const treePineN = () => {
      const obj = treePine().clone();
      obj.position.set(0, 0, 32);
      return obj;
    };
    const treePineS = () => {
      const obj = treePine().clone();
      obj.position.set(0, 0, -32);
      return obj;
    };
    const treePineE = () => {
      const obj = treePine().clone();
      obj.position.set(32, 0, 0);
      return obj;
    };
    const treePineW = () => {
      const obj = treePine().clone();
      obj.position.set(-32, 0, 0);
      return obj;
    };
    const treePineNE = () => {
      const obj = treePine().clone();
      obj.position.set(32, 0, 32);
      return obj;
    };
    const treePineSE = () => {
      const obj = treePine().clone();
      obj.position.set(32, 0, -32);
      return obj;
    };
    const treePineNW = () => {
      const obj = treePine().clone();
      obj.position.set(-32, 0, 32);
      return obj;
    };
    const treePineSW = () => {
      const obj = treePine().clone();
      obj.position.set(-32, 0, -32);
      return obj;
    };
    const treePineMature = memoize(() => makeTreePineMature(getMeshMaterial("bark"), getMeshMaterial("pineNeedle"), getMeshMaterial("wood")));
    const treePineMatureC = () => {
      const obj = treePineMature().clone();
      return obj;
    };
    const treePineMatureN = () => {
      const obj = treePineMature().clone();
      obj.position.set(0, 0, 32);
      return obj;
    };
    const treePineMatureS = () => {
      const obj = treePineMature().clone();
      obj.position.set(0, 0, -32);
      return obj;
    };
    const treePineMatureE = () => {
      const obj = treePineMature().clone();
      obj.position.set(32, 0, 0);
      return obj;
    };
    const treePineMatureW = () => {
      const obj = treePineMature().clone();
      obj.position.set(-32, 0, 0);
      return obj;
    };
    const treePineMatureNE = () => {
      const obj = treePineMature().clone();
      obj.position.set(32, 0, 32);
      return obj;
    };
    const treePineMatureSE = () => {
      const obj = treePineMature().clone();
      obj.position.set(32, 0, -32);
      return obj;
    };
    const treePineMatureNW = () => {
      const obj = treePineMature().clone();
      obj.position.set(-32, 0, 32);
      return obj;
    };
    const treePineMatureSW = () => {
      const obj = treePineMature().clone();
      obj.position.set(-32, 0, -32);
      return obj;
    };
    const treePineStump = memoize(() => makeTreePineStump(getMeshMaterial("bark"), getMeshMaterial("wood")));
    const treePineStumpMature = memoize(() => makeTreePineStumpMature(getMeshMaterial("bark"), getMeshMaterial("wood")));
    const treeMaple = memoize(() => makeTreeMaple(getMeshMaterial("barkMaple"), getMeshMaterial("leafMaple")));
    const treeMapleC = () => {
      const obj = treeMaple().clone();
      return obj;
    };
    const treeMapleN = () => {
      const obj = treeMaple().clone();
      obj.position.set(0, 0, 32);
      return obj;
    };
    const treeMapleS = () => {
      const obj = treeMaple().clone();
      obj.position.set(0, 0, -32);
      return obj;
    };
    const treeMapleE = () => {
      const obj = treeMaple().clone();
      obj.position.set(32, 0, 0);
      return obj;
    };
    const treeMapleW = () => {
      const obj = treeMaple().clone();
      obj.position.set(-32, 0, 0);
      return obj;
    };
    const treeMapleNE = () => {
      const obj = treeMaple().clone();
      obj.position.set(32, 0, 32);
      return obj;
    };
    const treeMapleSE = () => {
      const obj = treeMaple().clone();
      obj.position.set(32, 0, -32);
      return obj;
    };
    const treeMapleNW = () => {
      const obj = treeMaple().clone();
      obj.position.set(-32, 0, 32);
      return obj;
    };
    const treeMapleSW = () => {
      const obj = treeMaple().clone();
      obj.position.set(-32, 0, -32);
      return obj;
    };
    const treeMapleMature = memoize(() => makeTreeMapleMature(getMeshMaterial("barkMaple"), getMeshMaterial("leafMaple"), getMeshMaterial("woodMaple")));
    const treeMapleMatureC = () => {
      const obj = treeMapleMature().clone();
      return obj;
    };
    const treeMapleMatureN = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(0, 0, 32);
      return obj;
    };
    const treeMapleMatureS = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(0, 0, -32);
      return obj;
    };
    const treeMapleMatureE = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(32, 0, 0);
      return obj;
    };
    const treeMapleMatureW = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(-32, 0, 0);
      return obj;
    };
    const treeMapleMatureNE = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(32, 0, 32);
      return obj;
    };
    const treeMapleMatureSE = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(32, 0, -32);
      return obj;
    };
    const treeMapleMatureNW = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(-32, 0, 32);
      return obj;
    };
    const treeMapleMatureSW = () => {
      const obj = treeMapleMature().clone();
      obj.position.set(-32, 0, -32);
      return obj;
    };
    const treeMapleStump = () => makeTreeMapleStump(getMeshMaterial("barkMaple"), getMeshMaterial("woodMaple"));
    const treeMapleStumpMature = () => makeTreeMapleStumpMature(getMeshMaterial("barkMaple"), getMeshMaterial("woodMaple"));
    const indexedMeshes = [
      dummy,
      floor,
      beamCenter,
      beamN,
      beamE,
      beamS,
      beamW,
      beamFullSectionNS,
      beamFullSectionEW,
      brickWallSectionWR,
      brickWallSectionEL,
      brickWallSectionNR,
      brickWallSectionSR,
      brickWallSectionER,
      brickWallSectionWL,
      brickWallSectionSL,
      brickWallSectionNL,
      brickWallSectionNC,
      brickWallSectionEC,
      brickWallSectionSC,
      brickWallSectionWC,
      ground,
      grassC,
      grassN,
      grassNE,
      grassE,
      grassSE,
      grassS,
      grassSW,
      grassW,
      grassNW,
      bushC,
      bushN,
      bushNE,
      bushE,
      bushSE,
      bushS,
      bushSW,
      bushW,
      bushNW,
      goldPile,
      lampPost,
      testObject,
      pyramid,
      rockyGround,
      rocksC,
      rocksCBig,
      rocksN,
      rocksNE,
      rocksE,
      rocksSE,
      rocksS,
      rocksSW,
      rocksW,
      rocksNW,
      goldOreForRocks,
      goldOreForBigRocks,
      rockCrumbsC,
      rockCrumbsN,
      rockCrumbsNE,
      rockCrumbsE,
      rockCrumbsSE,
      rockCrumbsS,
      rockCrumbsSW,
      rockCrumbsW,
      rockCrumbsNW,
      treePineC,
      treePineN,
      treePineNE,
      treePineE,
      treePineSE,
      treePineS,
      treePineSW,
      treePineW,
      treePineNW,
      treePineMatureC,
      treePineMatureN,
      treePineMatureNE,
      treePineMatureE,
      treePineMatureSE,
      treePineMatureS,
      treePineMatureSW,
      treePineMatureW,
      treePineMatureNW,
      treePineStump,
      treePineStumpMature,
      treeMapleC,
      treeMapleN,
      treeMapleNE,
      treeMapleE,
      treeMapleSE,
      treeMapleS,
      treeMapleSW,
      treeMapleW,
      treeMapleNW,
      treeMapleMatureC,
      treeMapleMatureN,
      treeMapleMatureNE,
      treeMapleMatureE,
      treeMapleMatureSE,
      treeMapleMatureS,
      treeMapleMatureSW,
      treeMapleMatureW,
      treeMapleMatureNW,
      treeMapleStump,
      treeMapleStumpMature
    ];
    super(pixelsPerTile, pixelsPerCacheEdge, passes, indexedMeshes);
  }
  render(renderer) {
    if (this._tileTexNeedsUpdate) {
      const oldViewport = new Vector44();
      const oldScissor = new Vector44();
      renderer.getViewport(oldViewport);
      renderer.getScissor(oldScissor);
      this._tileTexNeedsUpdate = false;
      this._scene.updateMatrixWorld(true);
      const uniqueVisuals = /* @__PURE__ */ new Set();
      for (const index of this._renderQueue) {
        const visualProps = this._tileRegistry[index];
        for (let j = 0; j < this._indexedMeshes.length; j++) {
          const jb = ~~(j / 8);
          const j8 = j % 8;
          const shouldShow = !!(visualProps[jb] & 1 << j8);
          if (shouldShow) {
            uniqueVisuals.add(j);
          }
        }
      }
      console.log("unique tiles:", this._renderQueue.length);
      console.log("unique visual elements:", Array.from(uniqueVisuals).length);
      for (const pass of this._passes) {
        renderer.setRenderTarget(this._renderTargets.get(pass));
        const p = this._pixelsPerTile / renderer.getPixelRatio();
        const depthPass = pass === "customTopDownHeight";
        for (const index of this._renderQueue) {
          const iCol = index % this._tilesPerEdge;
          const iRow = ~~(index / this._tilesPerEdge);
          const visualProps = this._tileRegistry[index];
          const layer2 = !!(visualProps[0] & 1);
          if (layer2 && depthPass) {
            continue;
          }
          for (let j = 0; j < this._indexedMeshes.length; j++) {
            const jb = ~~(j / 8);
            const j8 = j % 8;
            const shouldShow = !!(visualProps[jb] & 1 << j8);
            if (this._indexedMeshesVisibility[j] && !shouldShow) {
              this._indexedMeshes[j]().visible = false;
            } else if (!this._indexedMeshesVisibility[j] && shouldShow) {
              this._indexedMeshes[j]().visible = true;
            }
            this._indexedMeshesVisibility[j] = shouldShow;
          }
          renderer.setViewport(iCol * p, iRow * p, p, p);
          renderer.setScissor(iCol * p, iRow * p, p, p);
          changeMeshMaterials(this._scene, pass, true);
          renderer.render(this._scene, layer2 ? this._cameraTiltedTop : depthPass ? this._cameraTopDown : this._cameraTiltedBottom);
        }
      }
      renderer.setViewport(oldViewport);
      renderer.setScissor(oldScissor);
      renderer.setRenderTarget(null);
      this._renderQueue.length = 0;
    }
  }
  update(dt) {
  }
};

// src/helpers/utils/MapScrollingView.ts
import { Mesh as Mesh15 } from "three";

// src/materials/BasicTextureMaterial/index.ts
import { DoubleSide as DoubleSide5, RawShaderMaterial as RawShaderMaterial4, Uniform as Uniform4, Vector4 as Vector45 } from "three";

// src/utils/threeUtils.ts
import {
  DataTexture,
  NearestFilter as NearestFilter2,
  RGBAFormat,
  sRGBEncoding,
  TextureLoader,
  UnsignedByteType
} from "three";
var __tempTexture;
function getTempTexture() {
  if (!__tempTexture) {
    const s = 4;
    const total = s * s * 4;
    const data = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      data[i] = 0;
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat, UnsignedByteType);
  }
  return __tempTexture;
}

// src/materials/BasicTextureMaterial/frag.glsl
var frag_default4 = "precision highp float;\n\nuniform sampler2D uTexture;\nvarying vec2 vUv;\n\nvoid main() {\n  vec2 uv = vUv;\n  vec4 texel = texture2D(uTexture, vUv);\n	gl_FragColor = texel;\n}";

// src/materials/BasicTextureMaterial/vert.glsl
var vert_default4 = "precision highp float;\n\nuniform vec4 uUvST;\n#ifndef CLIPSPACE_MODE\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n#endif\nattribute vec3 position;\nattribute vec2 uv;\nvarying vec2 vUv;\n\nvoid main() {\n    #ifdef CLIPSPACE_MODE\n        gl_Position = vec4( position, 1.0 );\n    #else\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    #endif\n    vUv = uv * uUvST.xy + uUvST.zw;\n}";

// src/materials/BasicTextureMaterial/index.ts
var __defaultParams4 = {
  uvST: new Vector45(1, 1, 0, 0),
  texture: getTempTexture(),
  clipspaceMode: false
};
var BasicTextureMaterial = class extends RawShaderMaterial4 {
  get texture() {
    return this._uTexture.value;
  }
  set texture(value) {
    this._uTexture.value = value;
  }
  _uTexture;
  constructor(options = {}) {
    const params = buildParameters(__defaultParams4, options);
    const uUvST = new Uniform4(params.uvST);
    const uTexture = new Uniform4(params.texture);
    const uniforms = {
      uUvST,
      uTexture
    };
    const defines = {
      CLIPSPACE_MODE: params.clipspaceMode
    };
    super({
      uniforms,
      defines,
      vertexShader: vert_default4,
      fragmentShader: frag_default4,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide5
    });
    this._uTexture = uTexture;
  }
};

// src/materials/FauxelMaterial/index.ts
import {
  Color as Color4,
  DoubleSide as DoubleSide6,
  RawShaderMaterial as RawShaderMaterial5,
  Uniform as Uniform5,
  Vector2 as Vector22,
  Vector3 as Vector311,
  Vector4 as Vector46
} from "three";
import { lerp } from "three/src/math/MathUtils";

// src/materials/FauxelMaterial/frag.glsl
var frag_default5 = "precision highp float;\n\nuniform sampler2D uTextureColor;\nuniform sampler2D uTextureNormals;\nuniform sampler2D uTextureEmissive;\nuniform sampler2D uTextureRoughnessMetalnessHeight;\nuniform sampler2D uTextureTopDownHeight;\nuniform sampler2D uTexturePointLights;\nuniform vec3 uColorLightAmbient;\nuniform vec3 uColorDarkAmbient;\nuniform vec3 uColorSun;\nuniform vec3 uSunDirection;\nuniform vec3 uSunDirectionForWater;\nuniform vec3 uSunShadowDirection;\nuniform sampler2D uTextureFog;\nuniform vec2 uFogScroll;\nvarying vec2 vUv;\n\n#ifdef USE_WATER\n  uniform float uWaterHeight;\n  varying vec2 vUvWater;\n#endif\n\nvoid main() {\n  // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n  vec4 texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeight, vUv);\n  #ifdef USE_WATER\n    vec2 waterUvs = vUvWater * 2.0 + vec2(0.0, uWaterHeight * -0.125);\n    vec4 waterData = (texture2D(uTextureFog, waterUvs + uFogScroll) + texture2D(uTextureFog, waterUvs - uFogScroll) - vec4(1.0));\n    float originalHeight = texelRoughnessMetalnessHeight.b * 2.0;\n    float waterDepth = max(0.0, uWaterHeight - originalHeight);\n    vec2 uv = vUv + (waterData.rg) * waterDepth * 0.03;\n    texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeight, uv);\n    float distortedWaterDepth = max(0.0, uWaterHeight - texelRoughnessMetalnessHeight.b * 2.0);\n    float waterMask = smoothstep(uWaterHeight, uWaterHeight - 0.1, originalHeight) * mix(0.5, 1.0, distortedWaterDepth);\n  #else \n    vec2 uv = vUv;  \n    float originalHeight = texelRoughnessMetalnessHeight.b * 2.0;\n  #endif\n\n  vec4 texelColor = texture2D(uTextureColor, uv);\n  #ifdef USE_WATER\n    texelColor.rgb *= mix(vec3(1.0), vec3(-0.2, 0.3, 0.8), waterMask); //water color blue\n  #endif\n  vec4 texelNormals = texture2D(uTextureNormals, uv);\n  vec4 texelEmissive = texture2D(uTextureEmissive, uv);\n\n  // vec4 texelTopDownHeight = texture2D(uTextureTopDownHeight, uv);\n  float roughness = 2.0 / texelRoughnessMetalnessHeight.r;\n  float metalness = texelRoughnessMetalnessHeight.g;\n  vec3 surfaceNormal = texelNormals.rgb * 2.0 - 1.0;\n  float dotP = dot(surfaceNormal, uSunDirection) * (1.0 + metalness * 0.4);\n  #ifdef USE_WATER\n    float dotPWater = dot(waterData.rgb, uSunDirectionForWater);\n    float waterRoughness = 2.0 / 0.3;\n    dotPWater = mix(1.0 - 0.5 * (1.0-dotPWater), dotPWater, waterRoughness);\n    float sunLightWaterStrength = pow(max(0.0, dotPWater), waterRoughness) * 1.75;\n  #endif\n\n\n  dotP = mix(1.0 - 0.5 * (1.0-dotP), dotP, roughness);\n  // float invRMHb = 1.0 - texelRoughnessMetalnessHeight.b * 2.0;\n  // float texelHeight = 1.0 - invRMHb * invRMHb;\n  float texelHeight = texelRoughnessMetalnessHeight.b * 2.0;\n  float ambientLight = texelNormals.g + texelHeight * 0.5;\n  float sunLightStrength = pow(max(0.0, dotP), roughness);\n\n  float floorYOffset = -texelHeight * RELATIVE_TILE_SIZE;\n  texelHeight += RELATIVE_TILE_PIXEL_SIZE;\n  float mixShadow = 1.0;\n  vec2 flooredUv = uv + vec2(0, floorYOffset);\n	for(float i = RELATIVE_PIXEL_SIZE; i < RELATIVE_TILE_SIZE * 2.0; i += RELATIVE_PIXEL_SIZE) {\n    float newHeight = texture2D(uTextureTopDownHeight, flooredUv - (vec2(i) * uSunShadowDirection.xz)).b * 2.0;\n    float newHeight2 = texture2D(uTextureRoughnessMetalnessHeight, uv + (vec2(0.0, i) + vec2(i) * -uSunShadowDirection.xz)).b * 2.0;\n    mixShadow = min(mixShadow, max(step(newHeight, texelHeight), step(newHeight2, texelHeight)));\n    // mixShadow = min(mixShadow, step(newHeight2, texelHeight));\n    texelHeight += RELATIVE_TILE_PIXEL_SIZE;\n	}\n  #ifdef USE_MIST\n    float mistMask = max(0.0, 0.3 - texelRoughnessMetalnessHeight.b * 2.0) * max(texture2D(uTextureFog, uv + uFogScroll).b, texture2D(uTextureFog, uv + uFogScroll * 2.0).b);\n    sunLightStrength *= mixShadow * (1.0-mistMask);\n  #else\n    sunLightStrength *= mixShadow;\n  #endif\n	// gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n  vec3 sunLightColorHit = uColorSun * sunLightStrength;\n  #ifdef USE_WATER\n    sunLightColorHit *= mix(1.0, 0.5, waterMask);\n  #endif\n	gl_FragColor = vec4( texelColor.rgb * mix(uColorDarkAmbient, uColorLightAmbient, ambientLight), 1.0);\n\n	gl_FragColor.rgb += mix(sunLightColorHit, sunLightColorHit * texelColor.rgb, vec3(metalness));\n  gl_FragColor.rgb += texelEmissive.rgb;\n  gl_FragColor.rgb = min(vec3(1.0), gl_FragColor.rgb);\n\n  // gl_FragColor.rgb = sunLightColorHit * texelColor.rgb;\n  #ifdef USE_WATER\n    gl_FragColor.rgb += vec3(sunLightWaterStrength) * waterMask * uColorSun; //sun on water highlights\n  #endif\n\n\n  vec4 texelPointLights = texture2D(uTexturePointLights, uv);\n  gl_FragColor.rgb += texelPointLights.rgb;\n\n  gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5454));\n\n  //outlines\n  vec2 pixelH = vec2(RELATIVE_PIXEL_SIZE, 0.0);\n  vec2 pixelV = vec2(0.0, RELATIVE_PIXEL_SIZE);\n  uv = vUv;\n  float heightL = texture2D(uTextureRoughnessMetalnessHeight, uv - pixelH).b;\n  float heightR = texture2D(uTextureRoughnessMetalnessHeight, uv + pixelH).b;\n  float heightU = texture2D(uTextureRoughnessMetalnessHeight, uv + pixelV).b;\n  float heightD = texture2D(uTextureRoughnessMetalnessHeight, uv - pixelV).b;\n  float highestNeighbour = max(max(heightL, heightR), max(heightU, heightD)) * 2.0;\n  float outline = smoothstep((highestNeighbour - 0.2),(highestNeighbour - 0.05), originalHeight);\n\n  #ifdef USE_MIST\n    gl_FragColor.rgb += (vec3(1.0) - gl_FragColor.rgb) * mistMask * vec3(0.5);\n  #endif\n  #ifdef USE_WATER\n    gl_FragColor.rgb *= mix(vec3(0.4, 0.3, 0.1), vec3(1.0), vec3(mix(1.0, outline, smoothstep(waterDepth-0.1, waterDepth, highestNeighbour)))); //outline\n  #else\n    gl_FragColor.rgb *= mix(vec3(0.4, 0.3, 0.1), vec3(1.0), outline); //outline\n  #endif\n  // gl_FragColor.rgb = vec3(texelColor.a);\n  // gl_FragColor.rgb = vec3(sin(floorYOffset * 1000.0) * 0.5 + 0.5);\n	// gl_FragColor = texelColor * texelNormals;\n  // gl_FragColor.rgb = vec3(outline);\n  // gl_FragColor = texelPointLights;\n  // gl_FragColor = texelEmissive;\n  // gl_FragColor = texelNormals;\n}";

// src/materials/FauxelMaterial/vert.glsl
var vert_default5 = "precision highp float;\n\nuniform vec4 uUvST;\nuniform vec4 uUvSTWorldOffset;\n#ifndef CLIPSPACE_MODE\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n#endif\nattribute vec3 position;\nattribute vec2 uv;\nvarying vec2 vUv;\n#ifdef USE_WATER\n  varying vec2 vUvWater;\n#endif\n\nvoid main() {\n    #ifdef CLIPSPACE_MODE\n        gl_Position = vec4( position, 1.0 );\n    #else\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    #endif\n    vUv = uv * uUvST.xy + uUvST.zw;\n    #ifdef USE_WATER\n        vUvWater = uv * uUvSTWorldOffset.xy + uUvSTWorldOffset.zw;\n    #endif\n}";

// src/materials/FauxelMaterial/index.ts
var __defaultParams5 = {
  uvST: new Vector46(1, 1, 0, 0),
  uvSTWorldOffset: new Vector46(1, 1, 0, 0),
  textureColor: getTempTexture(),
  textureNormals: getTempTexture(),
  textureEmissive: getTempTexture(),
  textureRoughnessMetalnessHeight: getTempTexture(),
  textureTopDownHeight: getTempTexture(),
  texturePointLights: getTempTexture(),
  clipspaceMode: false,
  sunDirection: new Vector311(0, 1, 0),
  sunDirectionForWater: new Vector311(0, 1, 0),
  sunShadowDirection: new Vector311(0, 1, 0),
  colorLightAmbient: new Color4(0.2, 0.27, 0.7),
  colorDarkAmbient: new Color4(0.1, 0.15, 0.4),
  colorSun: new Color4(0.5, 0.45, 0.3),
  relativeTileSize: 1 / 16,
  relativePixelSize: 1 / 512,
  pixelsPerTile: 32,
  textureFog: getTempTexture(),
  fogScroll: new Vector22(),
  waterHeight: 0.5,
  useWater: false
};
var fakeA = 0;
var __sunDirectionForWaterFake = new Vector311(0, Math.cos(fakeA), Math.sin(fakeA));
var __tempVec3 = new Vector311();
var FauxelMaterial = class extends RawShaderMaterial5 {
  setSunAngle;
  constructor(options = {}) {
    const params = buildParameters(__defaultParams5, options);
    const uUvST = new Uniform5(params.uvST);
    const uUvSTWorldOffset = new Uniform5(params.uvSTWorldOffset);
    const uTextureColor = new Uniform5(params.textureColor);
    const uTextureNormals = new Uniform5(params.textureNormals);
    const uTextureEmissive = new Uniform5(params.textureEmissive);
    const uTextureRoughnessMetalnessHeight = new Uniform5(params.textureRoughnessMetalnessHeight);
    const uTextureTopDownHeight = new Uniform5(params.textureTopDownHeight);
    const uTexturePointLights = new Uniform5(params.texturePointLights);
    const sunDirection = params.sunDirection;
    const uSunDirection = new Uniform5(sunDirection);
    const sunDirectionForWater = params.sunDirectionForWater;
    const uSunDirectionForWater = new Uniform5(sunDirectionForWater);
    const sunShadowDirection = params.sunShadowDirection;
    const uSunShadowDirection = new Uniform5(sunShadowDirection);
    const originalColorLightAmbient = params.colorLightAmbient.clone();
    const nightColorLightAmbient = new Color4(0.05, 0.1, 0.4);
    const colorLightAmbient = params.colorLightAmbient;
    const uColorLightAmbient = new Uniform5(colorLightAmbient);
    const originalColorDarkAmbient = params.colorDarkAmbient.clone();
    const nightColorDarkAmbient = new Color4(0, 0.05, 0.2);
    const colorDarkAmbient = params.colorDarkAmbient;
    const uColorDarkAmbient = new Uniform5(colorDarkAmbient);
    const colorSun = params.colorSun;
    const uColorSun = new Uniform5(colorSun);
    const uTextureFog = new Uniform5(params.textureFog);
    const uFogScroll = new Uniform5(params.fogScroll);
    const uWaterHeight = new Uniform5(params.waterHeight);
    const waterSunAngleY = 0.9;
    __sunDirectionForWaterFake.set(0, Math.cos(waterSunAngleY), Math.sin(waterSunAngleY));
    sunDirectionForWater.copy(__sunDirectionForWaterFake);
    sunDirectionForWater.x += params.sunDirection.x * 0.4;
    __tempVec3.copy(sunDirectionForWater).normalize();
    sunDirectionForWater.lerp(__tempVec3, 0.4);
    sunDirectionForWater.multiplyScalar(lerp(0.97, 1, 1 - Math.abs(sunDirection.x)));
    const uniforms = {
      uUvST,
      uUvSTWorldOffset,
      uTextureColor,
      uTextureNormals,
      uTextureEmissive,
      uTextureRoughnessMetalnessHeight,
      uTextureTopDownHeight,
      uTexturePointLights,
      uSunDirection,
      uSunDirectionForWater,
      uSunShadowDirection,
      uColorLightAmbient,
      uColorDarkAmbient,
      uColorSun,
      uTextureFog,
      uFogScroll,
      uWaterHeight
    };
    const defines = {
      CLIPSPACE_MODE: params.clipspaceMode,
      RELATIVE_TILE_SIZE: params.relativeTileSize,
      RELATIVE_PIXEL_SIZE: params.relativePixelSize,
      RELATIVE_TILE_PIXEL_SIZE: params.relativePixelSize / params.relativeTileSize,
      USE_WATER: params.useWater
    };
    super({
      uniforms,
      defines,
      vertexShader: vert_default5,
      fragmentShader: frag_default5,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide6
    });
    this.setSunAngle = (sunAngle) => {
      sunDirection.set(Math.cos(sunAngle), 0.75, Math.sin(sunAngle));
      sunDirection.normalize();
      sunShadowDirection.copy(sunDirection);
      sunShadowDirection.x *= -1;
      sunShadowDirection.y = 0;
      sunShadowDirection.multiplyScalar(2);
      const bDay = Math.max(0, Math.sin(sunAngle));
      colorLightAmbient.lerpColors(nightColorLightAmbient, originalColorLightAmbient, bDay);
      colorDarkAmbient.lerpColors(nightColorDarkAmbient, originalColorDarkAmbient, bDay);
      colorSun.setRGB(Math.pow(bDay, 0.5), Math.pow(bDay, 1), Math.pow(bDay, 2));
    };
  }
};

// src/helpers/NoiseTextureMaker.ts
import {
  LinearEncoding as LinearEncoding2,
  Mesh as Mesh12,
  NearestFilter as NearestFilter3,
  OrthographicCamera as OrthographicCamera2,
  PlaneBufferGeometry,
  RepeatWrapping,
  Scene as Scene3,
  Vector4 as Vector48,
  WebGLRenderTarget as WebGLRenderTarget2
} from "three";

// src/materials/SimplexNoiseMaterial/index.ts
import { Color as Color5, DoubleSide as DoubleSide7, RawShaderMaterial as RawShaderMaterial6, Uniform as Uniform6, Vector4 as Vector47 } from "three";

// src/materials/SimplexNoiseMaterial/frag.glsl
var frag_default6 = '// The MIT License\n// Copyright \xA9 2013 Inigo Quilez\n// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n\n// Simplex Noise (http://en.wikipedia.org/wiki/Simplex_noise), a type of gradient noise\n// that uses N+1 vertices for random gradient interpolation instead of 2^N as in regular\n// latice based Gradient Noise.\n\n// modified by Tomasz Dysinski 2021\n\nprecision lowp float;\n\nuniform vec3 uColor;\nvarying vec2 vUv;\n\n\nvec2 hash( vec2 p ) // replace this by something better\n{\n	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );\n	return -1.0 + 2.0*fract(sin(p)*43758.5453123);\n}\n\nfloat noise( in vec2 p )\n{\n  const float K1 = 0.366025404; // (sqrt(3)-1)/2;\n  const float K2 = 0.211324865; // (3-sqrt(3))/6;\n\n	vec2  i = floor( p + (p.x+p.y)*K1 );\n  vec2  a = p - i + (i.x+i.y)*K2;\n  float m = step(a.y,a.x); \n  vec2  o = vec2(m,1.0-m);\n  vec2  b = a - o + K2;\n	vec2  c = a - 1.0 + 2.0*K2;\n  vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );\n	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));\n  // return dot( n, vec3(70.0) );\n  return abs(dot( n, vec3(70.0) ));\n}\n\nfloat sampleNoise(in vec2 uv)\n{\n	float f = 0.0;\n  float strength = 0.5;\n  mat2 m = mat2( 2.6,  1.2, -1.2,  2.6 );\n  f  = strength * noise( uv ); uv *= m; strength *= 0.2;\n  f += strength * noise( uv ); uv *= m; //strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f += strength * noise( uv ); uv *= m; strength *= 0.5;\n  // f*=f;\n  // f = min(1.0, max(0.0, f * 10.0)) - f;\n  // float fi = abs(f);\n  float fi = 1.0 - (f * 0.5 + 0.5);\n	f = 1.0-fi*fi;\n  return fi;\n}\n\nvoid main() {\n  vec2 uv = vUv * 12.0 * vec2(1.0, 1.6);\n\n  // uv *= 5.0;\n  float f = sampleNoise(uv);\n\n	#ifdef MODE_NORMALS\n    vec2 dx = vec2(0.01, 0.0);\n    vec2 dy = vec2(0.0, 0.01);\n    float fL = sampleNoise(uv + dx);\n    float fR = sampleNoise(uv - dx);\n    float fU = sampleNoise(uv + dy);\n    float fD = sampleNoise(uv - dy);\n    float strength = 10.0;\n    vec3 normal = vec3(-(fL-fR) * strength, (fU-fD) * strength, f);\n    \n  	gl_FragColor = vec4( normalize(normal) * vec3(0.5) + vec3(0.5), 1.0 );\n  #else\n  	gl_FragColor = vec4( vec3(f) * uColor, 1.0 );\n  #endif\n}';

// src/materials/SimplexNoiseMaterial/vert.glsl
var vert_default6 = "precision lowp float;\n\nuniform vec4 uUvST;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nattribute vec3 position;\nattribute vec2 uv;\nvarying vec2 vUv;\n\nvoid main() {\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv * uUvST.xy + uUvST.zw;\n}";

// src/materials/SimplexNoiseMaterial/index.ts
var __defaultParams6 = {
  mode: "normals",
  uvST: new Vector47(0.2, 0.2, 0, 0),
  color: new Color5(1, 1, 1)
};
var SimplexNoiseMaterial = class extends RawShaderMaterial6 {
  constructor(options = {}) {
    const params = buildParameters(__defaultParams6, options);
    const uUvST = new Uniform6(params.uvST);
    const uColor = new Uniform6(params.color);
    const uniforms = {
      uUvST,
      uColor
    };
    const defines = {
      MODE_NORMALS: params.mode === "normals"
    };
    super({
      uniforms,
      defines,
      vertexShader: vert_default6,
      fragmentShader: frag_default6,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide7
    });
  }
};

// src/helpers/NoiseTextureMaker.ts
var NoiseTextureMaker = class {
  texture;
  _renderTarget;
  _scene;
  _camera;
  constructor(res = 256) {
    const geo = new PlaneBufferGeometry(2, 2);
    const uvST = new Vector48(1, 1, 0, 0);
    const mesh = new Mesh12(geo, new SimplexNoiseMaterial({
      uvST
    }));
    const scene = new Scene3();
    const camera = new OrthographicCamera2(-1, 1, -1, 1, -1, 1);
    const renderTarget = new WebGLRenderTarget2(res, res, {
      minFilter: NearestFilter3,
      magFilter: NearestFilter3,
      encoding: LinearEncoding2,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      generateMipmaps: false
    });
    scene.add(camera);
    scene.add(mesh);
    this._renderTarget = renderTarget;
    this.texture = renderTarget.texture;
    this._scene = scene;
    this._camera = camera;
  }
  render(renderer) {
    renderer.setRenderTarget(this._renderTarget);
    renderer.render(this._scene, this._camera);
    renderer.setRenderTarget(null);
  }
};

// src/rendering/tileMaker/spriteMaker/SpriteMaker.ts
import { Material as Material10, Mesh as Mesh13, Object3D as Object3D13, Vector4 as Vector49 } from "three";
var SpriteMaker = class extends TileMaker {
  _angleRegistry = [];
  constructor(pixelsPerTile = 32, pixelsPerCacheEdge = 2048, passes = ["beauty"]) {
    const dummy = () => new Object3D13();
    const bodyMaker = memoize(() => {
      const bodyGeo = getChamferedBoxGeometry(20, 14, 10, 3);
      const obj = new Mesh13(bodyGeo, getMeshMaterial("pants"));
      obj.position.y = 17;
      const headGeo = getChamferedBoxGeometry(16, 16 * verticalScale, 16, 4);
      const head = new Mesh13(headGeo, getMeshMaterial("skin"));
      head.position.y = 16;
      obj.add(head);
      const legGeo = getChamferedBoxGeometry(6, 12 * verticalScale, 6, 2);
      const leg = new Mesh13(legGeo, getMeshMaterial("pants"));
      leg.position.x = -6;
      leg.position.y = -12;
      obj.add(leg);
      const leg2 = leg.clone();
      leg2.position.x *= -1;
      obj.add(leg2);
      const armGeo = getChamferedBoxGeometry(4, 20 * verticalScale, 4, 1.25);
      const arm = new Mesh13(armGeo, getMeshMaterial("pants"));
      arm.position.x = -12;
      arm.rotation.z = Math.PI * -0.125;
      arm.position.y = -1;
      obj.add(arm);
      const arm2 = arm.clone();
      arm2.rotation.z *= -1;
      arm2.position.x *= -1;
      obj.add(arm2);
      return obj;
    });
    const body = () => bodyMaker();
    const body2 = () => {
      const obj = bodyMaker().clone(true);
      obj.traverse((node) => {
        if (node instanceof Mesh13 && node.material instanceof Material10 && node.material.name === "pants") {
          node.material = getMeshMaterial("pantsRed");
        }
      });
      return obj;
    };
    const hat = () => {
      const obj = new Mesh13(getChamferedBoxGeometry(18, 16 * verticalScale, 16, 3), getMeshMaterial("gold"));
      obj.position.z = -4;
      obj.position.y = 35;
      obj.scale.y *= verticalScale;
      return obj;
    };
    const sword = () => {
      const obj = new Mesh13(getChamferedBoxGeometry(2, 4, 16, 2), getMeshMaterial("gold"));
      obj.position.x = -14;
      obj.position.z = 10;
      obj.position.y = 11;
      return obj;
    };
    const shield = () => {
      const obj = new Mesh13(getChamferedBoxGeometry(12, 12, 2, 2), getMeshMaterial("gold"));
      obj.position.x = 12;
      obj.position.y = 16;
      obj.position.z = 6;
      obj.rotation.y = Math.PI * 0.125;
      return obj;
    };
    const indexedMeshes = [dummy, body, body2, hat, sword, shield];
    super(pixelsPerTile, pixelsPerCacheEdge, passes, indexedMeshes);
    this._pivot.scale.multiplyScalar(0.5);
  }
  getTileId(tileDescription) {
    throw new Error("Needs angle. Use getTileIdAtAngle()");
    return 0;
  }
  getTileIdAtAngle(tileDescription, angle) {
    const hash = `${tileDescription.toString()}@${angle}`;
    let index = this._tileHashRegistry.indexOf(hash);
    if (index === -1) {
      index = this._tileRegistry.length;
      if (index >= this._maxTiles) {
        console.error(`no more room for tiles! (${index})`);
      }
      this._tileRegistry.push(tileDescription);
      this._angleRegistry.push(angle);
      this._tileHashRegistry.push(hash);
      this._renderQueue.push(index);
      this._tileTexNeedsUpdate = true;
    }
    return index;
  }
  render(renderer) {
    if (this._tileTexNeedsUpdate) {
      const oldViewport = new Vector49();
      const oldScissor = new Vector49();
      renderer.getViewport(oldViewport);
      renderer.getScissor(oldScissor);
      this._tileTexNeedsUpdate = false;
      this._scene.updateMatrixWorld(true);
      for (const pass of this._passes) {
        renderer.setRenderTarget(this._renderTargets.get(pass));
        const p = this._pixelsPerTile / renderer.getPixelRatio();
        const depthPass = pass === "customTopDownHeight";
        for (const index of this._renderQueue) {
          const iCol = index % this._tilesPerEdge;
          const iRow = ~~(index / this._tilesPerEdge);
          const angle = this._angleRegistry[index];
          if (this._pivot.rotation.y !== angle) {
            this._pivot.rotation.y = angle;
            this._pivot.updateMatrixWorld(true);
          }
          const visualProps = this._tileRegistry[index];
          const layer2 = !!(visualProps[0] & 1);
          if (layer2 && depthPass) {
            continue;
          }
          for (let j = 0; j < this._indexedMeshes.length; j++) {
            const jb = ~~(j / 8);
            const j8 = j % 8;
            const shouldShow = !!(visualProps[jb] & 1 << j8);
            if (this._indexedMeshesVisibility[j] && !shouldShow) {
              this._indexedMeshes[j]().visible = false;
            } else if (!this._indexedMeshesVisibility[j] && shouldShow) {
              this._indexedMeshes[j]().visible = true;
            }
            this._indexedMeshesVisibility[j] = shouldShow;
          }
          renderer.setViewport(iCol * p, iRow * p, p, p);
          renderer.setScissor(iCol * p, iRow * p, p, p);
          changeMeshMaterials(this._scene, pass, true);
          renderer.render(this._scene, layer2 ? this._cameraTiltedTop : depthPass ? this._cameraTopDown : this._cameraTiltedBottom);
        }
      }
      renderer.setViewport(oldViewport);
      renderer.setScissor(oldScissor);
      renderer.setRenderTarget(null);
      this._renderQueue.length = 0;
    }
  }
};

// src/rendering/tileMaker/spriteMaker/JITSpriteSampler.ts
var masks322 = [];
for (let i = 0; i < 32; i++) {
  masks322[i] = 1 << i;
}
var masks82 = [];
for (let i = 0; i < 8; i++) {
  masks82[i] = 1 << i;
}
var SpriteController = class {
  constructor(x, y, id, metaBytes, angle) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.metaBytes = metaBytes;
    this.angle = angle;
  }
};
var __id = 0;
var JITTileSampler2 = class {
  constructor(_spriteMaker, _pixelsPerTile, _viewWidth, _viewHeight) {
    this._spriteMaker = _spriteMaker;
    this._pixelsPerTile = _pixelsPerTile;
    this._viewWidth = _viewWidth;
    this._viewHeight = _viewHeight;
    this.metaPropertyLookup = ["body", "body2", "hat", "sword", "shield"];
    this.visualPropertyLookup = [
      "layer2",
      "body",
      "body2",
      "hat",
      "sword",
      "shield",
      "180",
      "90",
      "45"
    ];
    this.bytesPerTile = Math.ceil(this.visualPropertyLookup.length / 8);
    const seed = 1;
    const bodyNoise = ThreshNoiseHelper2D.simple(0.1, 0, 0, 0, seed);
    const body2Noise = ThreshNoiseHelper2D.simple(0.08, -100, -100, 0, seed);
    const hatNoise = ThreshNoiseHelper2D.simple(0.06, -50, -50, 0.5, seed);
    const goldNoise = ThreshNoiseHelper2D.simple(0.16, 50, -50, 0, seed);
    const swordNoise = ThreshNoiseHelper2D.simple(0.26, 50, 50, 0, seed);
    const shieldNoise = ThreshNoiseHelper2D.simple(0.36, 50, 150, 0, seed);
    this.metaNoiseGenerators = [
      bodyNoise,
      body2Noise,
      hatNoise,
      goldNoise,
      swordNoise,
      shieldNoise
    ];
  }
  _sprites = [];
  offsetX = 0;
  offsetY = 0;
  makeSprite(x, y, angle) {
    const id = __id;
    const sprite = new SpriteController(x, y, id, this.sampleMeta(id), angle);
    __id++;
    this._sprites.push(sprite);
    return sprite;
  }
  get spriteMaker() {
    return this._spriteMaker;
  }
  set spriteMaker(value) {
    throw new Error("Cannot change spriteMaker during runtime");
  }
  metaPropertyLookup;
  visualPropertyLookup;
  metaNoiseGenerators;
  bytesPerTile;
  localMetaProps;
  visProps;
  metaCache = /* @__PURE__ */ new Map();
  metaPropertyMasks;
  dirtyMeta = /* @__PURE__ */ new Set();
  sampleMeta(id) {
    const key = id.toString();
    if (this.metaCache.has(key)) {
      return this.metaCache.get(key);
    }
    this.localMetaProps = this.metaNoiseGenerators.reduce((accum, noise, j) => {
      return accum + (noise.getTreshold(wrap(id * 37, -100, 100), wrap(id * 124, -70, 70)) << j);
    }, 0);
    return this.validateLocalMeta(id);
  }
  flipMeta(id, meta, validate = true) {
    this.writeMeta(id, this.metaBitsFlip(this.sampleMeta(id), meta));
    if (validate) {
      this.validateLocalMeta(id);
    }
  }
  metaBitsHas(val, maskName) {
    return val & masks322[this.metaPropertyLookup.indexOf(maskName)];
  }
  metaBitsFlip(val, maskName) {
    return val ^ masks322[this.metaPropertyLookup.indexOf(maskName)];
  }
  visualBitsEnable(val, maskName) {
    const i = this.visualPropertyLookup.indexOf(maskName);
    const ib = ~~(i / 8);
    const i8 = i % 8;
    val[ib] |= masks82[i8];
  }
  localMetaBitsFlip(maskName) {
    this.localMetaProps = this.metaBitsFlip(this.localMetaProps, maskName);
  }
  localMetaBitsHas(maskName) {
    return this.metaBitsHas(this.localMetaProps, maskName);
  }
  writeMeta(id, meta) {
    const key = id.toString();
    if (this.metaCache.has(key) && this.metaCache.get(key)) {
      this.metaCache.set(key, meta);
    }
    this.dirtyMeta.add(key);
    this.localMetaProps = meta;
  }
  validateLocalMeta(id) {
    const key = id.toString();
    if (!this.localMetaBitsHas("body") && !this.localMetaBitsHas("body2")) {
      this.localMetaBitsFlip("body");
    }
    if (this.localMetaBitsHas("body") && this.localMetaBitsHas("body2")) {
      this.localMetaBitsFlip("body2");
    }
    this.metaCache.set(key, this.localMetaProps);
    return this.localMetaProps;
  }
  myVisualBitsEnable(maskName) {
    this.visualBitsEnable(this.visProps, maskName);
  }
  sampleVis(id, angle) {
    const metaProps = this.sampleMeta(id);
    this.localMetaProps = metaProps;
    this.visProps = new Uint8Array(this.bytesPerTile);
    this.myVisualBitsEnable(this.localMetaBitsHas("body") ? "body" : "body2");
    if (this.localMetaBitsHas("hat")) {
      this.myVisualBitsEnable("hat");
    }
    if (this.localMetaBitsHas("sword")) {
      this.myVisualBitsEnable("sword");
    }
    if (this.localMetaBitsHas("shield")) {
      this.myVisualBitsEnable("shield");
    }
    const idBottom = this._spriteMaker.getTileIdAtAngle(this.visProps, angle);
    const visProps2 = this.visProps.slice();
    visProps2[0] |= 1;
    const idTop = this._spriteMaker.getTileIdAtAngle(visProps2, angle);
    return {
      idBottom,
      idTop
    };
  }
  updateVis(bottomPointsGeo, topPointsGeo) {
    if (this._sprites.length > 0) {
      const ppt = this._pixelsPerTile;
      const xyBottomAttr = bottomPointsGeo.getAttribute("xy");
      const xyBottomArr = xyBottomAttr.array;
      const idBottomAttr = bottomPointsGeo.getAttribute("id");
      const idBottomArr = idBottomAttr.array;
      const xyTopAttr = topPointsGeo.getAttribute("xy");
      const xyTopArr = xyTopAttr.array;
      const idTopAttr = topPointsGeo.getAttribute("id");
      const idTopArr = idTopAttr.array;
      bottomPointsGeo.drawRange.count = 0;
      topPointsGeo.drawRange.count = 0;
      let j = 0;
      for (let i = 0; i < this._sprites.length; i++) {
        const sprite = this._sprites[i];
        const x = sprite.x - this.offsetX;
        const y = sprite.y - this.offsetY;
        if (x < 0 || x > this._viewWidth || y < 0 || y > this._viewHeight) {
          continue;
        }
        const xSnap = Math.round(wrap(x, 0, this._viewWidth) * ppt) / ppt;
        const ySnap = Math.round(wrap(y, 0, this._viewHeight) * ppt) / ppt;
        const id = sprite.metaBytes;
        const j2 = j * 2;
        xyBottomArr[j2] = xSnap;
        xyBottomArr[j2 + 1] = ySnap;
        xyTopArr[j2] = xSnap;
        xyTopArr[j2 + 1] = ySnap + 1;
        const sample = this.sampleVis(id, sprite.angle);
        idBottomArr[j] = sample.idBottom;
        idTopArr[j] = sample.idTop;
        j++;
      }
      bottomPointsGeo.drawRange.count = j;
      topPointsGeo.drawRange.count = j;
      if (j === 0) {
        return false;
      }
      xyBottomAttr.needsUpdate = true;
      idBottomAttr.needsUpdate = true;
      xyTopAttr.needsUpdate = true;
      idTopAttr.needsUpdate = true;
      return true;
    } else {
      return false;
    }
  }
};

// src/mapCache/MapCacheRenderer.ts
import {
  BufferAttribute as BufferAttribute2,
  BufferGeometry as BufferGeometry8,
  LinearEncoding as LinearEncoding3,
  NearestFilter as NearestFilter4,
  OrthographicCamera as OrthographicCamera3,
  Points,
  RepeatWrapping as RepeatWrapping2,
  Scene as Scene4,
  Uint16BufferAttribute as Uint16BufferAttribute2,
  Uint8BufferAttribute,
  WebGLRenderTarget as WebGLRenderTarget3
} from "three";

// src/materials/TileCacheWriterPointMaterial/index.ts
import {
  Color as Color6,
  RawShaderMaterial as RawShaderMaterial7,
  Uniform as Uniform7,
  Vector2 as Vector23
} from "three";

// src/materials/TileCacheWriterPointMaterial/frag.glsl
var frag_default7 = "precision highp float;\n\nuniform vec3 uColor;\nuniform sampler2D uTileTex;\n\nvarying vec2 vUv;\n\n#ifdef DISCARD_BY_MAP_DEPTH_CACHE\n  #ifdef ALTERNATE_DEPTH_TILE\n    uniform sampler2D uAlternateDepthTileTex;\n  #endif\n  uniform sampler2D uMapDepthCacheTexture;\n  varying vec2 vInverseUv;\n#endif\n\nvoid main() {\n  // vec2 uvTile = floor(uTileMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;\n  vec2 flippedCoord = gl_PointCoord;\n  flippedCoord.y = 1.0 - flippedCoord.y;\n  vec2 uv = vUv + flippedCoord / TILES_PER_CACHE_EDGE;\n  #ifdef DISCARD_BY_MAP_DEPTH_CACHE\n    #ifdef ALTERNATE_DEPTH_TILE\n      vec4 depthTileSample = texture2D(uAlternateDepthTileTex, uv);\n      if(depthTileSample.a < 0.1) {\n        discard;\n      }\n    #endif\n    vec4 bgTexel = texture2D(uMapDepthCacheTexture, vInverseUv + TILE_VIEW_RATIO * flippedCoord);\n    if(depthTileSample.b < bgTexel.b) {\n      discard;\n    }\n  #endif\n\n  vec4 tileTexel = texture2D(uTileTex, uv);\n  if(tileTexel.a < 0.1) {\n    discard;\n  }\n  gl_FragColor = tileTexel;\n}";

// src/materials/TileCacheWriterPointMaterial/vert.glsl
var vert_default7 = "precision highp float;\n\nuniform vec2 uViewRes;\nattribute vec2 xy;\nuniform float z;\nattribute float id;\n\nvarying vec2 vUv;\n\n#ifdef DISCARD_BY_MAP_DEPTH_CACHE \n    varying vec2 vInverseUv;\n    uniform vec4 uMapDepthCacheUvST;\n#endif\n\nvoid main() {\n    gl_Position = vec4(((xy + 0.5) * PIXELS_PER_TILE) / uViewRes * 2.0 - 1.0, z, 1.0);\n    #ifdef DEPTH_SORT_BY_Y \n        gl_Position.z += xy.y * 0.05;\n    #endif\n    gl_PointSize = PIXELS_PER_TILE;\n    vUv = vec2(mod(id, TILES_PER_CACHE_EDGE) / TILES_PER_CACHE_EDGE, floor(id / TILES_PER_CACHE_EDGE) / TILES_PER_CACHE_EDGE);\n    #ifdef DISCARD_BY_MAP_DEPTH_CACHE \n        vInverseUv = gl_Position.xy * 0.5 - 0.5 - (vec2(PIXELS_PER_TILE * 0.5) / uViewRes);\n        vInverseUv = vInverseUv * uMapDepthCacheUvST.xy + uMapDepthCacheUvST.zw;\n    #endif\n}";

// src/materials/TileCacheWriterPointMaterial/index.ts
var __defaultParams7 = {
  color: new Color6(1, 0, 0),
  tileTex: getTempTexture(),
  viewWidth: 1024,
  viewHeight: 1024,
  pixelsPerTile: 32,
  pixelsPerCacheEdge: 2048,
  z: 0
};
var TileCacheWriterPointMaterial = class extends RawShaderMaterial7 {
  get tileTexture() {
    return this._tileTexUniform.value;
  }
  set tileTexture(value) {
    this._tileTexUniform.value = value;
  }
  get alternateDepthTileTexture() {
    return this._alternateDepthTileTexUniform.value;
  }
  set alternateDepthTileTexture(value) {
    this._alternateDepthTileTexUniform.value = value;
  }
  _tileTexUniform;
  _alternateDepthTileTexUniform;
  constructor(options = {}) {
    const params = buildParameters(__defaultParams7, options);
    assertPowerOfTwo(params.pixelsPerTile);
    assertPowerOfTwo(params.pixelsPerCacheEdge);
    const uTileTex = new Uniform7(params.tileTex);
    const alternateDepthTileTexUniform = new Uniform7(params.alternateDepthTileTex || getTempTexture());
    const uniforms = {
      uColor: new Uniform7(params.color),
      uTileTex,
      uViewRes: new Uniform7(new Vector23(params.viewWidth, params.viewHeight)),
      z: new Uniform7(params.z)
    };
    const defines = {
      PIXELS_PER_TILE: params.pixelsPerTile.toFixed(1),
      TILES_PER_CACHE_EDGE: (params.pixelsPerCacheEdge / params.pixelsPerTile).toFixed(1)
    };
    if (params.mapDepthCacheTexture) {
      uniforms.uMapDepthCacheTexture = new Uniform7(params.mapDepthCacheTexture);
      uniforms.uMapDepthCacheUvST = new Uniform7(params.mapDepthCacheUvST);
      defines.DISCARD_BY_MAP_DEPTH_CACHE = true;
      defines.TILE_VIEW_RATIO = `vec2(${(32 / params.viewWidth).toFixed(6)}, ${(32 / params.viewHeight).toFixed(6)})`;
      if (params.alternateDepthTileTex) {
        uniforms.uAlternateDepthTileTex = alternateDepthTileTexUniform;
        defines.ALTERNATE_DEPTH_TILE = true;
      }
    }
    if (params.depthSortByY) {
      defines.DEPTH_SORT_BY_Y = true;
    }
    super({
      uniforms,
      defines,
      vertexShader: vert_default7,
      fragmentShader: frag_default7,
      depthWrite: true,
      depthTest: true
    });
    this._tileTexUniform = uTileTex;
    this._alternateDepthTileTexUniform = alternateDepthTileTexUniform;
  }
};

// src/mapCache/MapCacheRenderer.ts
var MapCacheRenderer = class {
  constructor(width, height, _jitTileSampler, pixelsPerTile = 32, pixelsPerCacheEdge = 1024) {
    this._jitTileSampler = _jitTileSampler;
    const totalTiles = width * height;
    const viewWidth = width * pixelsPerTile;
    const viewHeight = height * pixelsPerTile;
    const xyBottomArr = new Uint8Array(totalTiles * 2);
    const xyTopArr = new Uint8Array(totalTiles * 2);
    const idBottomArr = new Uint16Array(totalTiles);
    const idTopArr = new Uint16Array(totalTiles);
    for (let i = 0; i < totalTiles; i++) {
      const x = i % width + _jitTileSampler.offsetX;
      const y = ~~(i / width) - _jitTileSampler.offsetY;
      const i2 = i * 2;
      const sample = _jitTileSampler.sampleVis(x, y);
      xyBottomArr[i2] = wrap(x, 0, width);
      xyBottomArr[i2 + 1] = wrap(y, 0, height);
      xyTopArr[i2] = wrap(x, 0, width);
      xyTopArr[i2 + 1] = wrap(y + 1, 0, height);
      idBottomArr[i] = sample.idBottom;
      idTopArr[i] = sample.idTop;
    }
    const tileBottomPointsGeo = new BufferGeometry8();
    const xyBottomAttr = new Uint8BufferAttribute(xyBottomArr, 2);
    tileBottomPointsGeo.setAttribute("xy", xyBottomAttr);
    const idBottomAttr = new Uint16BufferAttribute2(idBottomArr, 1);
    tileBottomPointsGeo.setAttribute("id", idBottomAttr);
    const tileTopPointsGeo = new BufferGeometry8();
    const xyTopAttr = new Uint8BufferAttribute(xyTopArr, 2);
    tileTopPointsGeo.setAttribute("xy", xyTopAttr);
    const idTopAttr = new Uint16BufferAttribute2(idTopArr, 1);
    tileTopPointsGeo.setAttribute("id", idTopAttr);
    const indexArr = new Uint16Array(totalTiles);
    for (let i = 0; i < totalTiles; i++) {
      indexArr[i] = i;
    }
    tileBottomPointsGeo.setIndex(new BufferAttribute2(indexArr, 1));
    tileTopPointsGeo.setIndex(new BufferAttribute2(indexArr, 1));
    const pass = _jitTileSampler.tileMaker.passes[0];
    const pointsBottomMaterial = new TileCacheWriterPointMaterial({
      tileTex: _jitTileSampler.tileMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge
    });
    const pointsBottom = new Points(tileBottomPointsGeo, pointsBottomMaterial);
    this._pointsBottomMaterial = pointsBottomMaterial;
    pointsBottom.frustumCulled = false;
    const pointsTopMaterial = new TileCacheWriterPointMaterial({
      tileTex: _jitTileSampler.tileMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge
    });
    this._pointsTopMaterial = pointsTopMaterial;
    const pointsTop = new Points(tileTopPointsGeo, pointsTopMaterial);
    pointsTop.frustumCulled = false;
    pointsTop.renderOrder = 1;
    for (const pass2 of _jitTileSampler.tileMaker.passes) {
      const mapCache = new WebGLRenderTarget3(viewWidth, viewHeight, {
        magFilter: NearestFilter4,
        minFilter: NearestFilter4,
        encoding: LinearEncoding3,
        generateMipmaps: false,
        wrapS: RepeatWrapping2,
        wrapT: RepeatWrapping2
      });
      this.mapCache.set(pass2, mapCache);
    }
    const mapCacheScene = new Scene4();
    mapCacheScene.add(pointsBottom);
    mapCacheScene.add(pointsTop);
    const mapCacheCamera = new OrthographicCamera3(-100, 100, -100, 100, 100, -100);
    mapCacheScene.add(mapCacheCamera);
    this.mapCacheScene = mapCacheScene;
    this.mapCacheCamera = mapCacheCamera;
    this.tileBottomPointsGeo = tileBottomPointsGeo;
    this.tileTopPointsGeo = tileTopPointsGeo;
  }
  mapCache = /* @__PURE__ */ new Map();
  mapCacheScene;
  mapCacheCamera;
  tileBottomPointsGeo;
  tileTopPointsGeo;
  _pointsTopMaterial;
  _pointsBottomMaterial;
  render(renderer) {
    for (const pass of this._jitTileSampler.tileMaker.passes) {
      renderer.setRenderTarget(this.mapCache.get(pass));
      const passTileTex = this._jitTileSampler.tileMaker.getTexture(pass);
      this._pointsBottomMaterial.tileTexture = passTileTex;
      this._pointsTopMaterial.tileTexture = passTileTex;
      renderer.render(this.mapCacheScene, this.mapCacheCamera);
    }
    renderer.setRenderTarget(null);
  }
};

// src/mapCache/MapWithSpritesCacheRenderer.ts
import {
  BufferAttribute as BufferAttribute3,
  BufferGeometry as BufferGeometry9,
  Float32BufferAttribute as Float32BufferAttribute2,
  LinearEncoding as LinearEncoding4,
  Mesh as Mesh14,
  NearestFilter as NearestFilter5,
  OrthographicCamera as OrthographicCamera4,
  PlaneBufferGeometry as PlaneBufferGeometry2,
  Points as Points2,
  RepeatWrapping as RepeatWrapping3,
  Scene as Scene5,
  Uint16BufferAttribute as Uint16BufferAttribute3,
  Vector4 as Vector411,
  WebGLRenderTarget as WebGLRenderTarget4
} from "three";
var MapWithSpritesCacheRenderer = class {
  constructor(_mapCacheRenderer, width, height, maxSprites, _jitSpriteSampler, pixelsPerTile = 32, pixelsPerCacheEdge = 1024) {
    this._mapCacheRenderer = _mapCacheRenderer;
    this._jitSpriteSampler = _jitSpriteSampler;
    const viewWidth = width * pixelsPerTile;
    const viewHeight = height * pixelsPerTile;
    const xyBottomArr = new Float32Array(maxSprites * 2);
    const xyTopArr = new Float32Array(maxSprites * 2);
    const idBottomArr = new Uint16Array(maxSprites);
    const idTopArr = new Uint16Array(maxSprites);
    const tileBottomPointsGeo = new BufferGeometry9();
    const xyBottomAttr = new Float32BufferAttribute2(xyBottomArr, 2);
    tileBottomPointsGeo.setAttribute("xy", xyBottomAttr);
    const idBottomAttr = new Uint16BufferAttribute3(idBottomArr, 1);
    tileBottomPointsGeo.setAttribute("id", idBottomAttr);
    const tileTopPointsGeo = new BufferGeometry9();
    const xyTopAttr = new Float32BufferAttribute2(xyTopArr, 2);
    tileTopPointsGeo.setAttribute("xy", xyTopAttr);
    const idTopAttr = new Uint16BufferAttribute3(idTopArr, 1);
    tileTopPointsGeo.setAttribute("id", idTopAttr);
    const indexArr = new Uint16Array(maxSprites);
    for (let i = 0; i < maxSprites; i++) {
      indexArr[i] = i;
    }
    tileBottomPointsGeo.setIndex(new BufferAttribute3(indexArr, 1));
    tileTopPointsGeo.setIndex(new BufferAttribute3(indexArr, 1));
    const spriteMaker = _jitSpriteSampler.spriteMaker;
    const pass = _jitSpriteSampler.spriteMaker.passes[0];
    for (const pass2 of spriteMaker.passes) {
      const mapCache = new WebGLRenderTarget4(viewWidth, viewHeight, {
        magFilter: NearestFilter5,
        minFilter: NearestFilter5,
        encoding: LinearEncoding4,
        generateMipmaps: false,
        wrapS: RepeatWrapping3,
        wrapT: RepeatWrapping3
      });
      this.mapCache.set(pass2, mapCache);
    }
    const uvST = new Vector411(1, 1, 0, 0);
    const matParams = {
      tileTex: spriteMaker.getTexture(pass),
      viewWidth,
      viewHeight,
      pixelsPerTile,
      pixelsPerCacheEdge,
      mapDepthCacheTexture: this._mapCacheRenderer.mapCache.get("customRoughnessMetalnessHeight").texture,
      mapDepthCacheUvST: uvST,
      alternateDepthTileTex: spriteMaker.getTexture("customRoughnessMetalnessHeight"),
      depthSortByY: true
    };
    const pointsBottomMaterial = new TileCacheWriterPointMaterial(matParams);
    const pointsBottom = new Points2(tileBottomPointsGeo, pointsBottomMaterial);
    this._pointsBottomMaterial = pointsBottomMaterial;
    pointsBottom.frustumCulled = false;
    matParams.z = -0.1;
    const pointsTopMaterial = new TileCacheWriterPointMaterial(matParams);
    this._pointsTopMaterial = pointsTopMaterial;
    const pointsTop = new Points2(tileTopPointsGeo, pointsTopMaterial);
    pointsTop.frustumCulled = false;
    pointsTop.renderOrder = 1;
    const mapCacheScene = new Scene5();
    mapCacheScene.add(pointsBottom);
    mapCacheScene.add(pointsTop);
    const mapCacheCamera = new OrthographicCamera4(-100, 100, 100, -100, 100, -100);
    mapCacheScene.add(mapCacheCamera);
    const backdropMaterial = new BasicTextureMaterial({
      texture: getTempTexture(),
      uvST
    });
    backdropMaterial.depthTest = false;
    backdropMaterial.depthWrite = false;
    const backdrop = new Mesh14(new PlaneBufferGeometry2(200, 200), backdropMaterial);
    mapCacheScene.add(backdrop);
    backdrop.position.z = -1;
    backdrop.renderOrder = -1;
    this.backdrop = backdrop;
    this.mapCacheScene = mapCacheScene;
    this.mapCacheCamera = mapCacheCamera;
    this.mapCacheBackdropMaterial = backdropMaterial;
    this.spriteBottomPointsGeo = tileBottomPointsGeo;
    this.spriteTopPointsGeo = tileTopPointsGeo;
    this._backdropUvST = uvST;
    this._tilesInViewWidth = width;
    this._tilesInViewHeight = height;
  }
  mapCache = /* @__PURE__ */ new Map();
  mapCacheScene;
  mapCacheCamera;
  mapCacheBackdropMaterial;
  spriteBottomPointsGeo;
  spriteTopPointsGeo;
  _pointsTopMaterial;
  _pointsBottomMaterial;
  backdrop;
  offsetX = 0;
  offsetY = 0;
  _backdropUvST;
  _tilesInViewWidth;
  _tilesInViewHeight;
  render(renderer) {
    this._backdropUvST.z = this.offsetX / this._tilesInViewWidth;
    this._backdropUvST.w = this.offsetY / this._tilesInViewHeight;
    for (const pass of this._jitSpriteSampler.spriteMaker.passes) {
      this.mapCacheBackdropMaterial.texture = this._mapCacheRenderer.mapCache.get(pass).texture;
      renderer.setRenderTarget(this.mapCache.get(pass));
      const passTileTex = this._jitSpriteSampler.spriteMaker.getTexture(pass);
      const passDepthTileTex = this._jitSpriteSampler.spriteMaker.getTexture(pass === "customTopDownHeight" ? "customTopDownHeight" : "customRoughnessMetalnessHeight");
      this._pointsBottomMaterial.tileTexture = passTileTex;
      this._pointsBottomMaterial.alternateDepthTileTexture = passDepthTileTex;
      this._pointsTopMaterial.tileTexture = passTileTex;
      this._pointsTopMaterial.alternateDepthTileTexture = passDepthTileTex;
      renderer.clearDepth();
      renderer.render(this.mapCacheScene, this.mapCacheCamera);
    }
    renderer.setRenderTarget(null);
  }
};

// src/mapCache/PointLightRenderer.ts
import {
  BufferAttribute as BufferAttribute4,
  BufferGeometry as BufferGeometry10,
  Float32BufferAttribute as Float32BufferAttribute3,
  LinearEncoding as LinearEncoding5,
  NearestFilter as NearestFilter6,
  OrthographicCamera as OrthographicCamera5,
  Points as Points3,
  RepeatWrapping as RepeatWrapping4,
  Scene as Scene6,
  WebGLRenderTarget as WebGLRenderTarget5
} from "three";

// src/materials/PointLightPointMaterial/index.ts
import {
  AdditiveBlending,
  Color as Color7,
  RawShaderMaterial as RawShaderMaterial8,
  Uniform as Uniform8,
  Vector2 as Vector24
} from "three";

// src/materials/PointLightPointMaterial/frag.glsl
var frag_default8 = "precision highp float;\n\n\nuniform sampler2D uTextureColorsMapCache;\nuniform sampler2D uTextureNormalsMapCache;\nuniform sampler2D uTextureDepthTopDownMapCache;\nuniform sampler2D uTextureRoughnessMetalnessHeightMapCache;\nvarying vec2 vInverseUv;\nvarying vec2 vSizeHeight;\nvarying vec3 vColor;\n\nvoid main() {\n  // vec2 uvTile = floor(uTileMap.xy * 8.0) / 8.0 + fract(vUv * 64.0) / 8.0;\n  vec2 flippedCoord = gl_PointCoord;\n  float lightSize = vSizeHeight.x;\n  float lightHeight = vSizeHeight.y;\n  flippedCoord.y = 1.0 - flippedCoord.y;\n  vec2 texelUv = vInverseUv + PIXEL_VIEW_RATIO * lightSize * flippedCoord;\n  vec4 texelColor = texture2D(uTextureColorsMapCache, texelUv);\n  vec4 texelRoughnessMetalnessHeight = texture2D(uTextureRoughnessMetalnessHeightMapCache, texelUv);\n  float texelHeight = texelRoughnessMetalnessHeight.b * 2.0;\n  float lightDepth = lightHeight - texelHeight;\n  vec3 relLightPos = vec3((gl_PointCoord - 0.5) * lightSize / PIXELS_PER_TILE, -lightDepth);\n  relLightPos.y += texelHeight;\n  // vec3 relLightPos = vec3(gl_PointCoord - 0.5, -lightDepth);\n  vec3 lightDir = normalize(-relLightPos).rbg;\n  vec4 texelNormals = texture2D(uTextureNormalsMapCache, texelUv);\n\n  float roughness = 2.0 / texelRoughnessMetalnessHeight.r;\n  float metalness = texelRoughnessMetalnessHeight.g;\n  vec3 surfaceNormal = texelNormals.rgb * 2.0 - 1.0;\n  // float dotP = dot(surfaceNormal, lightDir);\n  float dotP = dot(surfaceNormal, lightDir) * (1.0 + metalness * 0.4);\n  dotP = mix(1.0 - 0.5 * (1.0-dotP), dotP, roughness);\n  float distance = max(0.0, 1.0 - length(relLightPos)/(lightSize / PIXELS_PER_TILE * 0.5));\n  float lightStrength = max(0.0, dotP) * distance * distance;\n\n\n  float floorYOffset = -texelHeight * RELATIVE_TILE_SIZE;\n  texelHeight += RELATIVE_TILE_PIXEL_SIZE;\n  float mixShadow = 1.0;\n  vec2 flooredUv = texelUv + vec2(0, floorYOffset);\n  vec3 relLightPos2 = vec3(relLightPos.x, relLightPos.z, -relLightPos.y);\n  // float newHeightBBB = texture2D(uTextureDepthTopDownMapCache, flooredUv).b * 2.0;\n	for(float i = RELATIVE_PIXEL_SIZE; i < RELATIVE_TILE_SIZE * 0.8; i += RELATIVE_PIXEL_SIZE) {\n    // float newHeight = 2.0;\n    float newHeight = texture2D(uTextureDepthTopDownMapCache, flooredUv - relLightPos2.xz * i).b * 2.0;\n    // float newHeight2 = 2.0;\n    float newHeight2 = texture2D(uTextureRoughnessMetalnessHeightMapCache, texelUv + (vec2(0.0, i) - relLightPos2.xz * i)).b * 2.0;\n    mixShadow = min(mixShadow, max(step(newHeight, texelHeight), step(newHeight2, texelHeight)));\n    // mixShadow = min(mixShadow, step(newHeight2, texelHeight));\n    texelHeight += RELATIVE_TILE_PIXEL_SIZE;\n	}\n\n  vec3 lightColorHit = vColor * lightStrength * mixShadow;\n\n	gl_FragColor = vec4(mix(lightColorHit, lightColorHit * texelColor.rgb, vec3(metalness)), 1.0);\n\n  // gl_FragColor = texelNormals;\n  // gl_FragColor = vec4(mixShadow, distance, lightDepth, 1.0);\n  // gl_FragColor = vec4(lightStrength, lightStrength, lightStrength, 1.0);\n  // gl_FragColor = vec4(lightDir * 0.5 + 0.5, 1.0);\n  // gl_FragColor = vec4(relLightPos * 0.5 + 0.5, 1.0);\n  // gl_FragColor = vec4(relLightPos2 * 0.5 + 0.5, 1.0);\n  // gl_FragColor = vec4(0.2, 0.0, 0.0, 1.0);\n  // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n  // gl_FragColor.rgb = vec3(lightStrength);\n  // gl_FragColor.rgb = vec3(newHeightBBB);\n  \n}";

// src/materials/PointLightPointMaterial/vert.glsl
var vert_default8 = "precision highp float;\n\nuniform vec2 uViewRes;\nattribute vec4 xyzSize;\nattribute vec3 color;\nuniform float z;\nvarying vec2 vSizeHeight;\nvarying vec3 vColor;\n\nvarying vec2 vInverseUv;\n\nvoid main() {\n  gl_Position = vec4(((xyzSize.xy + 0.5) * PIXELS_PER_TILE) / uViewRes * 2.0 - 1.0, z, 1.0);\n  gl_PointSize = xyzSize.w;\n  vInverseUv = gl_Position.xy * 0.5 - 0.5 - (vec2(xyzSize.w * 0.5) / uViewRes);\n  vSizeHeight = xyzSize.wz;\n  vColor = color;\n}";

// src/materials/PointLightPointMaterial/index.ts
var __defaultParams8 = {
  mapCacheColorsTexture: getTempTexture(),
  mapCacheNormalsTexture: getTempTexture(),
  mapCacheRoughnessMetalnessHeightTexture: getTempTexture(),
  mapCacheDepthTopDownTexture: getTempTexture(),
  viewWidth: 1024,
  viewHeight: 1024,
  pixelsPerTile: 32,
  relativeTileSize: 1 / 16,
  relativePixelSize: 1 / 512,
  pixelsPerCacheEdge: 2048,
  z: 0
};
var PointLightPointMaterial = class extends RawShaderMaterial8 {
  constructor(options = {}) {
    const params = buildParameters(__defaultParams8, options);
    assertPowerOfTwo(params.pixelsPerTile);
    assertPowerOfTwo(params.pixelsPerCacheEdge);
    const uTextureColorsMapCache = new Uniform8(params.mapCacheColorsTexture);
    const uTextureNormalsMapCache = new Uniform8(params.mapCacheNormalsTexture);
    const uTextureRoughnessMetalnessHeightMapCache = new Uniform8(params.mapCacheRoughnessMetalnessHeightTexture);
    const uTextureDepthTopDownMapCache = new Uniform8(params.mapCacheDepthTopDownTexture);
    const uniforms = {
      uColor: new Uniform8(new Color7(1, 0.9, 0.8)),
      uTextureColorsMapCache,
      uTextureNormalsMapCache,
      uTextureRoughnessMetalnessHeightMapCache,
      uTextureDepthTopDownMapCache,
      uViewRes: new Uniform8(new Vector24(params.viewWidth, params.viewHeight)),
      z: new Uniform8(params.z)
    };
    const defines = {
      PIXELS_PER_TILE: params.pixelsPerTile.toFixed(1),
      RELATIVE_TILE_SIZE: params.relativeTileSize,
      RELATIVE_PIXEL_SIZE: params.relativePixelSize,
      RELATIVE_TILE_PIXEL_SIZE: params.relativePixelSize / params.relativeTileSize
    };
    defines.PIXEL_VIEW_RATIO = `vec2(${(1 / params.viewWidth).toFixed(6)}, ${(1 / params.viewHeight).toFixed(6)})`;
    super({
      uniforms,
      defines,
      vertexShader: vert_default8,
      fragmentShader: frag_default8,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
  }
};

// src/utils/colorLibrary.ts
import { Color as Color8 } from "three";
var COLOR_BLACK = new Color8(0);
var COLOR_WHITE = new Color8(16777215);
var COLOR_HIGHLIGHT_GREEN = new Color8(6750054);
var COLOR_HIGHLIGHT_RED = new Color8(2273279);
var COLOR_BUFFED_TEXT = new Color8(6750054);
var COLOR_NERFED_TEXT = new Color8(16711680);
var COLOR_DYNAMIC_COST_TEXT = new Color8(16050242);

// src/mapCache/PointLightRenderer.ts
var LightController = class {
  constructor(x, y, z, size, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.color = color;
  }
};
var PointLightRenderer = class {
  constructor(_mapCacheRenderer, width, height, maxPointLights, pixelsPerTile = 32) {
    this._mapCacheRenderer = _mapCacheRenderer;
    const pixelsWidth = width * pixelsPerTile;
    const pixelsHeight = height * pixelsPerTile;
    const renderTarget = new WebGLRenderTarget5(pixelsWidth, pixelsHeight, {
      minFilter: NearestFilter6,
      magFilter: NearestFilter6,
      encoding: LinearEncoding5,
      wrapS: RepeatWrapping4,
      wrapT: RepeatWrapping4,
      generateMipmaps: false
    });
    const lightPointsGeo = new BufferGeometry10();
    const xyzSizeArr = new Float32Array(maxPointLights * 4);
    const xyzSizeAttr = new Float32BufferAttribute3(xyzSizeArr, 4);
    lightPointsGeo.setAttribute("xyzSize", xyzSizeAttr);
    const colorArr = new Float32Array(maxPointLights * 3);
    const colorAttr = new Float32BufferAttribute3(colorArr, 3);
    lightPointsGeo.setAttribute("color", colorAttr);
    const indexArr = new Uint16Array(maxPointLights);
    for (let i = 0; i < maxPointLights; i++) {
      indexArr[i] = i;
    }
    lightPointsGeo.setIndex(new BufferAttribute4(indexArr, 1));
    const matParams = {
      viewWidth: pixelsWidth,
      viewHeight: pixelsHeight,
      pixelsPerTile,
      mapCacheColorsTexture: this._mapCacheRenderer.mapCache.get("customColor").texture,
      mapCacheNormalsTexture: this._mapCacheRenderer.mapCache.get("normals").texture,
      mapCacheRoughnessMetalnessHeightTexture: this._mapCacheRenderer.mapCache.get("customRoughnessMetalnessHeight").texture,
      mapCacheDepthTopDownTexture: this._mapCacheRenderer.mapCache.get("customTopDownHeight").texture
    };
    const pointsBottomMaterial = new PointLightPointMaterial(matParams);
    const pointLightPoints = new Points3(lightPointsGeo, pointsBottomMaterial);
    pointLightPoints.frustumCulled = false;
    const pointLightScene = new Scene6();
    pointLightScene.add(pointLightPoints);
    const pointLightCamera = new OrthographicCamera5(-100, 100, 100, -100, 100, -100);
    pointLightScene.add(pointLightCamera);
    this._renderTarget = renderTarget;
    this.pointLightScene = pointLightScene;
    this.pointLightCamera = pointLightCamera;
    this._lightPointsGeo = lightPointsGeo;
    this._viewWidth = width;
    this._viewHeight = height;
    this._pixelsPerTile = pixelsPerTile;
  }
  _lights = [];
  _lightPointsGeo;
  _viewWidth;
  _viewHeight;
  _pixelsPerTile;
  makeLight(x, y, z, size, color) {
    const light = new LightController(x, y, z, size, color);
    this._lights.push(light);
    return light;
  }
  _renderTarget;
  get texture() {
    return this._renderTarget.texture;
  }
  pointLightScene;
  pointLightCamera;
  offsetX = 0;
  offsetY = 0;
  render(renderer) {
    if (this._lights.length > 0) {
      const ppt = this._pixelsPerTile;
      const lightPointsGeo = this._lightPointsGeo;
      const xyzSizeAttr = lightPointsGeo.getAttribute("xyzSize");
      const xyzSizeArr = xyzSizeAttr.array;
      const colorAttr = lightPointsGeo.getAttribute("color");
      const colorArr = colorAttr.array;
      lightPointsGeo.drawRange.count = 0;
      let j = 0;
      for (let i = 0; i < this._lights.length; i++) {
        const sprite = this._lights[i];
        const x = sprite.x - this.offsetX;
        const y = sprite.y - this.offsetY;
        if (x < 0 || x > this._viewWidth || y < 0 || y > this._viewHeight) {
          continue;
        }
        const xSnap = Math.round(wrap(x, 0, this._viewWidth) * ppt) / ppt;
        const ySnap = Math.round(wrap(y, 0, this._viewHeight) * ppt) / ppt;
        const j3 = j * 3;
        const j4 = j * 4;
        xyzSizeArr[j4] = xSnap;
        xyzSizeArr[j4 + 1] = ySnap;
        xyzSizeArr[j4 + 2] = sprite.z;
        xyzSizeArr[j4 + 3] = sprite.size;
        const c = sprite.color;
        colorArr[j3] = c.r;
        colorArr[j3 + 1] = c.g;
        colorArr[j3 + 2] = c.b;
        j++;
      }
      lightPointsGeo.drawRange.count = j;
      if (j === 0) {
        return false;
      }
      xyzSizeAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      renderer.setRenderTarget(this._renderTarget);
      renderer.setClearColor(COLOR_BLACK, 1);
      renderer.clear(true, true, false);
      renderer.render(this.pointLightScene, this.pointLightCamera);
      renderer.setRenderTarget(null);
      return true;
    } else {
      return false;
    }
  }
};

// test/utils/geometry.ts
import {
  PlaneGeometry,
  SphereBufferGeometry as SphereBufferGeometry2,
  Vector3 as Vector313
} from "three";

// test/utils/math.ts
import { Plane as Plane2, Ray as Ray2, Vector3 as Vector312 } from "three";
var TWO_PI2 = 2 * Math.PI;
var RADIANS_TO_DEGREES2 = 180 / Math.PI;
var DEGREES_TO_RADIANS2 = Math.PI / 180;
var ray2 = new Ray2();
var flatPlane2 = new Plane2(new Vector312(0, -1, 0), 1);
var anyPlane2 = new Plane2(new Vector312(0, -1, 0), 1);
var intersection2 = new Vector312();
var tau2 = Math.PI * 2;
var tauAndHalf2 = Math.PI * 3;
var phi2 = (Math.sqrt(5) + 1) * 0.5 - 1;
var ga2 = phi2 * Math.PI * 2;

// test/utils/geometry.ts
var __sharedRectangleGeometry;
function getSharedRectangleGeometry() {
  if (!__sharedRectangleGeometry) {
    __sharedRectangleGeometry = new PlaneGeometry(2, 2);
  }
  return __sharedRectangleGeometry;
}

// src/helpers/utils/MapScrollingView.ts
var MapScrollingView = class {
  tileMaker;
  spriteMaker;
  jitTileSampler;
  jitSpriteSampler;
  mapCacheRenderer;
  mapWithSpritesCacheRenderer;
  pointLightRenderer;
  _dirty = true;
  mapCachePassViews;
  _noiseMaker;
  mapCacheFinalView;
  _noiseReady;
  areLightsVisible;
  _mapScrollingViewMaterial;
  get offsetX() {
    return this.jitTileSampler.offsetX;
  }
  set offsetX(value) {
    this.jitTileSampler.offsetX = value;
    this.jitSpriteSampler.offsetX = value;
    this.mapWithSpritesCacheRenderer.offsetX = value;
  }
  get offsetY() {
    return this.jitTileSampler.offsetY;
  }
  set offsetY(value) {
    this.jitTileSampler.offsetY = value;
    this.jitSpriteSampler.offsetY = value;
    this.mapWithSpritesCacheRenderer.offsetY = value;
  }
  constructor(viewWidth = 16, viewHeight = 16, pixelsPerTile = 32, pixelsPerCacheEdge = 2048, mapViewUvST, mapViewSubTilePixelOffsetUvST, clipspaceMode = true, passes) {
    const tileMaker = new MapTileMaker(pixelsPerTile, pixelsPerCacheEdge, passes);
    const spriteMaker = new SpriteMaker(pixelsPerTile, pixelsPerCacheEdge, passes);
    const jitTileSampler = new JITTileSampler(tileMaker, viewWidth, viewHeight);
    const jitSpriteSampler = new JITTileSampler2(spriteMaker, pixelsPerTile, viewWidth, viewHeight);
    const mapCacheRenderer = new MapCacheRenderer(viewWidth, viewHeight, jitTileSampler, pixelsPerTile, pixelsPerCacheEdge);
    const mapWithSpritesCacheRenderer = new MapWithSpritesCacheRenderer(mapCacheRenderer, viewWidth, viewHeight, 1024, jitSpriteSampler, pixelsPerTile, pixelsPerCacheEdge);
    const pointLightRenderer = new PointLightRenderer(mapWithSpritesCacheRenderer, viewWidth, viewHeight, 1024, pixelsPerTile);
    const mapCachePassViews = [];
    for (const pass of tileMaker.passes) {
      const mapScrollingViewMaterial2 = new BasicTextureMaterial({
        texture: mapCacheRenderer.mapCache.get(pass).texture,
        uvST: mapViewUvST,
        clipspaceMode
      });
      const mapCacheView = new Mesh15(getSharedRectangleGeometry(), mapScrollingViewMaterial2);
      mapCachePassViews.push(mapCacheView);
    }
    this._noiseMaker = new NoiseTextureMaker();
    const mapScrollingViewMaterial = new FauxelMaterial({
      textureColor: mapWithSpritesCacheRenderer.mapCache.get("customColor").texture,
      textureNormals: mapWithSpritesCacheRenderer.mapCache.get("normals").texture,
      textureEmissive: mapWithSpritesCacheRenderer.mapCache.get("customEmissive").texture,
      textureRoughnessMetalnessHeight: mapWithSpritesCacheRenderer.mapCache.get("customRoughnessMetalnessHeight").texture,
      textureTopDownHeight: mapWithSpritesCacheRenderer.mapCache.get("customTopDownHeight").texture,
      texturePointLights: pointLightRenderer.texture,
      uvSTWorldOffset: mapViewUvST,
      uvST: mapViewSubTilePixelOffsetUvST,
      clipspaceMode,
      relativeTileSize: 1 / viewWidth,
      relativePixelSize: 1 / viewWidth / pixelsPerTile,
      pixelsPerTile,
      textureFog: this._noiseMaker.texture
    });
    const mapCacheFinalView = new Mesh15(getSharedRectangleGeometry(), mapScrollingViewMaterial);
    this.spriteMaker = spriteMaker;
    this.tileMaker = tileMaker;
    this.jitTileSampler = jitTileSampler;
    this.jitSpriteSampler = jitSpriteSampler;
    this.mapCacheRenderer = mapCacheRenderer;
    this.mapWithSpritesCacheRenderer = mapWithSpritesCacheRenderer;
    this.pointLightRenderer = pointLightRenderer;
    this.mapCachePassViews = mapCachePassViews;
    this.mapCacheFinalView = mapCacheFinalView;
    this._mapScrollingViewMaterial = mapScrollingViewMaterial;
  }
  render(renderer, dt) {
    this._mapScrollingViewMaterial.setSunAngle(0.1 + performance.now() * sunSpeed + sunOffset * Math.PI * 2);
    if (!this._noiseReady) {
      this._noiseMaker.render(renderer);
      this._noiseReady = true;
    }
    if (this.jitTileSampler.updateMeta() || this._dirty || this.jitTileSampler.offsetsDirty) {
      this._dirty = false;
      this.jitTileSampler.updateVis(this.mapCacheRenderer.tileBottomPointsGeo, this.mapCacheRenderer.tileTopPointsGeo);
      this.tileMaker.render(renderer);
      this.mapCacheRenderer.render(renderer);
      this.mapCacheRenderer.tileBottomPointsGeo.drawRange.count = 0;
      this.mapCacheRenderer.tileTopPointsGeo.drawRange.count = 0;
    }
    this.jitSpriteSampler.updateVis(this.mapWithSpritesCacheRenderer.spriteBottomPointsGeo, this.mapWithSpritesCacheRenderer.spriteTopPointsGeo);
    this.spriteMaker.render(renderer);
    this.mapWithSpritesCacheRenderer.render(renderer);
    this.areLightsVisible = this.pointLightRenderer.render(renderer);
  }
};

// src/rendering/TextureCachingScroller.ts
import {
  NearestFilter as NearestFilter7,
  RepeatWrapping as RepeatWrapping5,
  Vector2 as Vector25,
  Vector4 as Vector413,
  WebGLRenderTarget as WebGLRenderTarget6
} from "three";
var TextureCachingScroller = class {
  constructor(_externalRender) {
    this._externalRender = _externalRender;
    const uvST = new Vector413(1, 1, 0, 0);
    this.uvST = uvST;
    const cacheRenderTarget = new WebGLRenderTarget6(this.cacheResolution.x, this.cacheResolution.y, {
      magFilter: NearestFilter7,
      minFilter: NearestFilter7,
      wrapS: RepeatWrapping5,
      wrapT: RepeatWrapping5
    });
    this.cacheRenderTarget = cacheRenderTarget;
  }
  cacheRenderTarget;
  lastScrollOffset = new Vector25();
  scrollOffset = new Vector25(0, 0);
  cacheResolution = new Vector25(256, 256);
  cacheDirty = true;
  uvST;
  render(renderer, dt) {
    if (this.cacheDirty) {
      this._renderCache(renderer, false);
      renderer.setRenderTarget(null);
      this.cacheDirty = false;
    } else if (!this.scrollOffset.equals(this.lastScrollOffset)) {
      const rTarget = this.cacheRenderTarget;
      const scissor = rTarget.scissor;
      const viewport = rTarget.viewport;
      const res = this.cacheResolution;
      let xNew = Math.round(this.scrollOffset.x);
      let xOld = Math.round(this.lastScrollOffset.x);
      let yNew = Math.round(this.scrollOffset.y);
      let yOld = Math.round(this.lastScrollOffset.y);
      let xDelta = xNew - xOld;
      let yDelta = yNew - yOld;
      const xDir = xNew > xOld ? 1 : -1;
      if (xDelta !== 0) {
        this.uvST.z = xNew / res.x;
        if (xNew < xOld) {
          const xTemp = xNew;
          xNew = xOld;
          xOld = xTemp;
          xDelta *= -1;
        }
      }
      xNew = wrap(xNew, 0, res.x);
      xOld = wrap(xOld, 0, res.x);
      const yDir = yNew > yOld ? 1 : -1;
      if (yDelta !== 0) {
        this.uvST.w = yNew / res.y;
        if (yNew < yOld) {
          const yTemp = yNew;
          yNew = yOld;
          yOld = yTemp;
          yDelta *= -1;
        }
      }
      yNew = wrap(yNew, 0, res.y);
      yOld = wrap(yOld, 0, res.y);
      if (xDelta !== 0) {
        const y = yDir === 1 ? yNew : yOld;
        scissor.set(xOld, y, xDelta, res.y);
        viewport.set(xDir === 1 ? -res.x + xNew : xOld, y, res.x, res.y);
        if (xNew > xOld) {
          this._renderCache(renderer, void 0);
          viewport.y = y - res.y;
          scissor.y = y - res.y;
          this._renderCache(renderer, void 0);
        } else {
          const leapA = xDir === 1 ? res.x : 0;
          const leapB = xDir === 1 ? res.x : -res.x;
          scissor.x -= leapA;
          this._renderCache(renderer);
          viewport.y = y - res.y;
          scissor.y = y - res.y;
          this._renderCache(renderer);
          scissor.x += leapB;
          viewport.x += leapB;
          viewport.y = y;
          scissor.y = y;
          this._renderCache(renderer);
          viewport.y = y - res.y;
          scissor.y = y - res.y;
          this._renderCache(renderer);
        }
      }
      if (yDelta !== 0) {
        scissor.set(0, yOld, res.x, yDelta);
        const x = xDir === 1 ? xNew : xOld;
        viewport.set(x, yDir === 1 ? -res.y + yNew : yOld, res.x, res.y);
        if (yNew > yOld) {
          this._renderCache(renderer);
          viewport.x = x - res.x;
          scissor.x = x - res.x;
          this._renderCache(renderer);
        } else {
          const leapA = yDir === 1 ? res.y : 0;
          const leapB = yDir === 1 ? res.y : -res.y;
          scissor.y -= leapA;
          this._renderCache(renderer);
          viewport.x = x - res.x;
          scissor.x = x - res.x;
          this._renderCache(renderer);
          scissor.y += leapB;
          viewport.y += leapB;
          viewport.x = x;
          scissor.x = x;
          this._renderCache(renderer);
          viewport.x = x - res.x;
          scissor.x = x - res.x;
          this._renderCache(renderer);
        }
      }
      renderer.setRenderTarget(null);
      this.lastScrollOffset.copy(this.scrollOffset);
    }
  }
  _renderCache(renderer, scissorTest = true, clearOnly = false) {
    this.cacheRenderTarget.scissorTest = scissorTest;
    renderer.setRenderTarget(this.cacheRenderTarget);
    renderer.clear(true, true);
    if (!clearOnly) {
      this._externalRender(renderer);
    }
  }
};

// src/materials/BasicFullScreenMaterial/index.ts
import { RawShaderMaterial as RawShaderMaterial9, Uniform as Uniform10, Vector2 as Vector27, Vector3 as Vector314 } from "three";

// src/uniforms.ts
import { Uniform as Uniform9, Vector2 as Vector26 } from "three";
var timeUniform = new Uniform9(0);
var devicePixelRatioUniform = new Uniform9(device_default.pixelRatio);
var pixelSizeInClipSpaceUniform = new Uniform9(new Vector26(2 / device_default.width, 2 / device_default.height));
var pixelAspectRatioUniform = new Uniform9(device_default.width / device_default.height);
device_default.onChange(() => {
  pixelAspectRatioUniform.value = device_default.width / device_default.height;
});

// src/materials/BasicFullScreenMaterial/frag.glsl
var frag_default9 = "precision lowp float;\n\nuniform sampler2D uTileTex;\nuniform sampler2D uMapTex;\nuniform vec2 uMapSize;\n\nvarying vec2 vUv;\n\nvoid main() {\n  #ifdef USE_TWO_LAYERS\n  vec4 sampleMapTop = texture2D(uMapTex, vUv);\n  vec2 uvTileTop = floor(sampleMapTop.zw * RESOLUTION) / RESOLUTION + fract(vUv * uMapSize) / RESOLUTION;\n  vec4 sampleTileTop = texture2D(uTileTex, uvTileTop);\n  gl_FragColor = sampleTileTop;\n  if(sampleTileTop.a<0.5) {\n  #endif\n    vec4 sampleMapBottom = texture2D(uMapTex, vUv+vec2(0.0, 1.0/uMapSize.y));\n    vec2 uvTileBottom = floor(sampleMapBottom.xy * RESOLUTION) / RESOLUTION + fract(vUv * uMapSize) / RESOLUTION;\n    vec4 sampleTileBottom = texture2D(uTileTex, uvTileBottom);\n    gl_FragColor = sampleTileBottom;\n  #ifdef USE_TWO_LAYERS\n  }\n  #endif\n}\n";

// src/materials/BasicFullScreenMaterial/vert.glsl
var vert_default9 = "precision lowp float;\n\nattribute vec3 position;\nuniform float uAspectRatio;\nuniform vec3 uTransform;\nvarying vec2 vUv;\n\nvoid main() {\n    gl_Position = vec4(position, 1.0);\n    vUv = (position.xy - uTransform.xy) * vec2(uAspectRatio, 1.0) * uTransform.z;\n}";

// src/materials/BasicFullScreenMaterial/index.ts
var __defaultParams9 = {
  mapTex: getTempTexture(),
  tileTex: getTempTexture(),
  transform: new Vector314(0, 0, 1 / 2048),
  tilesPerEdge: 8,
  useTwoLayers: false
};
var BasicFullScreenMaterial = class extends RawShaderMaterial9 {
  constructor(options) {
    const params = buildParameters(__defaultParams9, options);
    const defines = {
      RESOLUTION: params.tilesPerEdge.toFixed(1)
    };
    if (params.useTwoLayers) {
      defines.USE_TWO_LAYERS = true;
    }
    super({
      uniforms: {
        uMapTex: new Uniform10(params.mapTex),
        uMapSize: new Uniform10(new Vector27(params.mapTex.image.width, params.mapTex.image.height)),
        uTileTex: new Uniform10(params.tileTex),
        uTransform: new Uniform10(params.transform),
        uAspectRatio: pixelAspectRatioUniform
      },
      defines,
      vertexShader: vert_default9,
      fragmentShader: frag_default9,
      depthWrite: false,
      depthTest: false
    });
  }
};

// src/index.ts
var src_default = {
  MapTileMaker,
  JITTileSampler,
  MapScrollingView,
  TextureCachingScroller,
  geometry: {
    FibonacciSphereGeometry
  },
  LightController,
  SpriteController,
  getMeshMaterial,
  materials: {
    BasicFullScreenMaterial,
    SimplexNoiseMaterial,
    BasicTextureMaterial
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
