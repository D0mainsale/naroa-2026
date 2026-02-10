/**
 * Cinematic Grain - WebGL Noise Overlay
 * Adds a subtle film grain texture to the hero section for a premium look
 */
(function() {
  const canvas = document.getElementById('hero-grain');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) return;

  // Shader sources
  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader with simple high-performance noise
  const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;

    // Gold Noise function (high quality, no patterns)
    float noise(vec2 xy) {
      return fract(tan(distance(xy*1.61803398874989484820459, xy)*u_time) * xy.x);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float n = noise(gl_FragCoord.xy + u_time);
      
      // Output noise (adjust alpha for intensity)
      gl_FragColor = vec4(vec3(n), 0.07); // 7% opacity
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const program = gl.createProgram();
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Buffer setup (full screen quad)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0,
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const timeLocation = gl.getUniformLocation(program, "u_time");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // Hero height
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  function render(time) {
    time *= 0.001; // seconds
    gl.uniform1f(timeLocation, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
