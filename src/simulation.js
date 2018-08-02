/**
 * @author jonobr1 / http://www.jonobr1.com
 */

GPGPU.Simulation = function () {

  var material = new THREE.ShaderMaterial({

    uniforms: {
      tPositions: { type: 't', value: null },
      tOrigins: { type: 't', value: null },
      timer: { type: 'f', value: 0 },
      radius: { type: 'f', radius: 10 },
      phi: { type: 'f', value: 2 },
      magnitude: { type: 'f', value: 0.3 },
      fft: { type: 'f', value: 0 },
      stepSize: { type: 'f', value: 0.01 },
      rotation: { type: 'f', value: 0 },
      resolution: { type: 'f', value: 1024 }
    },

    vertexShader: [

      'varying vec2 vUv;',

      'void main() {',
        'vUv = vec2( uv.x, 1.0 - uv.y );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'

    ].join( '\n' ),

    fragmentShader: [

      'const float PI = ' + Math.PI + ';',
      'const float TWO_PI = ' + Math.PI * 2 + ';',

      'uniform sampler2D tPositions;',
      'uniform sampler2D tOrigins;',

      'uniform float timer;',
      'uniform float radius;',
      'uniform float phi;',
      'uniform float magnitude;',
      'uniform float fft;',
      'uniform float stepSize;',
      'uniform float rotation;',
      'uniform float resolution;',

      'varying vec2 vUv;',

      'vec2 hash( vec2 x ) {',
        'const vec2 k = vec2( 0.3183099, 0.3678794 );',
        'x = x * k + k.yx;',
        'return 2.0 * fract( 16.0 * k * fract( x.x * x.y * ( x.x + x.y ) ) ) - 1.0;',
      '}',

      'float noise( in vec2 p ) {',
        'vec2 i = floor( p );',
        'vec2 f = fract( p );',

        'vec2 u = f * f * ( 3.0 - 2.0 * f );',

        'return mix( mix( dot( hash( i + vec2( 0.0, 0.0 ) ), f - vec2( 0.0, 0.0 ) ),',
                         'dot( hash( i + vec2( 1.0, 0.0 ) ), f - vec2( 1.0, 0.0 ) ), u.x ),',
                    'mix( dot( hash( i + vec2( 0.0, 1.0 ) ), f - vec2( 0.0, 1.0 ) ),',
                         'dot( hash( i + vec2( 1.0, 1.0 ) ), f - vec2( 1.0, 1.0 ) ), u.x ), u.y );',
      '}',

      'void main() {',

        'vec4 info = texture2D( tOrigins, vUv );',
        'info.x = info.x / resolution;',
        'info.y = ( info.y / resolution ) * 0.05 - 0.025;',
        'info.z = ( info.z / resolution ) * 0.01;',

        'float pct = info.x;',
        'float sum = vUv.x * ( 1.0 + vUv.y );',
        'float visible = step( sum, fft * timer * 0.1 + timer * 0.01 );',

        'float t = info.z;',
        'float theta = pct * TWO_PI;',
        'float phase = sin( theta * phi );',
        'float r = radius * ( 1.0 - info.y );',
        'float amp = r * ( 1.0 + phase * magnitude * fft );',

        'vec4 pos = texture2D( tPositions, vUv );',

        'if ( pos.w <= 0.0 || pos.z >= radius * 4.0 ) {',

          'pos.x = amp * cos( theta + rotation );',
          'pos.y = amp * sin( theta + rotation );',
          'pos.z = radius * fft * 2.0;',

          'pos.w = visible;',
          'pos.w *= 2.0 * ( fft + 0.1 ) * ( 1.0 - info.y );',

        '} else {',

          'float band = pow( fft, 0.0625 );',
          'float disperse = 50.0 * stepSize * info.y;',
          'amp = stepSize * ( 100.0 * band + 2.0 );',

          'pos.x += disperse * cos( theta );',
          'pos.y += disperse * sin( theta );',
          'pos.z += amp;',

          'float tx = 12.0 * noise( pos.xy * sum );',
          'float ty = 2.0 * disperse;',//'* pos.z;',

          'pos.x += ty * cos( tx );',
          'pos.y += ty * sin( tx );',

          'pos.w -= t * band;',

        '}',

        'gl_FragColor = pos;',

      '}',

    ].join('\n')

  });

  return {

    material: material,

    setPositionsTexture: function ( positions ) {

      material.uniforms.tPositions.value = positions;
      return this;

    },

    setOriginsTexture: function ( origins ) {

      material.uniforms.tOrigins.value = origins;
      return this;

    },

    setRadius: function ( radius ) {
      material.uniforms.radius.value = radius;
      return this;
    },

    setPhi: function ( phi ) {
      material.uniforms.phi.value = phi;
      return this;
    },

    setMagnitude: function ( magnitude ) {
      material.uniforms.magnitude.value = magnitude;
      return this;
    },

    setFFT: function ( fft ) {
      material.uniforms.fft.value = fft;
      return this;
    },

    setRotation: function ( rotation ) {
      material.uniforms.rotation.value = rotation;
      return this;
    },

    setTimer: function ( timer ) {

      material.uniforms.timer.value = timer;
      return this;

    }

  };

};
