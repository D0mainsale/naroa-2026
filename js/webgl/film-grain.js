/**
 * Film Grain / Cinematic Texture WebGL Shader
 * Animated grain overlay effect for artistic photography
 * Optimized for 60fps mobile performance
 */

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 v_texCoord;

uniform sampler2D u_texture;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_grainIntensity;

// Simple hash for random grain
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Film grain noise
float grain(vec2 uv, float time) {
    vec2 seed = uv * u_resolution + time * 0.5;
    return hash(seed) * 2.0 - 1.0;
}

// Vignette effect
float vignette(vec2 uv, float intensity) {
    uv = uv * 2.0 - 1.0;
    float dist = length(uv);
    return 1.0 - smoothstep(0.5, 1.5, dist * intensity);
}

void main() {
    vec2 uv = v_texCoord;
    
    // Sample base texture
    vec4 color = texture2D(u_texture, uv);
    
    // Add animated grain
    float grainValue = grain(uv, u_time) * u_grainIntensity;
    color.rgb += grainValue;
    
    // Subtle vignette
    float vig = vignette(uv, 0.8);
    color.rgb *= vig;
    
    gl_FragColor = color;
}
`;

export class FilmGrainEffect {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.intensity = 0.05;
        this.sourceTexture = null;
        
        this.uniforms = {};
        this.buffers = {};
    }

    async init(canvas) {
        this.canvas = canvas;
        
        this.gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return false;
        }
        
        this.program = this.createProgram();
        if (!this.program) return false;
        
        this.uniforms = {
            texture: this.gl.getUniformLocation(this.program, 'u_texture'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            grainIntensity: this.gl.getUniformLocation(this.program, 'u_grainIntensity')
        };
        
        this.createBuffers();
        this.resize();
        
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
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createBuffers() {
        const gl = this.gl;
        
        const positions = new Float32Array([
            -1, -1,   1, -1,   -1, 1,
            -1,  1,   1, -1,    1, 1
        ]);
        
        const texCoords = new Float32Array([
            0, 0,   1, 0,   0, 1,
            0, 1,   1, 0,   1, 1
        ]);
        
        this.buffers.position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        this.buffers.texCoord = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.floor(this.canvas.clientWidth * dpr);
        this.canvas.height = Math.floor(this.canvas.clientHeight * dpr);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    apply(sourceTexture, intensity = this.intensity) {
        const gl = this.gl;
        
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform1i(this.uniforms.texture, 0);
        gl.uniform1f(this.uniforms.time, performance.now() / 1000);
        gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.uniforms.grainIntensity, intensity);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
        
        // Draw
        this.setupAttributes();
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    setupAttributes() {
        const gl = this.gl;
        
        const posLoc = gl.getAttribLocation(this.program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        
        const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
    }

    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
    }

    update() {
        // Automatically updates via apply()
    }

    dispose() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.buffers.position) this.gl.deleteBuffer(this.buffers.position);
        if (this.buffers.texCoord) this.gl.deleteBuffer(this.buffers.texCoord);
    }
}

export default FilmGrainEffect;
