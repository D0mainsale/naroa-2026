/**
 * MICA INTERACTIONS - Sistema de interacciones del Hero
 * Incluye: Botones magnéticos, Cursor custom, Voice visualizer, Easter eggs
 */

class MicaInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupMagneticButtons();
        this.setupCustomCursor();
        this.setupEasterEggs();
        console.log('🎨 MICA Interactions initialized');
    }
    
    /* ==========================================
       BOTONES MAGNÉTICOS
       ========================================== */
    setupMagneticButtons() {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => this.handleMagneticMove(e, btn));
            btn.addEventListener('mouseleave', (e) => this.handleMagneticLeave(e, btn));
            btn.addEventListener('click', (e) => this.handleMagneticClick(e, btn));
        });
    }
    
    handleMagneticMove(e, btn) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Fuerza magnética suave
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
        
        // Crear partículas doradas al mover (10% probabilidad)
        if (Math.random() > 0.9) {
            this.crearParticulaBoton(btn, e.clientX - rect.left, e.clientY - rect.top);
        }
    }
    
    handleMagneticLeave(e, btn) {
        btn.style.transform = 'translate(0, 0) scale(1)';
    }
    
    handleMagneticClick(e, btn) {
        // Efecto ripple dorado
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background: rgba(255, 215, 0, 0.6);
            left: ${e.offsetX}px;
            top: ${e.offsetY}px;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
        `;
        
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    
    crearParticulaBoton(btn, x, y) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        btn.appendChild(particle);
        
        const destinoX = (Math.random() - 0.5) * 100;
        const destinoY = (Math.random() - 0.5) * 100;
        
        particle.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${destinoX}px, ${destinoY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => particle.remove();
    }
    
    /* ==========================================
       CURSOR PERSONALIZADO
       ========================================== */
    setupCustomCursor() {
        // Solo en desktop
        if (window.innerWidth < 768) return;
        
        const cursor = document.createElement('div');
        cursor.className = 'cursor-mica';
        document.body.appendChild(cursor);
        
        const aura = document.createElement('div');
        aura.className = 'cursor-aura';
        document.body.appendChild(aura);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            
            // Aura con delay suave
            setTimeout(() => {
                aura.style.left = e.clientX - 20 + 'px';
                aura.style.top = e.clientY - 20 + 'px';
            }, 50);
        });
        
        // Detectar hover en elementos interactivos
        document.querySelectorAll('button, a, input, .magnetic-btn').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }
    
    /* ==========================================
       EASTER EGGS
       ========================================== */
    setupEasterEggs() {
        document.addEventListener('mica-easter-egg', (e) => {
            if (e.detail.tipo === 'ostia') {
                this.activarFlashDorado();
                this.acelerarParticulasAvatar();
            }
        });
    }
    
    activarFlashDorado() {
        const flash = document.createElement('div');
        flash.className = 'easter-egg-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 500);
    }
    
    acelerarParticulasAvatar() {
        // Si existe el avatar 3D, acelerar sus partículas momentáneamente
        if (window.micaAvatar && window.micaAvatar.aura) {
            const uniformTime = window.micaAvatar.aura.material.uniforms.uTime;
            const valorOriginal = uniformTime.value;
            
            // Acelerar x3 durante 2 segundos
            const interval = setInterval(() => {
                uniformTime.value += 0.05;
            }, 16);
            
            setTimeout(() => {
                clearInterval(interval);
                uniformTime.value = valorOriginal;
            }, 2000);
        }
    }
}

// Voice Visualizer (separado porque usa Web Audio API)
class VoiceVisualizer {
    constructor(canvasId = 'voiceCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    async iniciar(audioStream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(this.analyser);
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        this.dibujar();
    }
    
    detener() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    dibujar() {
        this.animationId = requestAnimationFrame(() => this.dibujar());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
            
            // Gradiente dorado basado en intensidad
            const intensidad = this.dataArray[i] / 255;
            const gradiente = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradiente.addColorStop(0, `rgba(255, 215, 0, ${0.3 + intensidad * 0.7})`);
            gradiente.addColorStop(1, `rgba(255, 69, 0, ${intensidad})`);
            
            this.ctx.fillStyle = gradiente;
            
            // Barras con bordes redondeados (fallback manual si no existe roundRect)
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight, 5);
            } else {
                this.ctx.rect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
            }
            this.ctx.fill();
            
            x += barWidth + 1;
        }
        
        // Línea central pulsante
        const promedio = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
        this.ctx.strokeStyle = `rgba(255, 215, 0, ${promedio / 255})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }
}

// Auto-inicializar
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.micaInteractions = new MicaInteractions();
        
        if (document.getElementById('voiceCanvas')) {
            window.voiceVisualizer = new VoiceVisualizer();
        }
    });
}

export { MicaInteractions, VoiceVisualizer };
