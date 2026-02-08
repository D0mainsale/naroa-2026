/**
 * Charcoal Shader Effect - Naroa 2026
 * ====================================
 * Efecto de textura carboncillo sobre imágenes
 * 
 * TODO: Implementar WebGL shader con:
 * - Grain texture overlay
 * - Contrast adjustment
 * - Edge detection para efecto carboncillo
 * 
 * @author Kimi 2.5 CLI
 */

const CharcoalShader = (() => {
  // Configuración
  const config = {
    intensity: 0.7,
    grainSize: 2.5,
    contrast: 1.3,
    enabled: true
  };

  // Canvas y contexto WebGL
  let canvas = null;
  let gl = null;
  let program = null;

  // Vertex shader
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader - Efecto carboncillo
  const fragmentShaderSource = `
    precision mediump float;
    
    uniform sampler2D u_image;
    uniform float u_intensity;
    uniform float u_grainSize;
    uniform float u_contrast;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    varying vec2 v_texCoord;
    
    // Noise function para grain
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Edge detection (Sobel)
    float sobel(sampler2D tex, vec2 uv, vec2 resolution) {
      vec2 texel = 1.0 / resolution;
      
      float tl = dot(texture2D(tex, uv + vec2(-texel.x, texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      float  l = dot(texture2D(tex, uv + vec2(-texel.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
      float bl = dot(texture2D(tex, uv + vec2(-texel.x, -texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      float  t = dot(texture2D(tex, uv + vec2(0.0, texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      float  b = dot(texture2D(tex, uv + vec2(0.0, -texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      float tr = dot(texture2D(tex, uv + vec2(texel.x, texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      float  r = dot(texture2D(tex, uv + vec2(texel.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
      float br = dot(texture2D(tex, uv + vec2(texel.x, -texel.y)).rgb, vec3(0.299, 0.587, 0.114));
      
      float x = tl + 2.0*l + bl - tr - 2.0*r - br;
      float y = tl + 2.0*t + tr - bl - 2.0*b - br;
      
      return sqrt(x*x + y*y);
    }
    
    void main() {
      vec4 color = texture2D(u_image, v_texCoord);
      
      // Convertir a escala de grises
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      // Edge detection
      float edge = sobel(u_image, v_texCoord, u_resolution);
      
      // Grain texture
      vec2 grainCoord = v_texCoord * u_resolution / u_grainSize;
      float grain = random(grainCoord + u_time * 0.001);
      
      // Combinar: base gris + edges oscuros + grain
      float charcoal = gray;
      charcoal -= edge * u_intensity;
      charcoal += (grain - 0.5) * 0.1 * u_intensity;
      
      // Aplicar contraste
      charcoal = (charcoal - 0.5) * u_contrast + 0.5;
      charcoal = clamp(charcoal, 0.0, 1.0);
      
      // Color final con tono sepia suave
      vec3 sepia = vec3(0.95, 0.90, 0.85);
      vec3 finalColor = charcoal * sepia;
      
      gl_FragColor = vec4(finalColor, color.a);
    }
  `;

  /**
   * Inicializa el shader WebGL
   */
  function init(targetCanvas) {
    canvas = targetCanvas;
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('CharcoalShader: WebGL no soportado, usando fallback CSS');
      return false;
    }

    // Compilar shaders
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return false;

    // Crear programa
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('CharcoalShader: Error linking program');
      return false;
    }

    return true;
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('CharcoalShader: Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  /**
   * Aplica efecto a una imagen
   */
  function apply(imageElement, options = {}) {
    const opts = { ...config, ...options };
    
    // Fallback CSS si WebGL no disponible
    if (!gl) {
      imageElement.style.filter = `grayscale(${opts.intensity * 100}%) contrast(${opts.contrast})`;
      return;
    }

    // TODO: Implementar renderizado WebGL completo
  }

  /**
   * Elimina el efecto
   */
  function remove(imageElement) {
    imageElement.style.filter = '';
  }

  /**
   * Actualiza configuración
   */
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  // API pública
  return {
    init,
    apply,
    remove,
    setConfig,
    get config() { return { ...config }; }
  };
})();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.CharcoalShader = CharcoalShader;
}

export default CharcoalShader;
