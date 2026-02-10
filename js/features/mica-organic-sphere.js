/**
 * MICA ORGANIC SPHERE — PEBBLE WEAVER
 * Multimodal interaction using Gemini 3 Flash reasoning, Mediapipe hand tracking, and Organic Physics.
 */

class MicaOrganicSphere {
    constructor() {
        this.active = false;
        this.canvas = null;
        this.ctx = null;
        this.pebbles = [];
        this.launcher = { x: 0, y: 0, active: false };
        this.handPos = { x: 0, y: 0 };
        this.micaAdvice = "Esperando gesto... Pincha el aire para atraer una piedra.";
        
        this.colors = {
            tierra: '#3d2b1f',
            petrichor: '#78909c',
            gold: '#d4af37',
            charcoal: '#1a1a1a',
            red: '#ff003c'
        };

        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
        this.loop();
    }

    createElements() {
        this.container = document.createElement('div');
        this.container.className = 'mica-organic-sphere';
        this.container.innerHTML = `
            <canvas id="mos-canvas"></canvas>
            <div class="mos-overlay">
                <div class="mos-header">
                    <div class="mos-status">
                        <h3>MICA Reasoning</h3>
                        <p id="mos-advice">${this.micaAdvice}</p>
                    </div>
                    <div class="mos-close" id="mos-close">✕</div>
                </div>
                <div class="mos-hints">
                    <div class="mos-hint">Pinch & Pull to release</div>
                    <div class="mos-hint">Vocal: "Kintsugi" for repair</div>
                </div>
            </div>
        `;
        document.body.appendChild(this.container);

        this.canvas = document.getElementById('mos-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        document.getElementById('mos-close').addEventListener('click', () => this.close());
        
        // Mobile gesture simulation (will be replaced by Mediapipe)
        this.canvas.addEventListener('mousedown', (e) => this.startLance(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateLance(e));
        this.canvas.addEventListener('mouseup', (e) => this.releaseLance(e));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    open() {
        this.active = true;
        this.container.classList.add('active');
        this.spawnInitialPebbles();
    }

    close() {
        this.active = false;
        this.container.classList.remove('active');
    }

    spawnInitialPebbles() {
        this.pebbles = [];
        for (let i = 0; i < 20; i++) {
            this.pebbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height * 0.5),
                r: 15 + Math.random() * 20,
                color: Math.random() > 0.5 ? this.colors.tierra : this.colors.petrichor,
                type: 'target'
            });
        }
    }

    startLance(e) {
        this.launcher.active = true;
        this.launcher.x = e.clientX;
        this.launcher.y = e.clientY;
    }

    updateLance(e) {
        if (!this.launcher.active) return;
        this.handPos.x = e.clientX;
        this.handPos.y = e.clientY;
    }

    releaseLance(e) {
        if (!this.launcher.active) return;
        this.launcher.active = false;
        // Logic to shoot a stone will go here
    }

    drawOrganicStone(ctx, x, y, r, color) {
        ctx.save();
        ctx.beginPath();
        const steps = 8;
        for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const wobble = Math.sin(angle * 3) * (r * 0.2);
            const px = x + Math.cos(angle) * (r + wobble);
            const py = y + Math.sin(angle) * (r + wobble);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Texture highlights
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
        ctx.restore();
    }

    drawLauncher() {
        if (!this.launcher.active) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.launcher.x, this.launcher.y);
        this.ctx.lineTo(this.handPos.x, this.handPos.y);
        this.ctx.strokeStyle = this.colors.gold;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    loop() {
        if (!this.active) {
            requestAnimationFrame(() => this.loop());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Pebbles
        this.pebbles.forEach(p => {
            this.drawOrganicStone(this.ctx, p.x, p.y, p.r, p.color);
        });

        this.drawLauncher();

        requestAnimationFrame(() => this.loop());
    }
}

// Export for integration
window.MicaOrganicSphere = new MicaOrganicSphere();
