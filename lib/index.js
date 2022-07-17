// src/Atoms.ts
import {
  BufferAttribute,
  BufferGeometry as BufferGeometry6,
  NearestFilter as NearestFilter2,
  Points as Points4,
  ShaderMaterial as ShaderMaterial5,
  Sphere,
  TextureLoader,
  Uniform as Uniform8
} from "three";

// src/point.frag.glsl
var point_frag_default = "uniform sampler2D uParticleTexture;varying vec3 vColor;void main(){vec4 texel=texture2D(uParticleTexture,gl_PointCoord);if(texel.a<0.5){discard;}gl_FragColor=texel;}";

// src/point.vert.glsl
var point_vert_default = "uniform sampler2D uMap;varying vec3 vColor;void main(){vec4 pos=texture2D(uMap,position.xy);vec4 mvPosition=modelViewMatrix*vec4(pos.xzy,1.0);gl_Position=projectionMatrix*mvPosition;vColor=position.xyz;gl_PointSize=32.0/-mvPosition.z;}";

// src/motion.frag.glsl
var motion_frag_default = "uniform sampler2D uVelocitiesTexture;uniform sampler2D uPositionsTexture;varying vec2 vUv;void main(){vec3 pos=texture2D(uPositionsTexture,vUv).xyz;vec3 vel=texture2D(uVelocitiesTexture,vUv).xyz;vec3 newPos=pos+vel;newPos=clamp(mod(newPos+1.0,2.0)-1.0,-1.0,1.0);gl_FragColor=vec4(newPos,1.0);}";

// src/fullclip.vert.glsl
var fullclip_vert_default = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.x,position.y,0.0,1.0);}";

// src/NoiseKit.ts
import { Uniform as Uniform2 } from "three";

// src/noise.frag.glsl
var noise_frag_default = "varying vec2 vUv;varying vec3 vColor;uniform float uPhase;uniform float uOpacity;\n#define NOISE fbm\n#define NUM_NOISE_OCTAVES 5\nfloat hash(float p){p=fract(p*0.011);p*=p+7.5;p*=p+p;return fract(p);}float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.13);p3+=dot(p3,p3.yzx+3.333);return fract((p3.x+p3.y)*p3.z);}float noise(float x){float i=floor(x);float f=fract(x);float u=f*f*(3.0-2.0*f);return mix(hash(i),hash(i+1.0),u);}float noise(vec2 x){vec2 i=floor(x);vec2 f=fract(x);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}float noise(vec3 x){const vec3 step=vec3(110,241,171);vec3 i=floor(x);vec3 f=fract(x);float n=dot(i,step);vec3 u=f*f*(3.0-2.0*f);return mix(mix(mix(hash(n+dot(step,vec3(0,0,0))),hash(n+dot(step,vec3(1,0,0))),u.x),mix(hash(n+dot(step,vec3(0,1,0))),hash(n+dot(step,vec3(1,1,0))),u.x),u.y),mix(mix(hash(n+dot(step,vec3(0,0,1))),hash(n+dot(step,vec3(1,0,1))),u.x),mix(hash(n+dot(step,vec3(0,1,1))),hash(n+dot(step,vec3(1,1,1))),u.x),u.y),u.z);}float fbm(float x){float v=0.0;float a=0.5;float shift=float(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}float fbm(vec2 x){float v=0.0;float a=0.5;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.5;}return v;}float fbm(vec3 x){float v=0.0;float a=0.5;vec3 shift=vec3(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}void main(){vec3 uv=vec3(vUv.x,vUv.y,uPhase);float vx=NOISE(uv*33.0);float vy=NOISE(uv*33.0+19.0);float vz=NOISE(uv*33.0+125.0);vec3 rawPos=vec3(vx,vy,vz)*2.15-1.0;vec3 pos=normalize(rawPos);gl_FragColor=vec4(mix(pos,rawPos,0.1)*uOpacity,1.0);}";

// src/RTKit.ts
import {
  AdditiveBlending,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  Uniform
} from "three";

