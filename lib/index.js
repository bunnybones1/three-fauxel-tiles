// src/Atoms.ts
import {
  AdditiveBlending as AdditiveBlending2,
  BufferAttribute,
  BufferGeometry as BufferGeometry2,
  Points as Points2,
  ShaderMaterial as ShaderMaterial3,
  Sphere
} from "three";

// src/point.frag.glsl
var point_frag_default = "varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.0);}";

// src/point.vert.glsl
var point_vert_default = "uniform sampler2D uMap;varying vec3 vColor;void main(){vec4 pos=texture2D(uMap,position.xy);vec4 mvPosition=modelViewMatrix*vec4(pos.xyz,1.0);gl_Position=projectionMatrix*mvPosition;float density=1.0-clamp(0.0,1.0,abs(mvPosition.z+0.15)*2.0);vColor=position.xyz*density*density;gl_PointSize=min(32.0,2.0/density/-mvPosition.z);}";

// src/motion.frag.glsl
var motion_frag_default = "uniform sampler2D uVelocitiesTexture;uniform sampler2D uPositionsTexture;varying vec3 vColor;varying vec2 vUv;void main(){vec3 pos=texture2D(uPositionsTexture,vUv).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*64.0);float zy=floor(z/8.0);float zx=fract(z/8.0)*8.0;vec2 uv=(uvw.xy+vec2(zx,zy))/8.0;vec3 vel=texture2D(uVelocitiesTexture,uv).xyz;vec3 newPos=pos+vel*vec3(0.02);newPos=mod(newPos+1.0,2.0)-1.0;vec3 normalized=normalize(newPos);gl_FragColor=vec4(mix(newPos,normalized,0.0005),1.0);}";

// src/fullclip.vert.glsl
var fullclip_vert_default = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.x,position.y,0.0,1.0);}";

// src/NoiseKit.ts
import { Uniform as Uniform2 } from "three";

// src/noise.frag.glsl
var noise_frag_default = "varying vec2 vUv;varying vec3 vColor;uniform float uPhase;\n#define NOISE fbm\n#define NUM_NOISE_OCTAVES 5\nfloat hash(float p){p=fract(p*0.011);p*=p+7.5;p*=p+p;return fract(p);}float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.13);p3+=dot(p3,p3.yzx+3.333);return fract((p3.x+p3.y)*p3.z);}float noise(float x){float i=floor(x);float f=fract(x);float u=f*f*(3.0-2.0*f);return mix(hash(i),hash(i+1.0),u);}float noise(vec2 x){vec2 i=floor(x);vec2 f=fract(x);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}float noise(vec3 x){const vec3 step=vec3(110,241,171);vec3 i=floor(x);vec3 f=fract(x);float n=dot(i,step);vec3 u=f*f*(3.0-2.0*f);return mix(mix(mix(hash(n+dot(step,vec3(0,0,0))),hash(n+dot(step,vec3(1,0,0))),u.x),mix(hash(n+dot(step,vec3(0,1,0))),hash(n+dot(step,vec3(1,1,0))),u.x),u.y),mix(mix(hash(n+dot(step,vec3(0,0,1))),hash(n+dot(step,vec3(1,0,1))),u.x),mix(hash(n+dot(step,vec3(0,1,1))),hash(n+dot(step,vec3(1,1,1))),u.x),u.y),u.z);}float fbm(float x){float v=0.0;float a=0.5;float shift=float(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}float fbm(vec2 x){float v=0.0;float a=0.5;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.5;}return v;}float fbm(vec3 x){float v=0.0;float a=0.5;vec3 shift=vec3(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}void main(){vec3 uv=vec3(vUv.x,vUv.y,uPhase);float vx=NOISE(uv*103.0);float vy=NOISE(uv*103.0+19.0);float vz=NOISE(uv*103.0+125.0);vec3 rawPos=vec3(vx,vy,vz)*2.15-1.0;vec3 pos=normalize(rawPos);gl_FragColor=vec4(mix(pos,rawPos,0.1),1.0);}";

// src/RTKit.ts
import {
  AdditiveBlending,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
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
function getBasicRenderTarget(edgeSize) {
  return new WebGLRenderTarget(edgeSize, edgeSize, {
    format: RGBAFormat,
    type: FloatType,
    magFilter: NearestFilter,
    minFilter: NearestFilter,
    depthBuffer: false,
    encoding: LinearEncoding
  });
}

// src/RTKit.ts
var RTKit = class {
  constructor(edgeSize, vertexShader, fragmentShader, _uniforms) {
    this.edgeSize = edgeSize;
    this._uniforms = _uniforms;
    const rt = getBasicRenderTarget(edgeSize);
    this.outputTextureUniform = new Uniform(rt.texture);
    const scene = new Scene();
    const plane = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
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
    return new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
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
  constructor(edgeSize) {
    const phaseUniform = new Uniform2(0);
    const uniforms = { uPhase: phaseUniform };
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
  constructor(edgeSize, pointGeo) {
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
  Points,
  ShaderMaterial as ShaderMaterial2
} from "three";

// src/velocityField.frag.glsl
var velocityField_frag_default = "uniform sampler2D uVelocitiesTexture;varying vec2 vUv;void main(){vec3 vel=texture2D(uVelocitiesTexture,vUv).xyz;gl_FragColor=vec4(vel*1.0,1.0);}";

// src/velocityField.vert.glsl
var velocityField_vert_default = "uniform sampler2D uPositionsTexture;varying vec2 vUv;void main(){vec3 pos=texture2D(uPositionsTexture,position.xy).xyz;vec3 uvw=pos*0.5+0.5;float z=floor(uvw.z*64.0);float zy=floor(z/8.0);float zx=fract(z/8.0)*8.0;vec2 uv=(uvw.xy+vec2(zx,zy))/8.0;vUv=uv;gl_Position=vec4(uv*2.0-1.0,0.0,1.0);gl_PointSize=1.0;}";

// src/fade.frag.glsl
var fade_frag_default = "uniform sampler2D uFieldVelocitiesTexture;varying vec2 vUv;void main(){gl_FragColor=texture2D(uFieldVelocitiesTexture,vUv);}";

// src/VelocityFieldKit.ts
var VelocityFieldKit = class extends RTDoubleBufferKit {
  _initVelocitiesNoiseKit;
  initd = false;
  constructor(edgeSize3d, pointGeo, positionsTextureUniform) {
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
        uVelocitiesTexture: this.inputTextureUniform
      },
      depthTest: false,
      depthWrite: false
    }));
    this.scene.add(points);
    this.plane.renderOrder = -1;
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
  velocityKit;
  constructor(edgeSize = 256) {
    const geo = new BufferGeometry2();
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
    const motionKit = new MotionKit(edgeSize, geo);
    const velocityKit = new VelocityFieldKit(64, geo, motionKit.outputTextureUniform);
    motionKit.linkInput("uVelocitiesTexture", velocityKit.outputTextureUniform);
    const pointsMat = new ShaderMaterial3({
      fragmentShader: point_frag_default,
      vertexShader: point_vert_default,
      uniforms: {
        uMap: motionKit.outputTextureUniform
      },
      blending: AdditiveBlending2,
      depthTest: false
    });
    const visuals = new Points2(geo, pointsMat);
    this.motionKit = motionKit;
    this.velocityKit = velocityKit;
    this.visuals = visuals;
  }
  update(renderer, dt) {
    this.motionKit.render(renderer, dt);
    this.velocityKit.render(renderer, dt);
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
