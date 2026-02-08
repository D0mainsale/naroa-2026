/**
 * WebGL Noise Background Shader
 * Multi-octave Simplex noise with organic movement
 * Optimized for 60fps on mobile devices
 */

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_colorA;
uniform vec3 u_colorB;

// Simplex noise functions optimized for mobile
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

// Simplex 2D noise
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Fractional Brownian Motion - 4 octaves
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Slow animation (0.2x speed)
    float t = u_time * 0.2;
    
    // Create organic movement with multiple layers
    vec2 q = vec2(
        fbm(uv + t * 0.15),
        fbm(uv + vec2(1.0) + t * 0.12)
    );
    
    vec2 r = vec2(
        fbm(uv + q + vec2(1.7, 9.2) + t * 0.08),
        fbm(uv + q + vec2(8.3, 2.8) + t * 0.10)
    );
    
    float f = fbm(uv + r * 0.5);
    
    // Map to 0-1 range with soft contrast
    f = f * 0.5 + 0.5;
    f = smoothstep(0.2, 0.8, f);
    
    // Mix colors  
    vec3 color = mix(u_colorA, u_colorB, f);
    
    // Subtle vignette
    float vignette = 1.0 - length((uv - 0.5) * 0.8);
    vignette = smoothstep(0.0, 1.0, vignette);
    color *=  0.9 + 0.1 * vignette;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

export class NoiseBackground {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        this.startTime = performance.now();
        
        this.locations = {
            time: null,
            resolution: null,
            colorA: null,
            colorB: null,
            position: null
        };
        
        this.colorA = [0.08, 0.08, 0.12];
        this.colorB = [0.15, 0.18, 0.25];
    }

    async init(canvas, colorA, colorB) {
        this.canvas = canvas;
       
        this.gl = canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            powerPreference: 'low-power'
        }) || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return false;
        }
        
        if (colorA) this.colorA = colorA;
        if (colorB) this.colorB = colorB;
        
        this.program = this.createProgram();
        if (!this.program) return false;

        this.locations.time = this.gl.getUniformLocation(this.program, 'u_time');
        this.locations.resolution = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.locations.colorA = this.gl.getUniformLocation(this.program, 'u_colorA');
        this.locations.colorB = this.gl.getUniformLocation(this.program, 'u_colorB');
        this.locations.position = this.gl.getAttribLocation(this.program, 'a_position');
        
        this.createBuffer();
        this.resize();
        this.animate();
        
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
        
        return this;
    }

    createProgram() {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = this.createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        
        if (!vs || !fs) return null;
        
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    createShader(type, source) {
        const gl = this.gl;
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

    createBuffer() {
        const gl = this.gl;
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
        ]);
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
        const displayHeight = Math.floor(this.canvas.clientHeight * dpr);
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }

    setColors(colorA, colorB) {
        this.colorA = colorA;
        this.colorB = colorB;
    }

    animate() {
        const gl = this.gl;
        const time = (performance.now() - this.startTime) / 1000;
        
        gl.useProgram(this.program);
        
        gl.uniform1f(this.locations.time, time);
        gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        gl.uniform3f(this.locations.colorA, this.colorA[0], this.colorA[1], this.colorA[2]);
        gl.uniform3f(this.locations.colorB, this.colorB[0], this.colorB[1], this.colorB[2]);
        
        gl.enableVertexAttribArray(this.locations.position);
        gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update() {
        this.startTime = performance.now();
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resizeHandler);
        
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}

export default NoiseBackground;