// src/map.frag.glsl
var map_frag_default = "uniform sampler2D uMap;varying vec2 vUv;void main(){gl_FragColor=texture2D(uMap,vUv);gl_FragColor.rgb=gl_FragColor.rgb*0.5+0.5;}";

// src/renderTargetUtils.ts
import {
  FloatType,
  LinearEncoding,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget
} from "three";
function getBasicRenderTarget(edgeSize, depth = false) {
  return new WebGLRenderTarget(edgeSize, edgeSize, {
    format: RGBAFormat,
    type: FloatType,
    magFilter: NearestFilter,
    minFilter: NearestFilter,
    depthBuffer: depth,
    encoding: LinearEncoding
  });
}

// test/utils/geometry.ts
import {
  PlaneGeometry,
  SphereBufferGeometry,
  Vector3 as Vector32
} from "three";

// test/utils/math.ts
import { Plane, Ray, Vector3 } from "three";
var TWO_PI = 2 * Math.PI;
var RADIANS_TO_DEGREES = 180 / Math.PI;
var DEGREES_TO_RADIANS = Math.PI / 180;
var ray = new Ray();
var flatPlane = new Plane(new Vector3(0, -1, 0), 1);
var anyPlane = new Plane(new Vector3(0, -1, 0), 1);
var intersection = new Vector3();
var tau = Math.PI * 2;
var tauAndHalf = Math.PI * 3;
var phi = (Math.sqrt(5) + 1) * 0.5 - 1;
var ga = phi * Math.PI * 2;

// test/utils/geometry.ts
var __sharedRectangleGeometry;
function getSharedRectangleGeometry() {
  if (!__sharedRectangleGeometry) {
    __sharedRectangleGeometry = new PlaneGeometry(2, 2);
  }
  return __sharedRectangleGeometry;
}

// src/RTKit.ts
var RTKit = class {
  constructor(edgeSize, vertexShader, fragmentShader, _uniforms, depth = false) {
    this.edgeSize = edgeSize;
    this._uniforms = _uniforms;
    const rt = getBasicRenderTarget(edgeSize, depth);
    this.outputTextureUniform = new Uniform(rt.texture);
    const scene = new Scene();
    const plane = new Mesh(getSharedRectangleGeometry(), new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this._uniforms,
      depthTest: false,
      depthWrite: false
    }));
    scene.add(plane);
    const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
    scene.add(camera);
    this.plane = plane;
    this.scene = scene;
    this.camera = camera;
    this.rt = rt;
    this.outputRt = rt;
  }
  outputTextureUniform;
  plane;
  rt;
  outputRt;
  getTestPlane() {
    return new Mesh(getSharedRectangleGeometry(), new ShaderMaterial({
      vertexShader: fullclip_vert_default,
      fragmentShader: map_frag_default,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: { uMap: this.outputTextureUniform }
    }));
  }
  scene;
  camera;
};

// src/NoiseKit.ts
var NoiseKit = class extends RTKit {
  dirty = true;
  _phaseUniform;
  constructor(edgeSize, initialOpacity = 1) {
    const phaseUniform = new Uniform2(0);
    const opacityUniform = new Uniform2(initialOpacity);
    const uniforms = { uPhase: phaseUniform, uOpacity: opacityUniform };
    super(edgeSize, fullclip_vert_default, noise_frag_default, uniforms);
    this._phaseUniform = phaseUniform;
  }
  get phase() {
    return this._phaseUniform.value;
  }
  set phase(value) {
    this._phaseUniform.value = value;
    this.dirty = true;
  }
  render(renderer, dt) {
    this.phase += dt * 0.1;
    if (this.dirty) {
      this.dirty = false;
      renderer.setRenderTarget(this.rt);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(null);
    }
  }
};

