// src/Atoms.ts
import {
  AdditiveBlending as AdditiveBlending2,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial as ShaderMaterial2,
  Sphere,
  Uniform as Uniform2
} from "three";

// src/point.frag.glsl
var point_frag_default = "varying vec3 vColor;void main(){gl_FragColor=vec4(vColor*0.5,1.0);}";

// src/point.vert.glsl
var point_vert_default = "uniform sampler2D uMap;varying vec3 vColor;void main(){vec4 pos=texture2D(uMap,position.xy);vec4 mvPosition=modelViewMatrix*vec4(pos.xyz*2.0-1.0,1.0);gl_Position=projectionMatrix*mvPosition;vColor=position.xyz;gl_PointSize=4.0/-mvPosition.z;}";

// src/NoiseKit.ts
import {
  AdditiveBlending,
  FloatType,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RGBFormat,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderTarget
} from "three";

// src/noise.frag.glsl
var noise_frag_default = "varying vec2 vUv;varying vec3 vColor;uniform float uPhase;\n#define NOISE fbm\n#define NUM_NOISE_OCTAVES 5\nfloat hash(float p){p=fract(p*0.011);p*=p+7.5;p*=p+p;return fract(p);}float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.13);p3+=dot(p3,p3.yzx+3.333);return fract((p3.x+p3.y)*p3.z);}float noise(float x){float i=floor(x);float f=fract(x);float u=f*f*(3.0-2.0*f);return mix(hash(i),hash(i+1.0),u);}float noise(vec2 x){vec2 i=floor(x);vec2 f=fract(x);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}float noise(vec3 x){const vec3 step=vec3(110,241,171);vec3 i=floor(x);vec3 f=fract(x);float n=dot(i,step);vec3 u=f*f*(3.0-2.0*f);return mix(mix(mix(hash(n+dot(step,vec3(0,0,0))),hash(n+dot(step,vec3(1,0,0))),u.x),mix(hash(n+dot(step,vec3(0,1,0))),hash(n+dot(step,vec3(1,1,0))),u.x),u.y),mix(mix(hash(n+dot(step,vec3(0,0,1))),hash(n+dot(step,vec3(1,0,1))),u.x),mix(hash(n+dot(step,vec3(0,1,1))),hash(n+dot(step,vec3(1,1,1))),u.x),u.y),u.z);}float fbm(float x){float v=0.0;float a=0.5;float shift=float(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}float fbm(vec2 x){float v=0.0;float a=0.5;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.5;}return v;}float fbm(vec3 x){float v=0.0;float a=0.5;vec3 shift=vec3(100);for(int i=0;i<NUM_NOISE_OCTAVES;++i){v+=a*noise(x);x=x*2.0+shift;a*=0.5;}return v;}void main(){vec3 uv=vec3(vUv.x,vUv.y,uPhase);float vx=NOISE(uv*16.0);float vy=NOISE(uv*16.0+9.0);float vz=NOISE(uv*16.0+25.0);vec3 rawPos=vec3(vx,vy,vz)*2.0-1.0;vec3 pos=normalize(rawPos);gl_FragColor=vec4(mix(pos,rawPos,0.0)*0.5+0.5,1.0);}";

// src/fullclip.vert.glsl
var fullclip_vert_default = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.x,position.y,0.0,1.0);}";

// src/NoiseKit.ts
var NoiseKit = class {
  getTestPlane() {
    return new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
      fragmentShader: noise_frag_default,
      vertexShader: fullclip_vert_default,
      uniforms: { uPhase: this._phaseUniform },
      blending: AdditiveBlending,
      depthTest: false
    }));
  }
  rt;
  scene;
  dirty = true;
  camera;
  _phaseUniform;
  constructor(edgeSize) {
    const rt = new WebGLRenderTarget(edgeSize, edgeSize, {
      format: RGBFormat,
      type: FloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      depthBuffer: false
    });
    const scene = new Scene();
    const phaseUniform = new Uniform(0);
    const p = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
      fragmentShader: noise_frag_default,
      vertexShader: fullclip_vert_default,
      uniforms: { uPhase: phaseUniform }
    }));
    scene.add(p);
    const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
    scene.add(camera);
    this.rt = rt;
    this.scene = scene;
    this.camera = camera;
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
    this.phase += dt * 1e-3;
    if (this.dirty) {
      this.dirty = false;
      renderer.setRenderTarget(this.rt);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(null);
    }
  }
};

// src/Atoms.ts
var Atoms = class {
  visuals;
  noiseKit;
  constructor(edgeSize = 256) {
    const geo = new BufferGeometry();
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
    const noiseKit = new NoiseKit(edgeSize);
    const mat2 = new ShaderMaterial2({
      fragmentShader: point_frag_default,
      vertexShader: point_vert_default,
      uniforms: {
        uMap: new Uniform2(noiseKit.rt.texture)
      },
      blending: AdditiveBlending2,
      depthTest: false
    });
    const visuals = new Points(geo, mat2);
    this.noiseKit = noiseKit;
    this.visuals = visuals;
  }
  update(renderer, dt) {
    this.noiseKit.render(renderer, dt);
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
