// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Simplex Noise (http://en.wikipedia.org/wiki/Simplex_noise), a type of gradient noise
// that uses N+1 vertices for random gradient interpolation instead of 2^N as in regular
// latice based Gradient Noise.

// modified by Tomasz Dysinski 2021

precision lowp float;

uniform vec3 uColor;
varying vec2 vUv;


vec2 hash( vec2 p ) // replace this by something better
{
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2  i = floor( p + (p.x+p.y)*K1 );
  vec2  a = p - i + (i.x+i.y)*K2;
  float m = step(a.y,a.x); 
  vec2  o = vec2(m,1.0-m);
  vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
  vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  // return dot( n, vec3(70.0) );
  return abs(dot( n, vec3(70.0) ));
}

float sampleNoise(in vec2 uv)
{
	float f = 0.0;
  float strength = 0.5;
  mat2 m = mat2( 2.6,  1.2, -1.2,  2.6 );
  f  = strength * noise( uv ); uv *= m; strength *= 0.2;
  f += strength * noise( uv ); uv *= m; //strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f += strength * noise( uv ); uv *= m; strength *= 0.5;
  // f*=f;
  // f = min(1.0, max(0.0, f * 10.0)) - f;
  // float fi = abs(f);
  float fi = 1.0 - (f * 0.5 + 0.5);
	f = 1.0-fi*fi;
  return fi;
}

void main() {
  vec2 uv = vUv * 12.0 * vec2(1.0, 1.6);

  // uv *= 5.0;
  float f = sampleNoise(uv);

	#ifdef MODE_NORMALS
    vec2 dx = vec2(0.01, 0.0);
    vec2 dy = vec2(0.0, 0.01);
    float fL = sampleNoise(uv + dx);
    float fR = sampleNoise(uv - dx);
    float fU = sampleNoise(uv + dy);
    float fD = sampleNoise(uv - dy);
    float strength = 10.0;
    vec3 normal = vec3(-(fL-fR) * strength, (fU-fD) * strength, f);
    
  	gl_FragColor = vec4( normalize(normal) * vec3(0.5) + vec3(0.5), 1.0 );
  #else
  	gl_FragColor = vec4( vec3(f) * uColor, 1.0 );
  #endif
}