// src/RTDoubleBufferKit.ts
import { Uniform as Uniform3 } from "three";
var RTDoubleBufferKit = class extends RTKit {
  inputTextureUniform;
  rt2;
  constructor(rtKit, vertexShader, fragmentShader, uniforms) {
    super(rtKit.edgeSize, vertexShader, fragmentShader, uniforms);
    this.inputTextureUniform = new Uniform3(rtKit.outputTextureUniform.value);
    this.rt2 = rtKit.rt;
  }
  linkInput(name, uniform) {
    this.plane.material.uniforms[name] = uniform;
  }
  swap() {
    this.outputRt = this.outputRt === this.rt ? this.rt2 : this.rt;
    this.inputTextureUniform.value = (this.outputRt === this.rt ? this.rt2 : this.rt).texture;
    this.outputTextureUniform.value = this.outputRt.texture;
  }
};

// src/MotionKit.ts
var MotionKit = class extends RTDoubleBufferKit {
  _initPositionsNoiseKit;
  initd = false;
  constructor(edgeSize) {
    const initPositionNoiseKit = new NoiseKit(edgeSize);
    super(initPositionNoiseKit, fullclip_vert_default, motion_frag_default, {});
    this.linkInput("uPositionsTexture", this.inputTextureUniform);
    this._initPositionsNoiseKit = initPositionNoiseKit;
  }
  render(renderer, dt) {
    if (!this.initd) {
      this.initd = true;
      this.swap();
      this._initPositionsNoiseKit.render(renderer, dt);
    }
    this.swap();
    renderer.setRenderTarget(this.outputRt);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
};

// src/VelocityFieldKit.ts
import {
  AdditiveBlending as AdditiveBlending2,
  Points,
  ShaderMaterial as ShaderMaterial2
} from "three";

// src/velocityField.frag.glsl
var velocityField_frag_default = "uniform sampler2D uVelocitiesTexture;varying vec2 vUv;void main(){vec3 vel=texture2D(uVelocitiesTexture,vUv).xyz;gl_FragColor=vec4(vel,0.125);}";

// src/velocityField.vert.glsl
var velocityField_vert_default = "uniform sampler2D uPositionsTexture;varying vec2 vUv;void main(){vec3 pos=texture2D(uPositionsTexture,position.xy).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*16.0);float zy=floor(z/4.0);float zx=fract(z/4.0)*4.0;vec2 uv=(uvw.xy+vec2(zx,zy))/4.0;vUv=position.xy;gl_Position=vec4(uv*2.0-1.0,0.0,1.0);gl_PointSize=1.0;}";

// src/fade.frag.glsl
var fade_frag_default = "uniform sampler2D uFieldVelocitiesTexture;varying vec2 vUv;const float xyStep=4.0/64.0;const float zStep=4.0/32.0;vec2 offset(vec3 pos,vec3 offset){pos+=offset;pos=mod(pos+1.0,2.0)-1.0;vec3 uvw2=pos*0.5+0.5;float z2=floor(uvw2.z*16.0);float zy2=floor(z2/4.0);float zx2=fract(z2/4.0)*4.0;vec2 uv=(uvw2.xy+vec2(zx2,zy2))/4.0;return uv;}void main(){vec2 xy=fract(vUv*4.0);vec2 zv=vUv-xy/4.0;float z=(zv.y*4.0+zv.x)/4.0;vec3 uvw=vec3(xy,z);vec3 pos=uvw*2.0-1.0;vec2 uv1=offset(pos,vec3(xyStep,0.0,0.0));vec2 uv2=offset(pos,vec3(-xyStep,0.0,0.0));vec2 uv3=offset(pos,vec3(0.0,xyStep,0.0));vec2 uv4=offset(pos,vec3(0.0,-xyStep,0.0));vec2 uv5=offset(pos,vec3(0.0,0.0,zStep));vec2 uv6=offset(pos,vec3(0.0,0.0,-zStep));vec3 texel=texture2D(uFieldVelocitiesTexture,vUv).xyz*14.0;texel+=texture2D(uFieldVelocitiesTexture,uv1).xyz;texel+=texture2D(uFieldVelocitiesTexture,uv2).xyz;texel+=texture2D(uFieldVelocitiesTexture,uv3).xyz;texel+=texture2D(uFieldVelocitiesTexture,uv4).xyz;texel+=texture2D(uFieldVelocitiesTexture,uv5).xyz;texel+=texture2D(uFieldVelocitiesTexture,uv6).xyz;vec3 vel=vec3(texel*0.045);float speed=max(0.0,length(vel));vec3 dir=normalize(vel);float newSpeed=min(0.1,speed);vel=dir*newSpeed;gl_FragColor=vec4(vel,1.0);}";

// src/VelocityFieldKit.ts
var VelocityFieldKit = class extends RTDoubleBufferKit {
  _initVelocitiesNoiseKit;
  initd = false;
  constructor(edgeSize3d, pointGeo, positionsTextureUniform, velocitiesTextureUniform) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3));
    const initPositionNoiseKit = new NoiseKit(edgeSize2d);
    super(initPositionNoiseKit, fullclip_vert_default, fade_frag_default, {});
    this.linkInput("uFieldVelocitiesTexture", this.inputTextureUniform);
    this._initVelocitiesNoiseKit = initPositionNoiseKit;
    const points = new Points(pointGeo, new ShaderMaterial2({
      vertexShader: velocityField_vert_default,
      fragmentShader: velocityField_frag_default,
      uniforms: {
        uPositionsTexture: positionsTextureUniform,
        uVelocitiesTexture: velocitiesTextureUniform
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending2
    }));
    this.scene.add(points);
    this.plane.renderOrder = -2;
  }
  render(renderer, dt) {
    if (!this.initd) {
      this.initd = true;
      this.swap();
      this._initVelocitiesNoiseKit.render(renderer, dt);
    }
    this.swap();
    renderer.setRenderTarget(this.outputRt);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
};

