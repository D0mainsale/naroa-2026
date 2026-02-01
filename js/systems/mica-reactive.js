/**
 * Mica Reactive Effect - Naroa 2026
 * ==================================
 * Efecto de shimmer/brillo mineral que reacciona al cursor
 * Similar a mica natural bajo luz indirecta
 * 
 * @author Kimi 2.5 CLI
 */

const MicaReactive = (() => {
  const config = {
    intensity: 0.6,
    shimmerSpeed: 0.02,
    particleCount: 30,
    colors: ['#d4af37', '#c9a227', '#b8860b'] // Tonos dorados/mica
  };

  let container = null;
  let particles = [];
  let animationId = null;
  let mousePos = { x: 0, y: 0 };

  function init(targetContainer) {
    container = targetContainer;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Crear partículas de mica
    for (let i = 0; i < config.particleCount; i++) {
      createParticle();
    }

    // Event listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Iniciar animación
    animate();
  }

  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'mica-particle';
    particle.style.cssText = `
      position: absolute;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      background: ${config.colors[Math.floor(Math.random() * config.colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 0 6px currentColor;
    `;

    particle.dataset.baseX = Math.random() * 100;
    particle.dataset.baseY = Math.random() * 100;
    particle.dataset.phase = Math.random() * Math.PI * 2;

    container.appendChild(particle);
    particles.push(particle);
  }

  function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mousePos.x = (e.clientX - rect.left) / rect.width;
    mousePos.y = (e.clientY - rect.top) / rect.height;
  }

  function handleMouseLeave() {
    particles.forEach(p => p.style.opacity = '0');
  }

  function animate() {
    const time = Date.now() * config.shimmerSpeed;

    particles.forEach((particle, i) => {
      const baseX = parseFloat(particle.dataset.baseX);
      const baseY = parseFloat(particle.dataset.baseY);
      const phase = parseFloat(particle.dataset.phase);

      // Movimiento ondulante
      const offsetX = Math.sin(time + phase) * 5;
      const offsetY = Math.cos(time + phase * 0.7) * 5;

      // Reacción al cursor
      const dx = (mousePos.x * 100) - baseX;
      const dy = (mousePos.y * 100) - baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - dist / 30) * config.intensity;

      particle.style.left = `${baseX + offsetX + dx * influence * 0.1}%`;
      particle.style.top = `${baseY + offsetY + dy * influence * 0.1}%`;
      particle.style.opacity = (0.3 + influence * 0.7).toString();
      particle.style.transform = `scale(${1 + influence})`;
    });

    animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    particles.forEach(p => p.remove());
    particles = [];
    if (container) {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    }
  }

  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  return {
    init,
    destroy,
    setConfig,
    get config() { return { ...config }; }
  };
})();

if (typeof window !== 'undefined') {
  window.MicaReactive = MicaReactive;
}

export default MicaReactive;
