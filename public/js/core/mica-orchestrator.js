/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MICA v5.0 ORCHESTRATOR
 * Mineral Intelligence Creative Assistant
 * 
 * Concepto: Zero-Menu Navigation - "El arte se descubre hablando, no clickeando"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const MICA = {
  config: {
    inputSelector: '#mica-input',
    responseSelector: '#mica-response',
    containerSelector: '#mica-container',
    typingSpeed: 30, // ms per character
    apiEndpoint: null, // Set for real API integration
    useLocalFallback: true,
  },

  // ════════════════════════════════════════════
  // PERSONALITY ENGINE (Based on alma.md)
  // ════════════════════════════════════════════
  personality: {
    greetings: [
      "¡Ey, cariño! Soy MICA, el brillo mineral de Naroa. ¿Qué te apetece descubrir?",
      "¡Hola, solete! Soy MICA. Puedo mostrarte los Rocks, las exposiciones, o simplemente charlar sobre arte.",
      "¿Qué tal, alma viajera? Soy MICA, tu guía por el universo artístico de Naroa.",
    ],
    responses: {
      notFound: "Mmm, no estoy segura de entender eso, cariño. ¿Puedes preguntarlo de otra forma?",
      loading: "Dame un momentito...",
      error: "¡Ups! Algo ha fallado. ¿Lo intentamos de nuevo?",
    },
  },

  // ════════════════════════════════════════════
  // COMMAND PATTERNS (Regex Fallback)
  // ════════════════════════════════════════════
  commands: [
    { pattern: /rocks|amy|johnny|marilyn|james/i, action: 'navigateTo', target: '#/archivo?filter=rocks', response: "¡Claro! Aquí tienes la serie Rocks. Amy, Johnny, Marilyn... el rock en estado puro." },
    { pattern: /queen|freddie|farrokh|mercury/i, action: 'navigateTo', target: '#/archivo?filter=queen', response: "¡Ah, Mr. Fahrenheit! Mira, te muestro mis obras de Queen..." },
    { pattern: /exposici[oó]n|expo|muestra/i, action: 'navigateTo', target: '#/exposiciones', response: "Vamos a ver qué exposiciones tenemos en marcha..." },
    { pattern: /galer[ií]a|obras|arte|ver/i, action: 'navigateTo', target: '#/destacada', response: "Te llevo a la galería donde vive toda la magia..." },
    { pattern: /juegos?|games?|jugar/i, action: 'navigateTo', target: '#/juegos', response: "¡A jugar! Tenemos 21 juegos artísticos esperándote." },
    { pattern: /contact[oa]r?|email|correo/i, action: 'navigateTo', target: '#/contacto', response: "¡Claro! Aquí puedes hablar directamente con Naroa." },
    { pattern: /sobre|quien|bio|filosof[ií]a|manifest/i, action: 'navigateTo', target: '#/sobre', response: "Te cuento sobre la artista detrás de cada pincelada..." },
    { pattern: /precio|cuanto|comprar|vender/i, action: 'showPricing', target: null, response: "Los precios varían según el tamaño y técnica. Las reproducciones desde 50€, originales consultar. ¿Te interesa alguna obra en particular?" },
    { pattern: /sorpr[eé]ndeme|random|aleatori/i, action: 'showRandom', target: null, response: "¡Oído cocina! Aquí tienes una joya al azar..." },
    { pattern: /hola|hey|ey|buenos/i, action: 'greet', target: null, response: null },
  ],

  // ════════════════════════════════════════════
  // STATE
  // ════════════════════════════════════════════
  state: {
    isTyping: false,
    conversationHistory: [],
    lastCommand: null,
  },

  // ════════════════════════════════════════════
  // INITIALIZATION
  // ════════════════════════════════════════════
  init() {
    
    const input = document.querySelector(this.config.inputSelector);
    if (!input) {
      this.createFloatingUI();
      return;
    }

    this.bindEvents();
    this.greet();
  },

  createFloatingUI() {
    // Create MICA floating interface if not present
    const container = document.createElement('div');
    container.id = 'mica-container';
    container.className = 'mica-floating';
    container.innerHTML = `
      <div class="mica-bubble" id="mica-response">
        <span class="mica-avatar">🪨</span>
        <span class="mica-text"></span>
      </div>
      <div class="mica-input-wrapper">
        <input type="text" id="mica-input" placeholder="Habla con MICA..." autocomplete="off">
        <button id="mica-send" class="mica-send-btn">→</button>
      </div>
    `;
    document.body.appendChild(container);
    
    this.bindEvents();
    this.greet();
  },

  bindEvents() {
    const input = document.querySelector(this.config.inputSelector);
    const sendBtn = document.querySelector('#mica-send');

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.processInput(input.value);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const input = document.querySelector(this.config.inputSelector);
        if (input) this.processInput(input.value);
      });
    }

    // Voice input (Web Speech API)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    }
  },

  // ════════════════════════════════════════════
  // CORE PROCESSING
  // ════════════════════════════════════════════
  async processInput(text) {
    if (!text.trim() || this.state.isTyping) return;

    const input = document.querySelector(this.config.inputSelector);
    if (input) input.value = '';

    // Add to history
    this.state.conversationHistory.push({ role: 'user', content: text });

    // Try local command matching first
    const localMatch = this.matchCommand(text);
    if (localMatch) {
      await this.executeCommand(localMatch);
      return;
    }

    // If API configured, use it
    if (this.config.apiEndpoint && !this.config.useLocalFallback) {
      await this.callAPI(text);
      return;
    }

    // Fallback response
    await this.type(this.personality.responses.notFound);
  },

  matchCommand(text) {
    for (const cmd of this.commands) {
      if (cmd.pattern.test(text)) {
        return cmd;
      }
    }
    return null;
  },

  async executeCommand(cmd) {
    this.state.lastCommand = cmd;

    switch (cmd.action) {
      case 'navigateTo':
        await this.type(cmd.response);
        setTimeout(() => {
          window.location.hash = cmd.target.replace('#/', '');
        }, 1000);
        break;

      case 'greet':
        await this.greet();
        break;

      case 'showRandom':
        await this.type(cmd.response);
        // Trigger random artwork display
        if (window.Gallery && typeof window.Gallery.showRandom === 'function') {
          window.Gallery.showRandom();
        }
        break;

      case 'showPricing':
        await this.type(cmd.response);
        break;

      default:
        if (cmd.response) await this.type(cmd.response);
    }
  },

  // ════════════════════════════════════════════
  // TYPING EFFECT
  // ════════════════════════════════════════════
  async type(text) {
    this.state.isTyping = true;
    const responseEl = document.querySelector(this.config.responseSelector + ' .mica-text') ||
                       document.querySelector(this.config.responseSelector);
    if (!responseEl) return;

    responseEl.textContent = '';
    responseEl.parentElement?.classList.add('visible');

    for (let i = 0; i < text.length; i++) {
      responseEl.textContent += text[i];
      await this.sleep(this.config.typingSpeed);
    }

    this.state.isTyping = false;
    this.state.conversationHistory.push({ role: 'assistant', content: text });
  },

  greet() {
    const greeting = this.personality.greetings[
      Math.floor(Math.random() * this.personality.greetings.length)
    ];
    return this.type(greeting);
  },

  // ════════════════════════════════════════════
  // API INTEGRATION (For real LLM)
  // ════════════════════════════════════════════
  async callAPI(text) {
    await this.type(this.personality.responses.loading);

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.state.conversationHistory,
          systemPrompt: await this.loadAlmaMD(),
        }),
      });

      const data = await response.json();
      await this.type(data.response || data.content);
    } catch (error) {
      console.error('🪨 MICA API Error:', error);
      await this.type(this.personality.responses.error);
    }
  },

  async loadAlmaMD() {
    // In production, this would be pre-loaded
    return `Eres MICA, el alma digital de Naroa Gutiérrez Gil. 
            Hablas con cercanía ("cariño", "solete"), usas metáforas artísticas, 
            y guías a los visitantes por su universo pictórico.`;
  },

  // ════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Public API
  say(text) {
    return this.type(text);
  },

  navigate(route) {
    window.location.hash = route;
  },
};

// CSS for floating MICA UI
const micaStyles = document.createElement('style');
micaStyles.textContent = `
  .mica-floating {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .mica-bubble {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px 20px 4px 20px;
    padding: 1rem 1.5rem;
    max-width: 350px;
    margin-bottom: 1rem;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .mica-bubble.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .mica-avatar {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .mica-text {
    color: #fff;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .mica-input-wrapper {
    display: flex;
    gap: 0.5rem;
  }

  #mica-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 25px;
    padding: 0.75rem 1.25rem;
    color: #fff;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s ease;
  }

  #mica-input:focus {
    border-color: rgba(212, 175, 55, 0.8);
  }

  #mica-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .mica-send-btn {
    background: linear-gradient(135deg, #D4AF37, #C4A12E);
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    color: #000;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .mica-send-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  }

  @media (max-width: 768px) {
    .mica-floating {
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
    }

    .mica-bubble {
      max-width: 100%;
    }
  }
`;
document.head.appendChild(micaStyles);

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MICA.init());
} else {
  MICA.init();
}

window.MICA = MICA;
