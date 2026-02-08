/**
 * Video Showcase Feature
 * Handles video playback in a custom lightbox
 */

class VideoShowcase {
  constructor() {
    this.videos = {
      'featured': {
        title: 'Génesis: Espejos del Alma',
        src: 'https://www.youtube.com/embed/placeholder?autoplay=1' // To be replaced with real ID
      },
      'expo': {
        title: 'Serie Rocks: Detrás de escena',
        src: 'https://www.youtube.com/embed/placeholder?autoplay=1'
      },
      'studio': {
        title: 'En el Estudio',
        src: 'https://www.youtube.com/embed/placeholder?autoplay=1'
      }
    };
    
    this.init();
  }

  init() {
    // Create lightbox DOM if not exists
    if (!document.getElementById('video-lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.id = 'video-lightbox';
      lightbox.className = 'lightbox lightbox--video';
      lightbox.innerHTML = `
        <div class="lightbox__backdrop"></div>
        <div class="lightbox__content glass-dark">
          <button class="lightbox__close" aria-label="Cerrar">×</button>
          <div class="lightbox__video-container">
            <iframe id="video-frame" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <h3 id="video-title" class="lightbox__title"></h3>
        </div>
      `;
      document.body.appendChild(lightbox);
      
      // Bind events
      lightbox.querySelector('.lightbox__close').addEventListener('click', () => this.close());
      lightbox.querySelector('.lightbox__backdrop').addEventListener('click', () => this.close());
    }
  }

  play(videoId) {
    // For now, simpler alert if no real video URL
    // alert("Video coming soon! 🎬");
    // return;

    const video = this.videos[videoId];
    if (!video) return;

    const lightbox = document.getElementById('video-lightbox');
    const frame = document.getElementById('video-frame');
    const title = document.getElementById('video-title');

    // Use a placeholder visual loop or real youtube if user provides it
    // For demo: showing a cool placeholder message
    frame.src = `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1`; // Rick Roll placeholder (classic dev placeholder, change later!)
    // Actually, let's look for REAL video links in Naroa's data.
    // Assuming generated content for now.

    title.textContent = video.title;
    lightbox.classList.add('visible');
    
    // Sound effect
    if (window.AudioSynth) window.AudioSynth.uiClick();
  }

  close() {
    const lightbox = document.getElementById('video-lightbox');
    const frame = document.getElementById('video-frame');
    
    lightbox.classList.remove('visible');
    setTimeout(() => {
      frame.src = '';
    }, 300);
  }
}

// Export singleton
window.VideoShowcase = new VideoShowcase();