// src/OccupationFieldKit.ts
import {
  Color,
  Points as Points2,
  ShaderMaterial as ShaderMaterial3
} from "three";

// src/occupationField.frag.glsl
var occupationField_frag_default = "varying vec2 vId;void main(){gl_FragColor=vec4(vId,1.0,1.0);}";

// src/occupationField.vert.glsl
var occupationField_vert_default = "uniform sampler2D uPositionsTexture;uniform float uTimeFract;varying vec2 vId;void main(){vId=position.xy;vec3 pos=texture2D(uPositionsTexture,vId).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*16.0);float zy=floor(z/4.0);float zx=fract(z/4.0)*4.0;vec2 uv=(uvw.xy+vec2(zx,zy))/4.0;gl_Position=vec4(uv*2.0-1.0,fract(uTimeFract+(vId.x*25.12+vId.y*165.3)),1.0);gl_PointSize=1.0;}";

// test/uniforms.ts
import { Uniform as Uniform5, Vector2 } from "three";

// test/device.ts
var Device = class {
  width = 1920;
  height = 1080;
  aspect = 1920 / 1080;
  deviceWidth = 1920;
  deviceHeight = 1080;
  deviceAspect = 1920 / 1080;
  orientation = "landscape";
  pixelRatio = 1;
  targetFPS = 60;
  useTouch = false;
  type = "desktop";
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

// test/uniforms.ts
var timeUniform = new Uniform5(0);
var timeFractUniform = new Uniform5(0);
var devicePixelRatioUniform = new Uniform5(device_default.pixelRatio);
var pixelSizeInClipSpaceUniform = new Uniform5(new Vector2(2 / device_default.width, 2 / device_default.height));
var pixelAspectRatioUniform = new Uniform5(device_default.width / device_default.height);
device_default.onChange(() => {
  pixelAspectRatioUniform.value = device_default.width / device_default.height;
});

// src/OccupationFieldKit.ts
var COLOR_BLACK = new Color(0, 0, 0);
var OccupationFieldKit = class extends RTKit {
  constructor(edgeSize3d, pointGeo, positionsTextureUniform) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3));
    super(edgeSize2d, fullclip_vert_default, fade_frag_default, {}, true);
    const points = new Points2(pointGeo, new ShaderMaterial3({
      vertexShader: occupationField_vert_default,
      fragmentShader: occupationField_frag_default,
      uniforms: {
        uPositionsTexture: positionsTextureUniform,
        uTimeFract: timeFractUniform
      },
      depthTest: true,
      depthWrite: true
    }));
    this.scene.add(points);
    this.plane.material.visible = false;
    this.plane.renderOrder = -1;
  }
  render(renderer, dt) {
    renderer.setRenderTarget(this.outputRt);
    renderer.setClearColor(COLOR_BLACK, 1);
    renderer.clearColor();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
};

