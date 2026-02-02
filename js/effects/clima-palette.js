/**
 * CLIMA PALETTE ENGINE - Dynamic Weather-Based Colors
 * La paleta cambia según el clima de tu ciudad
 * 
 * 4 COLORES BASE que mutan según clima:
 * - Crema → Tonos según cielo
 * - Terracota → Calidez del día
 * - Azul Klein → Intensidad atmosférica
 * - Negro → Contraste ambiental
 */

class ClimaPalette {
  constructor() {
    this.apiKey = 'demo'; // Free tier - auto detected
    this.palettes = {
      // SOLEADO - Warm pastels
      clear: {
        cream: '#faf7f2',
        terracotta: '#e8a87c',
        blue: '#87ceeb',
        black: '#2c2c2c',
        mood: 'Día radiante'
      },
      // NUBLADO - Soft grays
      clouds: {
        cream: '#f0ede8',
        terracotta: '#b8a090',
        blue: '#6b8e9f',
        black: '#3d3d3d',
        mood: 'Cielo de algodón'
      },
      // LLUVIA - Cool blues
      rain: {
        cream: '#e8eef2',
        terracotta: '#7a9eb2',
        blue: '#002fa7',
        black: '#1a1a2e',
        mood: 'Petricor'
      },
      // NIEVE - Pure whites
      snow: {
        cream: '#ffffff',
        terracotta: '#c4b7a6',
        blue: '#a8c8dc',
        black: '#4a4a5a',
        mood: 'Silencio blanco'
      },
      // TORMENTA - Dramatic purples
      thunderstorm: {
        cream: '#e0dce8',
        terracotta: '#8b7a8e',
        blue: '#4a0080',
        black: '#0d0d1a',
        mood: 'Electricidad'
      },
      // NIEBLA - Mist pastels
      mist: {
        cream: '#f5f5f0',
        terracotta: '#a8a098',
        blue: '#8fafc4',
        black: '#505050',
        mood: 'Misterio'
      },
      // ATARDECER (basado en hora) - SUAVIZADO para legibilidad
      sunset: {
        cream: '#faf5ef',
        terracotta: '#c9875a',
        blue: '#5a4a8a',
        black: '#1a1a25',
        mood: 'Golden hour'
      },
      // NOCHE
      night: {
        cream: '#1a1a2e',
        terracotta: '#cc7744',
        blue: '#002244',
        black: '#0a0a15',
        mood: 'Nocturno'
      }
    };
    
    this.init();
  }

  async init() {
    try {
      const position = await this.getLocation();
      const weather = await this.getWeather(position);
      this.applyPalette(weather);
    } catch (e) {
      // Fallback: usar hora del día
      this.applyTimeBasedPalette();
    }
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not available');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => reject('Location denied'),
        { timeout: 5000 }
      );
    });
  }

  async getWeather(position) {
    // Free weather API (wttr.in - no key needed)
    try {
      const res = await fetch(
        `https://wttr.in/${position.lat},${position.lon}?format=j1`,
        { timeout: 5000 }
      );
      const data = await res.json();
      return this.parseWeather(data);
    } catch {
      return 'clear';
    }
  }

  parseWeather(data) {
    if (!data?.current_condition?.[0]) return 'clear';
    
    const condition = data.current_condition[0];
    const code = parseInt(condition.weatherCode || 0);
    const hour = new Date().getHours();
    
    // Check if night
    if (hour >= 21 || hour < 6) return 'night';
    if (hour >= 17 && hour < 21) return 'sunset';
    
    // Weather codes
    if (code >= 200 && code < 300) return 'thunderstorm';
    if (code >= 300 && code < 600) return 'rain';
    if (code >= 600 && code < 700) return 'snow';
    if (code >= 700 && code < 800) return 'mist';
    if (code === 800) return 'clear';
    if (code > 800) return 'clouds';
    
    return 'clear';
  }

  applyTimeBasedPalette() {
    const hour = new Date().getHours();
    let weather = 'clear';
    
    if (hour >= 21 || hour < 6) weather = 'night';
    else if (hour >= 17 && hour < 21) weather = 'sunset';
    else if (hour >= 6 && hour < 9) weather = 'mist';
    
    this.applyPalette(weather);
  }

  applyPalette(weather) {
    const palette = this.palettes[weather] || this.palettes.clear;
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--naroa-cream', palette.cream);
    root.style.setProperty('--naroa-terracotta', palette.terracotta);
    root.style.setProperty('--naroa-blue', palette.blue);
    root.style.setProperty('--naroa-black', palette.black);
    
    // Update semantic colors
    root.style.setProperty('--bg-primary', palette.cream);
    root.style.setProperty('--text-primary', palette.black);
    root.style.setProperty('--accent', palette.blue);
    
    // Store mood for MICA
    window.climaMood = palette.mood;
    
    // Log for debugging
    console.log(`🌤️ Clima Palette: ${weather} - "${palette.mood}"`);
    
    // Emit event
    document.dispatchEvent(new CustomEvent('climatePaletteChanged', {
      detail: { weather, palette }
    }));
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ClimaPalette());
} else {
  new ClimaPalette();
}

window.ClimaPalette = ClimaPalette;
