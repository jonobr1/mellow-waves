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
      rotation: { type: 'f', value: 0 }
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

      'varying vec2 vUv;',

      'void main() {',

        'vec4 info = texture2D( tOrigins, vUv );',
        'float pct = info.x;',
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

          'pos.w = 2.0 * ( fft + 0.1 ) * ( 1.0 - info.y );',

        '} else {',

          'float disperse = 25.0 * stepSize * info.y;',
          'amp = stepSize * ( 25.0 * pow( fft, 0.0625 ) + 1.0 );',

          'pos.x = disperse * cos( theta ) + pos.x;',
          'pos.y = disperse * sin( theta ) + pos.y;',
          'pos.z += amp;',
          'pos.w -= t;',

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
