/**
 * Spotify Rotator - Rota álbumes/playlists cada minuto
 * Moskvlogia Collection
 */

class SpotifyRotator {
  constructor() {
    this.currentIndex = 0;
    
    // Álbumes y playlists de Borja Moskv
    this.embeds = [
      { type: 'album', id: '3Kx5S9L4U8XdU8nHrWgZuT', name: 'Lo Inmanente' },
      { type: 'playlist', id: '37i9dQZF1DZ06evO0yVlvS', name: 'Moskvlogia 2008' },
      { type: 'album', id: '4rN3VvCVqG4RfCqbFZKnqT', name: 'Álbum 2' },
      { type: 'artist', id: '4NHQUGzhtTLFvgF5SZesLK', name: 'Borja Moskv' }
    ];
    
    this.init();
  }
  
  init() {
    this.container = document.querySelector('.hero__spotify');
    if (!this.container) return;
    
    // Aplicar embed inicial
    this.applyEmbed();
    
    // Rotar cada minuto
    setInterval(() => this.rotate(), 60000);
    
    console.log('🎵 Spotify Rotator activo:', this.embeds[this.currentIndex].name);
  }
  
  rotate() {
    this.currentIndex = (this.currentIndex + 1) % this.embeds.length;
    this.applyEmbed();
    console.log('🔄 Spotify cambiado a:', this.embeds[this.currentIndex].name);
  }
  
  applyEmbed() {
    const embed = this.embeds[this.currentIndex];
    const url = `https://open.spotify.com/embed/${embed.type}/${embed.id}?utm_source=generator&theme=0`;
    
    this.container.innerHTML = `
      <iframe 
        src="${url}" 
        width="300" 
        height="80" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        title="${embed.name} - Borja Moskv"
        style="border-radius: 12px;">
      </iframe>
    `;
  }
}

// Auto-inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.spotifyRotator = new SpotifyRotator();
});
