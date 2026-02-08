/**
 * Scroll-to-Top Button
 * Shows when scrolled down, smooth scroll on click
 */
(function() {
  // Create button
  const btn = document.createElement('button');
  btn.className = 'scroll-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.setAttribute('title', 'Volver arriba');
  document.body.appendChild(btn);
  
  // Show/hide based on scroll position
  let ticking = false;
  const THRESHOLD = 300;
  
  function updateButton() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > THRESHOLD) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateButton);
      ticking = true;
    }
  }, { passive: true });
  
  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Audio feedback if available
    if (window.AudioSynth && !window.ImmersiveAudio?.isMuted) {
      AudioSynth.uiClick?.();
    }
  });
  
  // Initial check
  updateButton();
})();
