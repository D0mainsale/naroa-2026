Create a WebGL Parallax Depth shader system for an art gallery. Requirements:
- ES6 module export
- Shader uniforms: u_time, u_resolution, u_mouse, u_depth
- Z-axis parallax based on mouse movement
- Smooth interpolation for 60fps on mobile
- Support for multiple image layers at different depths
- Export as class: ParallaxDepthShader
File structure:
- Constructor initializes WebGL context
- Methods: init(), update(deltaTime), render(), setDepth(layer, depth)
- Clean shader code with vertex and fragment shaders inline
Output ONLY the complete JavaScript code, no explanations.
TurnBegin(
    user_input='Create a WebGL Parallax Depth shader system for an art gallery. 
Requirements:\n- ES6 module export\n- Shader uniforms: u_time, u_resolution, 
u_mouse, u_depth\n- Z-axis parallax based on mouse movement\n- Smooth 
interpolation for 60fps on mobile\n- Support for multiple image layers at 
different depths\n- Export as class: ParallaxDepthShader\nFile structure:\n- 
Constructor initializes WebGL context\n- Methods: init(), update(deltaTime), 
render(), setDepth(layer, depth)\n- Clean shader code with vertex and fragment 
shaders inline\nOutput ONLY the complete JavaScript code, no explanations.'
)
StepBegin(n=1)
ThinkPart(
    type='think',
    think="The user wants a WebGL-based parallax shader for an art gallery, 
requiring ES6 modules and a class structure. I need to determine the most 
effective way to implement the `ParallaxDepthShader` class.\n\nHmm, the 
requirement for multiple image layers at different depths suggests a multi-pass 
rendering approach or at least a shader that can composite several textures. To 
keep the code self-contained as requested, I'll define the vertex and fragment 
shaders as template literals right inside the module.\n\nWait, for the parallax 
effect to be smooth on mobile, the `update` method must handle `deltaTime` 
correctly to interpolate the mouse coordinates. I'll need uniform locations for 
`u_time`, `u_resolution`, `u_mouse`, and `u_depth`.\n\nActually, the user 
specifically wants a `setDepth(layer, depth)` method. This implies I should 
store depth values in a Float32Array and update the corresponding uniform buffer
or uniform value before each draw call.\n\nI'll structure the class with a 
constructor for WebGL initialization, an `init` method for compiling shaders and
setting up geometry, and a `render` method for the draw loop. I'll ensure the 
code is strictly ES6 and handles context loss gracefully where possible. I'll 
now write the complete implementation to `js/parallax-shader.js`.",
    encrypted=None
)
ToolCall(
    type='function',
    id='tool_gp6toCnIO94XyMQuQq45FCmX',
    function=FunctionBody(
        name='WriteFile',
        arguments='{"path": "js/parallax-shader.js", "content": "const 
vertexShaderSource = `\\n  attribute vec2 a_position;\\n  attribute vec2 
a_texCoord;\\n  varying vec2 v_texCoord;\\n  \\n  void main() {\\n    
gl_Position = vec4(a_position, 0.0, 1.0);\\n    v_texCoord = a_texCoord;\\n  
}\\n`;\\n\\nconst fragmentShaderSource = `\\n  precision mediump float;\\n  \\n 
uniform float u_time;\\n  uniform vec2 u_resolution;\\n  uniform vec2 
u_mouse;\\n  uniform float u_depth;\\n  uniform sampler2D u_texture;\\n  \\n  
varying vec2 v_texCoord;\\n  \\n  void main() {\\n    vec2 uv = v_texCoord;\\n  
\\n    vec2 mouseOffset = (u_mouse - 0.5) * 2.0;\\n    vec2 parallax = 
mouseOffset * u_depth * 0.05;\\n    \\n    uv += parallax;\\n    \\n    vec4 
color = texture2D(u_texture, uv);\\n    \\n    gl_FragColor = color;\\n  
}\\n`;\\n\\nconst compositeVertexShader = `\\n  attribute vec2 a_position;\\n  
attribute vec2 a_texCoord;\\n  varying vec2 v_texCoord;\\n  \\n  void main() 
{\\n    gl_Position = vec4(a_position, 0.0, 1.0);\\n    v_texCoord = 
a_texCoord;\\n  }\\n`;\\n\\nconst compositeFragmentShader = `\\n  precision 
mediump float;\\n  \\n  uniform sampler2D u_layer0;\\n  uniform sampler2D 
u_layer1;\\n  uniform sampler2D u_layer2;\\n  uniform sampler2D u_layer3;\\n  
uniform float u_opacity0;\\n  uniform float u_opacity1;\\n  uniform float 
u_opacity2;\\n  uniform float u_opacity3;\\n  uniform int u_layerCount;\\n  \\n 
varying vec2 v_texCoord;\\n  \\n  void main() {\\n    vec4 color = vec4(0.0);\\n
\\n    if (u_layerCount > 0) {\\n      color = texture2D(u_layer0, v_texCoord) *
u_opacity0;\\n    }\\n    if (u_layerCount > 1) {\\n      vec4 layer1 = 
texture2D(u_layer1, v_texCoord) * u_opacity1;\\n      color = mix(color, layer1,
layer1.a);\\n    }\\n    if (u_layerCount > 2) {\\n      vec4 layer2 = 
texture2D(u_layer2, v_texCoord) * u_opacity2;\\n      color = mix(color, layer2,
layer2.a);\\n    }\\n    if (u_layerCount > 3) {\\n      vec4 layer3 = 
texture2D(u_layer3, v_texCoord) * u_opacity3;\\n      color = mix(color, layer3,
layer3.a);\\n    }\\n    \\n    gl_FragColor = color;\\n  }\\n`;\\n\\nfunction 
createShader(gl, type, source) {\\n  const shader = gl.createShader(type);\\n  
gl.shaderSource(shader, source);\\n  gl.compileShader(shader);\\n  if 
(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\\n    
console.error(\'Shader compile error:\', gl.getShaderInfoLog(shader));\\n    
gl.deleteShader(shader);\\n    return null;\\n  }\\n  return 
shader;\\n}\\n\\nfunction createProgram(gl, vertexShader, fragmentShader) {\\n  
const program = gl.createProgram();\\n  gl.attachShader(program, 
vertexShader);\\n  gl.attachShader(program, fragmentShader);\\n  
gl.linkProgram(program);\\n  if (!gl.getProgramParameter(program, 
gl.LINK_STATUS)) {\\n    console.error(\'Program link error:\', 
gl.getProgramInfoLog(program));\\n    return null;\\n  }\\n  return 
program;\\n}\\n\\nexport class ParallaxDepthShader {\\n  constructor(canvas, 
options = {}) {\\n    this.canvas = canvas;\\n    this.gl = 
canvas.getContext(\'webgl\', {\\n      alpha: true,\\n      antialias: false,\\n
powerPreference: \'high-performance\',\\n      preserveDrawingBuffer: false\\n  
}) || canvas.getContext(\'experimental-webgl\');\\n    \\n    if (!this.gl) {\\n
throw new Error(\'WebGL not supported\');\\n    }\\n    \\n    this.layers = 
[];\\n    this.layerDepths = [];\\n    this.maxLayers = options.maxLayers || 
4;\\n    this.targetMouse = { x: 0.5, y: 0.5 };\\n    this.currentMouse = { x: 
0.5, y: 0.5 };\\n    this.mouseVelocity = 0.2;\\n    this.time = 0;\\n    \\n   
this.framebuffers = [];\\n    this.textures = [];\\n    \\n    
this.isInitialized = false;\\n  }\\n  \\n  init() {\\n    const gl = this.gl;\\n
\\n    const vertexShader = createShader(gl, gl.VERTEX_SHADER, 
vertexShaderSource);\\n    const fragmentShader = createShader(gl, 
gl.FRAGMENT_SHADER, fragmentShaderSource);\\n    this.program = 
createProgram(gl, vertexShader, fragmentShader);\\n    \\n    const 
compVertexShader = createShader(gl, gl.VERTEX_SHADER, compositeVertexShader);\\n
const compFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 
compositeFragmentShader);\\n    this.compositeProgram = createProgram(gl, 
compVertexShader, compFragmentShader);\\n    \\n    this.positionBuffer = 
gl.createBuffer();\\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\\n
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\\n      -1, -1, 1, -1, -1, 
1,\\n      -1, 1, 1, -1, 1, 1\\n    ]), gl.STATIC_DRAW);\\n    \\n    
this.texCoordBuffer = gl.createBuffer();\\n    gl.bindBuffer(gl.ARRAY_BUFFER, 
this.texCoordBuffer);\\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\\n
0, 0, 1, 0, 0, 1,\\n      0, 1, 1, 0, 1, 1\\n    ]), gl.STATIC_DRAW);\\n    \\n 
this.setupLocations();\\n    this.setupFramebuffers();\\n    \\n    
gl.enable(gl.BLEND);\\n    gl.blendFunc(gl.SRC_ALPHA, 
gl.ONE_MINUS_SRC_ALPHA);\\n    \\n    this.resize();\\n    this.isInitialized = 
true;\\n    \\n    return this;\\n  }\\n  \\n  setupLocations() {\\n    const gl
= this.gl;\\n    \\n    this.locations = {\\n      position: 
gl.getAttribLocation(this.program, \'a_position\'),\\n      texCoord: 
gl.getAttribLocation(this.program, \'a_texCoord\'),\\n      time: 
gl.getUniformLocation(this.program, \'u_time\'),\\n      resolution: 
gl.getUniformLocation(this.program, \'u_resolution\'),\\n      mouse: 
gl.getUniformLocation(this.program, \'u_mouse\'),\\n      depth: 
gl.getUniformLocation(this.program, \'u_depth\'),\\n      texture: 
gl.getUniformLocation(this.program, \'u_texture\')\\n    };\\n    \\n    
this.compositeLocations = {\\n      position: 
gl.getAttribLocation(this.compositeProgram, \'a_position\'),\\n      texCoord: 
gl.getAttribLocation(this.compositeProgram, \'a_texCoord\'),\\n      layer0: 
gl.getUniformLocation(this.compositeProgram, \'u_layer0\'),\\n      layer1: 
gl.getUniformLocation(this.compositeProgram, \'u_layer1\'),\\n      layer2: 
gl.getUniformLocation(this.compositeProgram, \'u_layer2\'),\\n      layer3: 
gl.getUniformLocation(this.compositeProgram, \'u_layer3\'),\\n      opacity0: 
gl.getUniformLocation(this.compositeProgram, \'u_opacity0\'),\\n      opacity1: 
gl.getUniformLocation(this.compositeProgram, \'u_opacity1\'),\\n      opacity2: 
gl.getUniformLocation(this.compositeProgram, \'u_opacity2\'),\\n      opacity3: 
gl.getUniformLocation(this.compositeProgram, \'u_opacity3\'),\\n      
layerCount: gl.getUniformLocation(this.compositeProgram, \'u_layerCount\')\\n   
};\\n  }\\n  \\n  setupFramebuffers() {\\n    const gl = this.gl;\\n    \\n    
for (let i = 0; i < this.maxLayers; i++) {\\n      const texture = 
gl.createTexture();\\n      gl.bindTexture(gl.TEXTURE_2D, texture);\\n      
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
null);\\n      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
gl.LINEAR);\\n      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, 
gl.LINEAR);\\n      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, 
gl.CLAMP_TO_EDGE);\\n      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, 
gl.CLAMP_TO_EDGE);\\n      \\n      const framebuffer = 
gl.createFramebuffer();\\n      gl.bindFramebuffer(gl.FRAMEBUFFER, 
framebuffer);\\n      gl.framebufferTexture2D(gl.FRAMEBUFFER, 
gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);\\n      \\n      
this.framebuffers.push(framebuffer);\\n      this.textures.push(texture);\\n    
}\\n    \\n    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\\n  }\\n  \\n  resize()
{\\n    const gl = this.gl;\\n    const displayWidth = 
this.canvas.clientWidth;\\n    const displayHeight = 
this.canvas.clientHeight;\\n    \\n    if (this.canvas.width !== displayWidth ||
this.canvas.height !== displayHeight) {\\n      this.canvas.width = 
displayWidth;\\n      this.canvas.height = displayHeight;\\n      gl.viewport(0,
0, displayWidth, displayHeight);\\n      \\n      for (let i = 0; i < 
this.maxLayers; i++) {\\n        gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\\n        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
displayWidth, displayHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\\n      }\\n  
}\\n  }\\n  \\n  addLayer(image, depth = 0) {\\n    if (this.layers.length >= 
this.maxLayers) {\\n      console.warn(\'Max layers reached\');\\n      return 
-1;\\n    }\\n    \\n    const gl = this.gl;\\n    const texture = 
gl.createTexture();\\n    gl.bindTexture(gl.TEXTURE_2D, texture);\\n    
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\\n  
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\\n    
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\\n    
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\\n    
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\\n    \\n 
const index = this.layers.length;\\n    this.layers.push({ texture, width: 
image.width, height: image.height });\\n    this.layerDepths[index] = depth;\\n 
\\n    return index;\\n  }\\n  \\n  setDepth(layer, depth) {\\n    if (layer >= 
0 && layer < this.layerDepths.length) {\\n      this.layerDepths[layer] = 
depth;\\n    }\\n  }\\n  \\n  setMouse(x, y) {\\n    this.targetMouse.x = 
Math.max(0, Math.min(1, x));\\n    this.targetMouse.y = Math.max(0, Math.min(1, 
y));\\n  }\\n  \\n  update(deltaTime) {\\n    if (!this.isInitialized) 
return;\\n    \\n    const dt = Math.min(deltaTime / 1000, 0.1);\\n    const 
smoothing = Math.min(this.mouseVelocity * dt * 60, 1);\\n    \\n    
this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 
smoothing;\\n    this.currentMouse.y += (this.targetMouse.y - 
this.currentMouse.y) * smoothing;\\n    \\n    this.time += dt;\\n  }\\n  \\n  
renderLayer(layerIndex) {\\n    const gl = this.gl;\\n    const layer = 
this.layers[layerIndex];\\n    \\n    gl.bindFramebuffer(gl.FRAMEBUFFER, 
this.framebuffers[layerIndex]);\\n    gl.useProgram(this.program);\\n    \\n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\\n    
gl.enableVertexAttribArray(this.locations.position);\\n    
gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);\\n   
\\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\\n    
gl.enableVertexAttribArray(this.locations.texCoord);\\n    
gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);\\n   
\\n    gl.uniform1f(this.locations.time, this.time);\\n    
gl.uniform2f(this.locations.resolution, this.canvas.width, 
this.canvas.height);\\n    gl.uniform2f(this.locations.mouse, 
this.currentMouse.x, this.currentMouse.y);\\n    
gl.uniform1f(this.locations.depth, this.layerDepths[layerIndex] || 0);\\n    \\n
gl.activeTexture(gl.TEXTURE0);\\n    gl.bindTexture(gl.TEXTURE_2D, 
layer.texture);\\n    gl.uniform1i(this.locations.texture, 0);\\n    \\n    
gl.drawArrays(gl.TRIANGLES, 0, 6);\\n  }\\n  \\n  composite() {\\n    const gl =
this.gl;\\n    \\n    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\\n    
gl.useProgram(this.compositeProgram);\\n    \\n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\\n    
gl.enableVertexAttribArray(this.compositeLocations.position);\\n    
gl.vertexAttribPointer(this.compositeLocations.position, 2, gl.FLOAT, false, 0, 
0);\\n    \\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\\n    
gl.enableVertexAttribArray(this.compositeLocations.texCoord);\\n    
gl.vertexAttribPointer(this.compositeLocations.texCoord, 2, gl.FLOAT, false, 0, 
0);\\n    \\n    for (let i = 0; i < this.maxLayers; i++) {\\n      
gl.activeTexture(gl.TEXTURE0 + i);\\n      gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\\n      gl.uniform1i(this.compositeLocations[`layer${i}`], 
i);\\n      gl.uniform1f(this.compositeLocations[`opacity${i}`], i < 
this.layers.length ? 1.0 : 0.0);\\n    }\\n    \\n    
gl.uniform1i(this.compositeLocations.layerCount, this.layers.length);\\n    \\n 
gl.drawArrays(gl.TRIANGLES, 0, 6);\\n  }\\n  \\n  render() {\\n    if 
(!this.isInitialized || this.layers.length === 0) return;\\n    \\n    
this.resize();\\n    \\n    const gl = this.gl;\\n    gl.clearColor(0, 0, 0, 
0);\\n    gl.clear(gl.COLOR_BUFFER_BIT);\\n    \\n    for (let i = 0; i < 
this.layers.length; i++) {\\n      this.renderLayer(i);\\n    }\\n    \\n    
this.composite();\\n  }\\n  \\n  destroy() {\\n    const gl = this.gl;\\n    \\n
this.layers.forEach(layer => {\\n      gl.deleteTexture(layer.texture);\\n    
});\\n    \\n    this.framebuffers.forEach(fb => {\\n      
gl.deleteFramebuffer(fb);\\n    });\\n    \\n    this.textures.forEach(tex => 
{\\n      gl.deleteTexture(tex);\\n    });\\n    \\n    
gl.deleteBuffer(this.positionBuffer);\\n    
gl.deleteBuffer(this.texCoordBuffer);\\n    gl.deleteProgram(this.program);\\n  
gl.deleteProgram(this.compositeProgram);\\n    \\n    this.isInitialized = 
false;\\n  }\\n}\\n\\nexport default ParallaxDepthShader;\\n"}'
    ),
    extras=None
)
StatusUpdate(
    context_usage=0.02399444580078125,
    token_usage=TokenUsage(
        input_other=1426,
        output=4015,
        input_cache_read=4864,
        input_cache_creation=0
    ),
    message_id='chatcmpl-gOiwGuigPjEQyKiu6OfxpHF5'
)
ToolResult(
    tool_call_id='tool_gp6toCnIO94XyMQuQq45FCmX',
    return_value=ToolReturnValue(
        is_error=False,
        output='',
        message='File successfully overwritten. Current size: 11953 bytes.',
        display=[
            DiffDisplayBlock(
                type='diff',
                path='/Users/borjafernandezangulo/game/naroa-2026/js/parallax-sh
ader.js',
                old_text='',
                new_text="const vertexShaderSource = `\n  attribute vec2 
a_position;\n  attribute vec2 a_texCoord;\n  varying vec2 v_texCoord;\n  \n  
void main() {\n    gl_Position = vec4(a_position, 0.0, 1.0);\n    v_texCoord = 
a_texCoord;\n  }\n`;\n\nconst fragmentShaderSource = `\n  precision mediump 
float;\n  \n  uniform float u_time;\n  uniform vec2 u_resolution;\n  uniform 
vec2 u_mouse;\n  uniform float u_depth;\n  uniform sampler2D u_texture;\n  \n  
varying vec2 v_texCoord;\n  \n  void main() {\n    vec2 uv = v_texCoord;\n    \n
vec2 mouseOffset = (u_mouse - 0.5) * 2.0;\n    vec2 parallax = mouseOffset * 
u_depth * 0.05;\n    \n    uv += parallax;\n    \n    vec4 color = 
texture2D(u_texture, uv);\n    \n    gl_FragColor = color;\n  }\n`;\n\nconst 
compositeVertexShader = `\n  attribute vec2 a_position;\n  attribute vec2 
a_texCoord;\n  varying vec2 v_texCoord;\n  \n  void main() {\n    gl_Position = 
vec4(a_position, 0.0, 1.0);\n    v_texCoord = a_texCoord;\n  }\n`;\n\nconst 
compositeFragmentShader = `\n  precision mediump float;\n  \n  uniform sampler2D
u_layer0;\n  uniform sampler2D u_layer1;\n  uniform sampler2D u_layer2;\n  
uniform sampler2D u_layer3;\n  uniform float u_opacity0;\n  uniform float 
u_opacity1;\n  uniform float u_opacity2;\n  uniform float u_opacity3;\n  uniform
int u_layerCount;\n  \n  varying vec2 v_texCoord;\n  \n  void main() {\n    vec4
color = vec4(0.0);\n    \n    if (u_layerCount > 0) {\n      color = 
texture2D(u_layer0, v_texCoord) * u_opacity0;\n    }\n    if (u_layerCount > 1) 
{\n      vec4 layer1 = texture2D(u_layer1, v_texCoord) * u_opacity1;\n      
color = mix(color, layer1, layer1.a);\n    }\n    if (u_layerCount > 2) {\n     
vec4 layer2 = texture2D(u_layer2, v_texCoord) * u_opacity2;\n      color = 
mix(color, layer2, layer2.a);\n    }\n    if (u_layerCount > 3) {\n      vec4 
layer3 = texture2D(u_layer3, v_texCoord) * u_opacity3;\n      color = mix(color,
layer3, layer3.a);\n    }\n    \n    gl_FragColor = color;\n  }\n`;\n\nfunction 
createShader(gl, type, source) {\n  const shader = gl.createShader(type);\n  
gl.shaderSource(shader, source);\n  gl.compileShader(shader);\n  if 
(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n    console.error('Shader
compile error:', gl.getShaderInfoLog(shader));\n    gl.deleteShader(shader);\n  
return null;\n  }\n  return shader;\n}\n\nfunction createProgram(gl, 
vertexShader, fragmentShader) {\n  const program = gl.createProgram();\n  
gl.attachShader(program, vertexShader);\n  gl.attachShader(program, 
fragmentShader);\n  gl.linkProgram(program);\n  if 
(!gl.getProgramParameter(program, gl.LINK_STATUS)) {\n    console.error('Program
link error:', gl.getProgramInfoLog(program));\n    return null;\n  }\n  return 
program;\n}\n\nexport class ParallaxDepthShader {\n  constructor(canvas, options
= {}) {\n    this.canvas = canvas;\n    this.gl = canvas.getContext('webgl', {\n
alpha: true,\n      antialias: false,\n      powerPreference: 
'high-performance',\n      preserveDrawingBuffer: false\n    }) || 
canvas.getContext('experimental-webgl');\n    \n    if (!this.gl) {\n      throw
new Error('WebGL not supported');\n    }\n    \n    this.layers = [];\n    
this.layerDepths = [];\n    this.maxLayers = options.maxLayers || 4;\n    
this.targetMouse = { x: 0.5, y: 0.5 };\n    this.currentMouse = { x: 0.5, y: 0.5
};\n    this.mouseVelocity = 0.2;\n    this.time = 0;\n    \n    
this.framebuffers = [];\n    this.textures = [];\n    \n    this.isInitialized =
false;\n  }\n  \n  init() {\n    const gl = this.gl;\n    \n    const 
vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);\n    
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 
fragmentShaderSource);\n    this.program = createProgram(gl, vertexShader, 
fragmentShader);\n    \n    const compVertexShader = createShader(gl, 
gl.VERTEX_SHADER, compositeVertexShader);\n    const compFragmentShader = 
createShader(gl, gl.FRAGMENT_SHADER, compositeFragmentShader);\n    
this.compositeProgram = createProgram(gl, compVertexShader, 
compFragmentShader);\n    \n    this.positionBuffer = gl.createBuffer();\n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\n    
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      -1, -1, 1, -1, -1, 1,\n
-1, 1, 1, -1, 1, 1\n    ]), gl.STATIC_DRAW);\n    \n    this.texCoordBuffer = 
gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n  
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      0, 0, 1, 0, 0, 1,\n    
0, 1, 1, 0, 1, 1\n    ]), gl.STATIC_DRAW);\n    \n    this.setupLocations();\n  
this.setupFramebuffers();\n    \n    gl.enable(gl.BLEND);\n    
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);\n    \n    this.resize();\n 
this.isInitialized = true;\n    \n    return this;\n  }\n  \n  setupLocations() 
{\n    const gl = this.gl;\n    \n    this.locations = {\n      position: 
gl.getAttribLocation(this.program, 'a_position'),\n      texCoord: 
gl.getAttribLocation(this.program, 'a_texCoord'),\n      time: 
gl.getUniformLocation(this.program, 'u_time'),\n      resolution: 
gl.getUniformLocation(this.program, 'u_resolution'),\n      mouse: 
gl.getUniformLocation(this.program, 'u_mouse'),\n      depth: 
gl.getUniformLocation(this.program, 'u_depth'),\n      texture: 
gl.getUniformLocation(this.program, 'u_texture')\n    };\n    \n    
this.compositeLocations = {\n      position: 
gl.getAttribLocation(this.compositeProgram, 'a_position'),\n      texCoord: 
gl.getAttribLocation(this.compositeProgram, 'a_texCoord'),\n      layer0: 
gl.getUniformLocation(this.compositeProgram, 'u_layer0'),\n      layer1: 
gl.getUniformLocation(this.compositeProgram, 'u_layer1'),\n      layer2: 
gl.getUniformLocation(this.compositeProgram, 'u_layer2'),\n      layer3: 
gl.getUniformLocation(this.compositeProgram, 'u_layer3'),\n      opacity0: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity0'),\n      opacity1: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity1'),\n      opacity2: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity2'),\n      opacity3: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity3'),\n      layerCount: 
gl.getUniformLocation(this.compositeProgram, 'u_layerCount')\n    };\n  }\n  \n 
setupFramebuffers() {\n    const gl = this.gl;\n    \n    for (let i = 0; i < 
this.maxLayers; i++) {\n      const texture = gl.createTexture();\n      
gl.bindTexture(gl.TEXTURE_2D, texture);\n      gl.texImage2D(gl.TEXTURE_2D, 0, 
gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n      \n 
const framebuffer = gl.createFramebuffer();\n      
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\n      
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, 
texture, 0);\n      \n      this.framebuffers.push(framebuffer);\n      
this.textures.push(texture);\n    }\n    \n    
gl.bindFramebuffer(gl.FRAMEBUFFER, null);\n  }\n  \n  resize() {\n    const gl =
this.gl;\n    const displayWidth = this.canvas.clientWidth;\n    const 
displayHeight = this.canvas.clientHeight;\n    \n    if (this.canvas.width !== 
displayWidth || this.canvas.height !== displayHeight) {\n      this.canvas.width
= displayWidth;\n      this.canvas.height = displayHeight;\n      gl.viewport(0,
0, displayWidth, displayHeight);\n      \n      for (let i = 0; i < 
this.maxLayers; i++) {\n        gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\n        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
displayWidth, displayHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\n      }\n    
}\n  }\n  \n  addLayer(image, depth = 0) {\n    if (this.layers.length >= 
this.maxLayers) {\n      console.warn('Max layers reached');\n      return -1;\n
}\n    \n    const gl = this.gl;\n    const texture = gl.createTexture();\n    
gl.bindTexture(gl.TEXTURE_2D, texture);\n    gl.texImage2D(gl.TEXTURE_2D, 0, 
gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\n    gl.texParameteri(gl.TEXTURE_2D,
gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n    \n    const index = 
this.layers.length;\n    this.layers.push({ texture, width: image.width, height:
image.height });\n    this.layerDepths[index] = depth;\n    \n    return 
index;\n  }\n  \n  setDepth(layer, depth) {\n    if (layer >= 0 && layer < 
this.layerDepths.length) {\n      this.layerDepths[layer] = depth;\n    }\n  }\n
\n  setMouse(x, y) {\n    this.targetMouse.x = Math.max(0, Math.min(1, x));\n   
this.targetMouse.y = Math.max(0, Math.min(1, y));\n  }\n  \n  update(deltaTime) 
{\n    if (!this.isInitialized) return;\n    \n    const dt = Math.min(deltaTime
/ 1000, 0.1);\n    const smoothing = Math.min(this.mouseVelocity * dt * 60, 
1);\n    \n    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x)
* smoothing;\n    this.currentMouse.y += (this.targetMouse.y - 
this.currentMouse.y) * smoothing;\n    \n    this.time += dt;\n  }\n  \n  
renderLayer(layerIndex) {\n    const gl = this.gl;\n    const layer = 
this.layers[layerIndex];\n    \n    gl.bindFramebuffer(gl.FRAMEBUFFER, 
this.framebuffers[layerIndex]);\n    gl.useProgram(this.program);\n    \n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\n    
gl.enableVertexAttribArray(this.locations.position);\n    
gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);\n    
\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n    
gl.enableVertexAttribArray(this.locations.texCoord);\n    
gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);\n    
\n    gl.uniform1f(this.locations.time, this.time);\n    
gl.uniform2f(this.locations.resolution, this.canvas.width, 
this.canvas.height);\n    gl.uniform2f(this.locations.mouse, 
this.currentMouse.x, this.currentMouse.y);\n    
gl.uniform1f(this.locations.depth, this.layerDepths[layerIndex] || 0);\n    \n  
gl.activeTexture(gl.TEXTURE0);\n    gl.bindTexture(gl.TEXTURE_2D, 
layer.texture);\n    gl.uniform1i(this.locations.texture, 0);\n    \n    
gl.drawArrays(gl.TRIANGLES, 0, 6);\n  }\n  \n  composite() {\n    const gl = 
this.gl;\n    \n    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\n    
gl.useProgram(this.compositeProgram);\n    \n    gl.bindBuffer(gl.ARRAY_BUFFER, 
this.positionBuffer);\n    
gl.enableVertexAttribArray(this.compositeLocations.position);\n    
gl.vertexAttribPointer(this.compositeLocations.position, 2, gl.FLOAT, false, 0, 
0);\n    \n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n    
gl.enableVertexAttribArray(this.compositeLocations.texCoord);\n    
gl.vertexAttribPointer(this.compositeLocations.texCoord, 2, gl.FLOAT, false, 0, 
0);\n    \n    for (let i = 0; i < this.maxLayers; i++) {\n      
gl.activeTexture(gl.TEXTURE0 + i);\n      gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\n      gl.uniform1i(this.compositeLocations[`layer${i}`], 
i);\n      gl.uniform1f(this.compositeLocations[`opacity${i}`], i < 
this.layers.length ? 1.0 : 0.0);\n    }\n    \n    
gl.uniform1i(this.compositeLocations.layerCount, this.layers.length);\n    \n   
gl.drawArrays(gl.TRIANGLES, 0, 6);\n  }\n  \n  render() {\n    if 
(!this.isInitialized || this.layers.length === 0) return;\n    \n    
this.resize();\n    \n    const gl = this.gl;\n    gl.clearColor(0, 0, 0, 0);\n 
gl.clear(gl.COLOR_BUFFER_BIT);\n    \n    for (let i = 0; i < 
this.layers.length; i++) {\n      this.renderLayer(i);\n    }\n    \n    
this.composite();\n  }\n  \n  destroy() {\n    const gl = this.gl;\n    \n    
this.layers.forEach(layer => {\n      gl.deleteTexture(layer.texture);\n    
});\n    \n    this.framebuffers.forEach(fb => {\n      
gl.deleteFramebuffer(fb);\n    });\n    \n    this.textures.forEach(tex => {\n  
gl.deleteTexture(tex);\n    });\n    \n    
gl.deleteBuffer(this.positionBuffer);\n    
gl.deleteBuffer(this.texCoordBuffer);\n    gl.deleteProgram(this.program);\n    
gl.deleteProgram(this.compositeProgram);\n    \n    this.isInitialized = 
false;\n  }\n}\n\nexport default ParallaxDepthShader;"
            )
        ],
        extras=None
    )
)
StepBegin(n=2)
ThinkPart(
    type='think',
    think='The code has been written successfully to the file. The 
implementation includes:\n\n1. ES6 module export with `export class 
ParallaxDepthShader`\n2. All required shader uniforms: u_time, u_resolution, 
u_mouse, u_depth\n3. Z-axis parallax based on mouse movement\n4. Smooth 
interpolation using deltaTime for 60fps on mobile\n5. Support for multiple image
layers at different depths (up to 4 by default)\n6. Constructor initializes 
WebGL context\n7. Methods: init(), update(deltaTime), render(), setDepth(layer, 
depth)\n8. Clean shader code with vertex and fragment shaders inline\n9. 
Additional helper methods: addLayer(), setMouse(), resize(), destroy()\n\nThe 
file has been created at `js/parallax-shader.js` as expected.',
    encrypted=None
)
TextPart(
    type='text',
    text="```javascript\nconst vertexShaderSource = `\n  attribute vec2 
a_position;\n  attribute vec2 a_texCoord;\n  varying vec2 v_texCoord;\n  \n  
void main() {\n    gl_Position = vec4(a_position, 0.0, 1.0);\n    v_texCoord = 
a_texCoord;\n  }\n`;\n\nconst fragmentShaderSource = `\n  precision mediump 
float;\n  \n  uniform float u_time;\n  uniform vec2 u_resolution;\n  uniform 
vec2 u_mouse;\n  uniform float u_depth;\n  uniform sampler2D u_texture;\n  \n  
varying vec2 v_texCoord;\n  \n  void main() {\n    vec2 uv = v_texCoord;\n    \n
vec2 mouseOffset = (u_mouse - 0.5) * 2.0;\n    vec2 parallax = mouseOffset * 
u_depth * 0.05;\n    \n    uv += parallax;\n    \n    vec4 color = 
texture2D(u_texture, uv);\n    \n    gl_FragColor = color;\n  }\n`;\n\nconst 
compositeVertexShader = `\n  attribute vec2 a_position;\n  attribute vec2 
a_texCoord;\n  varying vec2 v_texCoord;\n  \n  void main() {\n    gl_Position = 
vec4(a_position, 0.0, 1.0);\n    v_texCoord = a_texCoord;\n  }\n`;\n\nconst 
compositeFragmentShader = `\n  precision mediump float;\n  \n  uniform sampler2D
u_layer0;\n  uniform sampler2D u_layer1;\n  uniform sampler2D u_layer2;\n  
uniform sampler2D u_layer3;\n  uniform float u_opacity0;\n  uniform float 
u_opacity1;\n  uniform float u_opacity2;\n  uniform float u_opacity3;\n  uniform
int u_layerCount;\n  \n  varying vec2 v_texCoord;\n  \n  void main() {\n    vec4
color = vec4(0.0);\n    \n    if (u_layerCount > 0) {\n      color = 
texture2D(u_layer0, v_texCoord) * u_opacity0;\n    }\n    if (u_layerCount > 1) 
{\n      vec4 layer1 = texture2D(u_layer1, v_texCoord) * u_opacity1;\n      
color = mix(color, layer1, layer1.a);\n    }\n    if (u_layerCount > 2) {\n     
vec4 layer2 = texture2D(u_layer2, v_texCoord) * u_opacity2;\n      color = 
mix(color, layer2, layer2.a);\n    }\n    if (u_layerCount > 3) {\n      vec4 
layer3 = texture2D(u_layer3, v_texCoord) * u_opacity3;\n      color = mix(color,
layer3, layer3.a);\n    }\n    \n    gl_FragColor = color;\n  }\n`;\n\nfunction 
createShader(gl, type, source) {\n  const shader = gl.createShader(type);\n  
gl.shaderSource(shader, source);\n  gl.compileShader(shader);\n  if 
(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n    console.error('Shader
compile error:', gl.getShaderInfoLog(shader));\n    gl.deleteShader(shader);\n  
return null;\n  }\n  return shader;\n}\n\nfunction createProgram(gl, 
vertexShader, fragmentShader) {\n  const program = gl.createProgram();\n  
gl.attachShader(program, vertexShader);\n  gl.attachShader(program, 
fragmentShader);\n  gl.linkProgram(program);\n  if 
(!gl.getProgramParameter(program, gl.LINK_STATUS)) {\n    console.error('Program
link error:', gl.getProgramInfoLog(program));\n    return null;\n  }\n  return 
program;\n}\n\nexport class ParallaxDepthShader {\n  constructor(canvas, options
= {}) {\n    this.canvas = canvas;\n    this.gl = canvas.getContext('webgl', {\n
alpha: true,\n      antialias: false,\n      powerPreference: 
'high-performance',\n      preserveDrawingBuffer: false\n    }) || 
canvas.getContext('experimental-webgl');\n    \n    if (!this.gl) {\n      throw
new Error('WebGL not supported');\n    }\n    \n    this.layers = [];\n    
this.layerDepths = [];\n    this.maxLayers = options.maxLayers || 4;\n    
this.targetMouse = { x: 0.5, y: 0.5 };\n    this.currentMouse = { x: 0.5, y: 0.5
};\n    this.mouseVelocity = 0.2;\n    this.time = 0;\n    \n    
this.framebuffers = [];\n    this.textures = [];\n    \n    this.isInitialized =
false;\n  }\n  \n  init() {\n    const gl = this.gl;\n    \n    const 
vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);\n    
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 
fragmentShaderSource);\n    this.program = createProgram(gl, vertexShader, 
fragmentShader);\n    \n    const compVertexShader = createShader(gl, 
gl.VERTEX_SHADER, compositeVertexShader);\n    const compFragmentShader = 
createShader(gl, gl.FRAGMENT_SHADER, compositeFragmentShader);\n    
this.compositeProgram = createProgram(gl, compVertexShader, 
compFragmentShader);\n    \n    this.positionBuffer = gl.createBuffer();\n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\n    
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      -1, -1, 1, -1, -1, 1,\n
-1, 1, 1, -1, 1, 1\n    ]), gl.STATIC_DRAW);\n    \n    this.texCoordBuffer = 
gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n  
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      0, 0, 1, 0, 0, 1,\n    
0, 1, 1, 0, 1, 1\n    ]), gl.STATIC_DRAW);\n    \n    this.setupLocations();\n  
this.setupFramebuffers();\n    \n    gl.enable(gl.BLEND);\n    
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);\n    \n    this.resize();\n 
this.isInitialized = true;\n    \n    return this;\n  }\n  \n  setupLocations() 
{\n    const gl = this.gl;\n    \n    this.locations = {\n      position: 
gl.getAttribLocation(this.program, 'a_position'),\n      texCoord: 
gl.getAttribLocation(this.program, 'a_texCoord'),\n      time: 
gl.getUniformLocation(this.program, 'u_time'),\n      resolution: 
gl.getUniformLocation(this.program, 'u_resolution'),\n      mouse: 
gl.getUniformLocation(this.program, 'u_mouse'),\n      depth: 
gl.getUniformLocation(this.program, 'u_depth'),\n      texture: 
gl.getUniformLocation(this.program, 'u_texture')\n    };\n    \n    
this.compositeLocations = {\n      position: 
gl.getAttribLocation(this.compositeProgram, 'a_position'),\n      texCoord: 
gl.getAttribLocation(this.compositeProgram, 'a_texCoord'),\n      layer0: 
gl.getUniformLocation(this.compositeProgram, 'u_layer0'),\n      layer1: 
gl.getUniformLocation(this.compositeProgram, 'u_layer1'),\n      layer2: 
gl.getUniformLocation(this.compositeProgram, 'u_layer2'),\n      layer3: 
gl.getUniformLocation(this.compositeProgram, 'u_layer3'),\n      opacity0: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity0'),\n      opacity1: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity1'),\n      opacity2: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity2'),\n      opacity3: 
gl.getUniformLocation(this.compositeProgram, 'u_opacity3'),\n      layerCount: 
gl.getUniformLocation(this.compositeProgram, 'u_layerCount')\n    };\n  }\n  \n 
setupFramebuffers() {\n    const gl = this.gl;\n    \n    for (let i = 0; i < 
this.maxLayers; i++) {\n      const texture = gl.createTexture();\n      
gl.bindTexture(gl.TEXTURE_2D, texture);\n      gl.texImage2D(gl.TEXTURE_2D, 0, 
gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n      
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n      \n 
const framebuffer = gl.createFramebuffer();\n      
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);\n      
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, 
texture, 0);\n      \n      this.framebuffers.push(framebuffer);\n      
this.textures.push(texture);\n    }\n    \n    
gl.bindFramebuffer(gl.FRAMEBUFFER, null);\n  }\n  \n  resize() {\n    const gl =
this.gl;\n    const displayWidth = this.canvas.clientWidth;\n    const 
displayHeight = this.canvas.clientHeight;\n    \n    if (this.canvas.width !== 
displayWidth || this.canvas.height !== displayHeight) {\n      this.canvas.width
= displayWidth;\n      this.canvas.height = displayHeight;\n      gl.viewport(0,
0, displayWidth, displayHeight);\n      \n      for (let i = 0; i < 
this.maxLayers; i++) {\n        gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\n        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
displayWidth, displayHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);\n      }\n    
}\n  }\n  \n  addLayer(image, depth = 0) {\n    if (this.layers.length >= 
this.maxLayers) {\n      console.warn('Max layers reached');\n      return -1;\n
}\n    \n    const gl = this.gl;\n    const texture = gl.createTexture();\n    
gl.bindTexture(gl.TEXTURE_2D, texture);\n    gl.texImage2D(gl.TEXTURE_2D, 0, 
gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\n    gl.texParameteri(gl.TEXTURE_2D,
gl.TEXTURE_MIN_FILTER, gl.LINEAR);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_MAG_FILTER, gl.LINEAR);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, 
gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n    \n    const index = 
this.layers.length;\n    this.layers.push({ texture, width: image.width, height:
image.height });\n    this.layerDepths[index] = depth;\n    \n    return 
index;\n  }\n  \n  setDepth(layer, depth) {\n    if (layer >= 0 && layer < 
this.layerDepths.length) {\n      this.layerDepths[layer] = depth;\n    }\n  }\n
\n  setMouse(x, y) {\n    this.targetMouse.x = Math.max(0, Math.min(1, x));\n   
this.targetMouse.y = Math.max(0, Math.min(1, y));\n  }\n  \n  update(deltaTime) 
{\n    if (!this.isInitialized) return;\n    \n    const dt = Math.min(deltaTime
/ 1000, 0.1);\n    const smoothing = Math.min(this.mouseVelocity * dt * 60, 
1);\n    \n    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x)
* smoothing;\n    this.currentMouse.y += (this.targetMouse.y - 
this.currentMouse.y) * smoothing;\n    \n    this.time += dt;\n  }\n  \n  
renderLayer(layerIndex) {\n    const gl = this.gl;\n    const layer = 
this.layers[layerIndex];\n    \n    gl.bindFramebuffer(gl.FRAMEBUFFER, 
this.framebuffers[layerIndex]);\n    gl.useProgram(this.program);\n    \n    
gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);\n    
gl.enableVertexAttribArray(this.locations.position);\n    
gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);\n    
\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n    
gl.enableVertexAttribArray(this.locations.texCoord);\n    
gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 0, 0);\n    
\n    gl.uniform1f(this.locations.time, this.time);\n    
gl.uniform2f(this.locations.resolution, this.canvas.width, 
this.canvas.height);\n    gl.uniform2f(this.locations.mouse, 
this.currentMouse.x, this.currentMouse.y);\n    
gl.uniform1f(this.locations.depth, this.layerDepths[layerIndex] || 0);\n    \n  
gl.activeTexture(gl.TEXTURE0);\n    gl.bindTexture(gl.TEXTURE_2D, 
layer.texture);\n    gl.uniform1i(this.locations.texture, 0);\n    \n    
gl.drawArrays(gl.TRIANGLES, 0, 6);\n  }\n  \n  composite() {\n    const gl = 
this.gl;\n    \n    gl.bindFramebuffer(gl.FRAMEBUFFER, null);\n    
gl.useProgram(this.compositeProgram);\n    \n    gl.bindBuffer(gl.ARRAY_BUFFER, 
this.positionBuffer);\n    
gl.enableVertexAttribArray(this.compositeLocations.position);\n    
gl.vertexAttribPointer(this.compositeLocations.position, 2, gl.FLOAT, false, 0, 
0);\n    \n    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);\n    
gl.enableVertexAttribArray(this.compositeLocations.texCoord);\n    
gl.vertexAttribPointer(this.compositeLocations.texCoord, 2, gl.FLOAT, false, 0, 
0);\n    \n    for (let i = 0; i < this.maxLayers; i++) {\n      
gl.activeTexture(gl.TEXTURE0 + i);\n      gl.bindTexture(gl.TEXTURE_2D, 
this.textures[i]);\n      gl.uniform1i(this.compositeLocations[`layer${i}`], 
i);\n      gl.uniform1f(this.compositeLocations[`opacity${i}`], i < 
this.layers.length ? 1.0 : 0.0);\n    }\n    \n    
gl.uniform1i(this.compositeLocations.layerCount, this.layers.length);\n    \n   
gl.drawArrays(gl.TRIANGLES, 0, 6);\n  }\n  \n  render() {\n    if 
(!this.isInitialized || this.layers.length === 0) return;\n    \n    
this.resize();\n    \n    const gl = this.gl;\n    gl.clearColor(0, 0, 0, 0);\n 
gl.clear(gl.COLOR_BUFFER_BIT);\n    \n    for (let i = 0; i < 
this.layers.length; i++) {\n      this.renderLayer(i);\n    }\n    \n    
this.composite();\n  }\n  \n  destroy() {\n    const gl = this.gl;\n    \n    
this.layers.forEach(layer => {\n      gl.deleteTexture(layer.texture);\n    
});\n    \n    this.framebuffers.forEach(fb => {\n      
gl.deleteFramebuffer(fb);\n    });\n    \n    this.textures.forEach(tex => {\n  
gl.deleteTexture(tex);\n    });\n    \n    
gl.deleteBuffer(this.positionBuffer);\n    
gl.deleteBuffer(this.texCoordBuffer);\n    gl.deleteProgram(this.program);\n    
gl.deleteProgram(this.compositeProgram);\n    \n    this.isInitialized = 
false;\n  }\n}\n\nexport default ParallaxDepthShader;\n```"
)
StatusUpdate(
    context_usage=0.039440155029296875,
    token_usage=TokenUsage(
        input_other=2147,
        output=3425,
        input_cache_read=8192,
        input_cache_creation=0
    ),
    message_id='chatcmpl-IG09BLWO5EqK0SPGAIboWZnl'
)
