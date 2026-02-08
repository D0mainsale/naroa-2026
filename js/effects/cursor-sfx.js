/**
 * CURSOR & SOUND EFFECTS SYSTEM
 * Enhanced pointers and reactive UI sounds for Naroa's portfolio
 */

// 1. SOUND LIBRARY
const SFX = {
    hover: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3'),
    click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3'),
    soft:  new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3')
};

// Preload and adjust volumes
Object.values(SFX).forEach(sound => {
    sound.volume = 0.2;
    sound.load();
});

class CursorManager {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursorDot = document.createElement('div');
        this.init();
    }

    init() {
        // Create custom cursor DOM
        this.cursor.className = 'custom-cursor';
        this.cursorDot.className = 'custom-cursor-dot';
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);

        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                width: 40px;
                height: 40px;
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: transform 0.1s ease, width 0.3s, height 0.3s, background 0.3s;
                mix-blend-mode: difference;
            }
            .custom-cursor-dot {
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: transform 0.05s ease;
            }
            .custom-cursor.hovered {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border-color: transparent;
                backdrop-filter: blur(2px);
            }
            .custom-cursor.clicking {
                transform: translate(-50%, -50%) scale(0.8);
            }
            @media (max-width: 768px) {
                .custom-cursor, .custom-cursor-dot { display: none; }
            }
        `;
        document.head.appendChild(style);

        this.bindEvents();
    }

    bindEvents() {
        // Movement
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            this.cursorDot.style.left = e.clientX + 'px';
            this.cursorDot.style.top = e.clientY + 'px';
        });

        // Hover States
        document.addEventListener('mouseover', (e) => {
            // Check if interactive element
            if (e.target.matches('a, button, input, textarea, .interactive, [role="button"]')) {
                this.cursor.classList.add('hovered');
                this.playHover();
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('a, button, input, textarea, .interactive, [role="button"]')) {
                this.cursor.classList.remove('hovered');
            }
        });

        // Click States
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('clicking');
            this.playClick();
        });

        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('clicking');
        });
    }

    playHover() {
        // Debouce minimal
        const sound = SFX.hover.cloneNode();
        sound.volume = 0.1;
        sound.play().catch(() => {}); // Catch autoplay restrictions
    }

    playClick() {
        const sound = SFX.click.cloneNode();
        sound.volume = 0.2;
        sound.play().catch(() => {});
    }
}

// Init when safe
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CursorManager());
} else {
    new CursorManager();
}
