const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_depth;
  uniform sampler2D u_texture;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec2 uv = v_texCoord;
    
    vec2 mouseOffset = (u_mouse - 0.5) * 2.0;
    vec2 parallax = mouseOffset * u_depth * 0.05;
    
    uv += parallax;
    
    vec4 color = texture2D(u_texture, uv);
    
    gl_FragColor = color;
  }
`;

const compositeVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const compositeFragmentShader = `
  precision mediump float;
  
  uniform sampler2D u_layer0;
  uniform sampler2D u_layer1;
  uniform sampler2D u_layer2;
  uniform sampler2D u_layer3;
  uniform float u_opacity0;
  uniform float u_opacity1;
  uniform float u_opacity2;
  uniform float u_opacity3;
  uniform int u_layerCount;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec4 color = vec4(0.0);
    
    if (u_layerCount > 0) {
      color = texture2D(u_layer0, v_texCoord) * u_opacity0;
    }
    if (u_layerCount > 1) {
      vec4 layer1 = texture2D(u_layer1, v_texCoord) * u_opacity1;
      color = mix(color, layer1, layer1.a);
    }
    if (u_layerCount > 2) {
      vec4 layer2 = texture2D(u_layer2, v_texCoord) * u_opacity2;
      color = mix(color, layer2, layer2.a);
    }
    if (u_layerCount > 3) {
      vec4 layer3 = texture2D(u_layer3, v_texCoord) * u_opacity3;
      color = mix(color, layer3, layer3.a);
    }
    
    gl_FragColor = color;
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export class ParallaxDepthShader {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    }) || canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
    
    this.layers = [];
    this.layerDepths = [];
    this.maxLayers = options.maxLayers || 4;
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentMouse = { x: 0.5, y: 0.5 };
    this.mouseVelocity = 0.2;
    this.time = 0;
    
    this.framebuffers = [];
    this.textures = [];
    
    this.isInitialized = false;
  }
  
  init() {
    const gl = this.gl;
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = createProgram(gl, vertexShader, fragmentShader);
    
    const compVertexShader = createShader(gl, gl.VERTEX_SHADER, compositeVertexShader);
    const compFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, compositeFragmentShader);
    this.compositeProgram = createProgram(gl, compVertexShader, compFragmentShader);
    
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 1, 1
    ]), gl.STATIC_DRAW);
    
    this.setupLocations();
    this.setupFramebuffers();
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    this.resize();
    this.isInitialized = true;
    
    return this;
  }
  
  setupLocations() {
    const gl = this.gl;
    
    this.locations = {
      position: gl.getAttribLocation(this.program, 'a_position'),
      texCoord: gl.getAttribLocation(this.program, 'a_texCoord'),
      time: gl.getUniformLocation(this.program, 'u_time'),
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      depth: gl.getUniformLocation(this.program, 'u_depth'),
      texture: gl.getUniformLocation(this.program, 'u_texture')
    };
    
    this.compositeLocations = {
      position: gl.getAttribLocation(this.compositeProgram, 'a_position'),
      texCoord: gl.getAttribLocation(this.compositeProgram, 'a_texCoord'),
      layer0: gl.getUniformLocation(this.compositeProgram, 'u_layer0'),
      layer1: gl.getUniformLocation(this.compositeProgram, 'u_layer1'),
      layer2: gl.getUniformLocation(this.compositeProgram, 'u_layer2'),
      layer3: gl.getUniformLocation(this.compositeProgram, 'u_layer3'),
      opacity0: gl.getUniformLocation(this.compositeProgram, 'u_opacity0'),
      opacity1: gl.getUniformLocation(this.compositeProgram, 'u_opacity1'),
      opacity2: gl.getUniformLocation(this.compositeProgram, 'u_opacity2'),
      opacity3: gl.getUniformLocation(this.compositeProgram, 'u_opacity3'),
      layerCount: gl.getUniformLocation(this.compositeProgram, 'u_layerCount')
    };
  }
  
  setupFramebuffers() {
    const gl = this.gl;
    
    for (let i = 0; i < this.maxLayers; i++) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      
      this.framebuffers.push(framebuffer);
      this.textures.push(texture);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  
  resize() {
    const gl = this.gl;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      gl.viewport(0, 0, displayWidth, displayHeight);
      
      for (let i = 0; i < this.maxLayers; i++) {
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, displayWidth, displayHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
    }
  }
  
  addLayer(image, depth = 0) {
    if (this.layers.length >= this.maxLayers) {
      console.warn('Max layers reached');
      return -1;
    }
    
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    const index = this.layers.length;
    this.layers.push({ texture, width: image.width, height: image.height });
    this.layerDepths[index] = depth;
    
    return index;
  }
  
  setDepth(layer, depth) {
    if (layer >= 0 && layer < this.layerDepths.length) {
      this.layerDepths[layer] = depth;
    }
  }
  
  setMouse(x, y) {
    this.targetMouse.x = Math.max(0, Math.min(1, x));
    this.targetMouse.y = Math.max(0, Math.min(1, y));
  }
  
  update(deltaTime) {
    if (!this.isInitialized) return;
    
    const dt = Math.min(deltaTime / 1000, 0.1);
    const smoothing = Math.min(this.mouseVelocity * dt * 60, 1);
    
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * smoothing;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * smoothing;
    
    this.time += dt;
  }
  
  renderLayer(layerIndex) {
    const gl = this.gl;
    const layer = this.layers[layerIndex];
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[layerIndex]);
    gl.useProgram(this.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.locations.position);
    gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.locations.texCoord);
    gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform1f(this.locations.time, this.time);
    gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.locations.mouse, this.currentMouse.x, this.currentMouse.y);
    gl.uniform1f(this.locations.depth, this.layerDepths[layerIndex] || 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, layer.texture);
    gl.uniform1i(this.locations.texture, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  composite() {
    const gl = this.gl;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.compositeProgram);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.compositeLocations.position);
    gl.vertexAttribPointer(this.compositeLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.compositeLocations.texCoord);
    gl.vertexAttribPointer(this.compositeLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    for (let i = 0; i < this.maxLayers; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      gl.uniform1i(this.compositeLocations[`layer${i}`], i);
      gl.uniform1f(this.compositeLocations[`opacity${i}`], i < this.layers.length ? 1.0 : 0.0);
    }
    
    gl.uniform1i(this.compositeLocations.layerCount, this.layers.length);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  render() {
    if (!this.isInitialized || this.layers.length === 0) return;
    
    this.resize();
    
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    for (let i = 0; i < this.layers.length; i++) {
      this.renderLayer(i);
    }
    
    this.composite();
  }
  
  destroy() {
    const gl = this.gl;
    
    this.layers.forEach(layer => {
      gl.deleteTexture(layer.texture);
    });
    
    this.framebuffers.forEach(fb => {
      gl.deleteFramebuffer(fb);
    });
    
    this.textures.forEach(tex => {
      gl.deleteTexture(tex);
    });
    
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.texCoordBuffer);
    gl.deleteProgram(this.program);
    gl.deleteProgram(this.compositeProgram);
    
    this.isInitialized = false;
  }
}

export default ParallaxDepthShader;