// test/utils/threeUtils.ts
import { DataTexture, RGBAFormat as RGBAFormat2, UnsignedByteType } from "three";
var __tempTexture;
function getTempTexture() {
  if (!__tempTexture) {
    const s = 4;
    const total = s * s * 4;
    const data = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      data[i] = 0;
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat2, UnsignedByteType);
  }
  return __tempTexture;
}

// src/DensityFieldKit.ts
import {
  AdditiveBlending as AdditiveBlending4,
  Color as Color2,
  Points as Points3,
  ShaderMaterial as ShaderMaterial4
} from "three";

// src/densityField.frag.glsl
var densityField_frag_default = "void main(){gl_FragColor=vec4(1.0,1.0,1.0,0.1);}";

// src/densityField.vert.glsl
var densityField_vert_default = "uniform sampler2D uPositionsTexture;void main(){vec3 pos=texture2D(uPositionsTexture,position.xy).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*16.0);float zy=floor(z/4.0);float zx=fract(z/4.0)*4.0;vec2 uv=(uvw.xy+vec2(zx,zy))/4.0;gl_Position=vec4(uv*2.0-1.0,0.0,1.0);gl_PointSize=1.0;}";

// src/DensityFieldKit.ts
var COLOR_BLACK2 = new Color2(0, 0, 0);
var DensityFieldKit = class extends RTKit {
  constructor(edgeSize3d, pointGeo, positionsTextureUniform) {
    const edgeSize2d = Math.sqrt(Math.pow(edgeSize3d, 3));
    super(edgeSize2d, fullclip_vert_default, fade_frag_default, {});
    const points = new Points3(pointGeo, new ShaderMaterial4({
      vertexShader: densityField_vert_default,
      fragmentShader: densityField_frag_default,
      uniforms: {
        uPositionsTexture: positionsTextureUniform
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending4
    }));
    this.scene.add(points);
    this.plane.material.visible = false;
    this.plane.renderOrder = -1;
  }
  render(renderer, dt) {
    renderer.setRenderTarget(this.outputRt);
    renderer.setClearColor(COLOR_BLACK2, 1);
    renderer.clearColor();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
};

// src/velocity.frag.glsl
var velocity_frag_default = "uniform sampler2D uPositionsTexture;uniform sampler2D uVelocitiesTexture;uniform sampler2D uFieldVelocitiesTexture;uniform sampler2D uOccupationTexture;uniform sampler2D uDensityTexture;varying vec2 vUv;void main(){vec3 pos=texture2D(uPositionsTexture,vUv).xyz;vec3 vel=texture2D(uVelocitiesTexture,vUv).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*16.0);float zy=floor(z/4.0);float zx=fract(z/4.0)*4.0;vec2 uv=(uvw.xy+vec2(zx,zy))/4.0;vec3 fieldVel=texture2D(uFieldVelocitiesTexture,uv).xyz;fieldVel+=vec3(0.0,0.0,-0.025);vec2 occupyingId=texture2D(uOccupationTexture,uv).xy;if(occupyingId.x!=0.0&&occupyingId.y!=0.0&&abs(occupyingId.x-vUv.x)>0.005&&abs(occupyingId.y-vUv.y)>0.005){vec3 pos2=texture2D(uPositionsTexture,occupyingId).xyz;vec3 vel2=texture2D(uVelocitiesTexture,occupyingId).xyz;fieldVel+=normalize(pos-pos2)/32.0;float density=texture2D(uPositionsTexture,uv).x-0.1;vec3 rand=normalize(fract(abs(pos)*245.67)-0.5);fieldVel+=rand*density*0.25;float speed=length(fieldVel);vec3 dir=normalize(fieldVel);float newSpeed=min(0.1,speed);fieldVel=dir*newSpeed;vel+=(vel2-vel)*0.7;}else if(pos.z<-0.5){vel*=-0.9;vel.z+=0.005;}vec3 newVel=mix(vel,fieldVel,0.04);gl_FragColor=vec4(newVel,1.0);}";

// src/VelocityKit.ts
var VelocityKit = class extends RTDoubleBufferKit {
  _initVelocitiesNoiseKit;
  initd = false;
  constructor(edgeSize) {
    const initVelocityNoiseKit = new NoiseKit(edgeSize, 0.01);
    super(initVelocityNoiseKit, fullclip_vert_default, velocity_frag_default, {});
    this.linkInput("uVelocitiesTexture", this.inputTextureUniform);
    this._initVelocitiesNoiseKit = initVelocityNoiseKit;
  }
  render(renderer, dt) {
    if (!this.initd) {
      this.initd = true;
      this.swap();
      this._initVelocitiesNoiseKit.render(renderer, dt);
    }
    this.swap();
    renderer.setRenderTarget(this.outputRt);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
};

// src/Atoms.ts
var Atoms = class {
  visuals;
  motionKit;
  velocityFieldKit;
  occupationKit;
  densityKit;
  velocityKit;
  constructor(edgeSize = 128) {
    const geo = new BufferGeometry6();
    const total = edgeSize * edgeSize;
    const bufferArr = new Float32Array(total * 3);
    for (let iy = 0; iy < edgeSize; iy++) {
      for (let ix = 0; ix < edgeSize; ix++) {
        const i3 = (ix + iy * edgeSize) * 3;
        bufferArr[i3] = (ix + 0.5) / edgeSize;
        bufferArr[i3 + 1] = (iy + 0.5) / edgeSize;
        bufferArr[i3 + 2] = i3 * 1e-3 % 1;
      }
    }
    geo.setAttribute("position", new BufferAttribute(bufferArr, 3));
    geo.boundingSphere = new Sphere(void 0, 1);
    const motionKit = new MotionKit(edgeSize);
    const velocityKit = new VelocityKit(edgeSize);
    motionKit.linkInput("uVelocitiesTexture", velocityKit.outputTextureUniform);
    velocityKit.linkInput("uPositionsTexture", motionKit.outputTextureUniform);
    const velocityFieldKit = new VelocityFieldKit(16, geo, motionKit.outputTextureUniform, velocityKit.outputTextureUniform);
    velocityKit.linkInput("uFieldVelocitiesTexture", velocityFieldKit.outputTextureUniform);
    const densityKit = new DensityFieldKit(16, geo, motionKit.outputTextureUniform);
    velocityKit.linkInput("uDensityTexture", densityKit.outputTextureUniform);
    const occupationKit = new OccupationFieldKit(16, geo, motionKit.outputTextureUniform);
    velocityKit.linkInput("uOccupationTexture", occupationKit.outputTextureUniform);
    const pointsMat = new ShaderMaterial5({
      fragmentShader: point_frag_default,
      vertexShader: point_vert_default,
      uniforms: {
        uMap: motionKit.outputTextureUniform,
        uParticleTexture: new Uniform8(getTempTexture())
      },
      depthWrite: true,
      depthTest: true
    });
    const loader = new TextureLoader();
    loader.load("sphere-sprite2.png", (t) => {
      t.flipY = false;
      t.magFilter = NearestFilter2;
      t.minFilter = NearestFilter2;
      pointsMat.uniforms.uParticleTexture = new Uniform8(t);
    });
    const visuals = new Points4(geo, pointsMat);
    this.motionKit = motionKit;
    this.velocityKit = velocityKit;
    this.densityKit = densityKit;
    this.velocityFieldKit = velocityFieldKit;
    this.occupationKit = occupationKit;
    this.visuals = visuals;
  }
  update(renderer, dt) {
    this.motionKit.render(renderer, dt);
    this.velocityKit.render(renderer, dt);
    this.velocityFieldKit.render(renderer, dt);
    this.densityKit.render(renderer, dt);
    this.occupationKit.render(renderer, dt);
    this.visuals.rotation.y += dt * 0.2;
  }
};

// src/index.ts
var src_default = {
  Atoms
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
