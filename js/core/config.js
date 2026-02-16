/**
 * Naroa 2026 - Central Configuration Module
 * Unifies environment variables and feature toggles.
 */

const NaroaConfig = {
  // Security & API Keys
  api: {
    // OpenWeather / wttr.in config
    weather: {
      key: import.meta.env?.VITE_WEATHER_API_KEY || 'demo',
      provider: 'wttr' // Default to wttr.in which is free
    },
    // Gemini / LLM Config
    gemini: {
      key: import.meta.env?.VITE_GEMINI_API_KEY || null,
      model: 'gemini-2.0-flash'
    },
    // Soul Console Access
    soul: {
      secretCode: import.meta.env?.VITE_SOUL_SECRET || 'soul', // Fallback for MVP, should be hash in prod
      enabled: true
    },
    // Hugging Face API
    huggingface: {
      token: import.meta.env?.VITE_HF_TOKEN || 'hf_YOUR_TOKEN_HERE'
    }
  },

  // Web3 Configuration
  web3: {
    chain: {
      id: 8453,
      hex: '0x2105',
      name: 'Base',
      rpc: 'https://mainnet.base.org',
      explorer: 'https://basescan.org'
    },
    ipfs: {
      gateway: 'https://gateway.pinata.cloud/ipfs/'
    }
  },

  // Feature Flags
  features: {
    dynamicWeather: false, // User prefers fixed dark theme
    soulConsole: true,
    naroaParallax: true
  }
};

// Export to global scope for legacy compatibility
window.NaroaConfig = NaroaConfig;

export default NaroaConfig;
