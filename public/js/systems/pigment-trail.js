/**
 * Pigment Trail Effect - Naroa 2026
 * ==================================
 * Rastro de pigmento que sigue al cursor
 * Colores: tonos tierra, ocres, sienas
 * 
 * @author Kimi 2.5 CLI
 */

const PigmentTrail = (() => {
  const config = {
    trailLength: 20,
    fadeSpeed: 0.03,
    size: { min: 4, max: 12 },
    colors: [
      '#8B4513', // Siena
      '#CD853F', // Peru
      '#D2691E', // Chocolate
      '#A0522D', // Sienna
      '#6B4423', // Burnt umber
      '#8B7355', // Tan oscuro
    ],
    enabled: true
  };

  let container = null;
  let trail = [];
  let animationId = null;
  let lastPos = { x: 0, y: 0 };
  let isActive = false;

  function init(targetContainer) {
    container = targetContainer || document.body;
    container.style.position = 'relative';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', () => isActive = true);
    document.addEventListener('mouseleave', () => isActive = false);

    animate();
  }

  function handleMouseMove(e) {
    if (!isActive || !config.enabled) return;

    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Solo crear partícula si hay movimiento significativo
    if (distance > 10) {
      createParticle(e.clientX, e.clientY, distance);
      lastPos = { x: e.clientX, y: e.clientY };
    }
  }

  function createParticle(x, y, velocity) {
    const particle = document.createElement('div');
    particle.className = 'pigment-particle';

    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];

    // Offset aleatorio para efecto de brocha
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;

    particle.style.cssText = `
      position: fixed;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '30% 70% 70% 30% / 30% 30% 70% 70%'};
      pointer-events: none;
      opacity: ${0.6 + Math.random() * 0.4};
      z-index: 9999;
      transform: rotate(${Math.random() * 360}deg);
      mix-blend-mode: multiply;
    `;

    particle.dataset.opacity = particle.style.opacity;
    particle.dataset.born = Date.now();

    container.appendChild(particle);
    trail.push(particle);

    // Limitar longitud del rastro
    while (trail.length > config.trailLength) {
      const old = trail.shift();
      old.remove();
    }
  }

  function animate() {
    const now = Date.now();

    trail.forEach((particle, index) => {
      const born = parseInt(particle.dataset.born);
      const age = now - born;
      const maxAge = 2000; // 2 segundos de vida

      // Fade out con el tiempo
      const lifeProgress = age / maxAge;
      const newOpacity = (1 - lifeProgress) * parseFloat(particle.dataset.opacity);

      if (lifeProgress >= 1) {
        particle.remove();
        trail.splice(index, 1);
      } else {
        particle.style.opacity = newOpacity.toString();
        // Efecto de "secar" - reducir tamaño
        particle.style.transform += ` scale(${1 - lifeProgress * 0.3})`;
      }
    });

    animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    trail.forEach(p => p.remove());
    trail = [];
    document.removeEventListener('mousemove', handleMouseMove);
  }

  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  function toggle(enabled) {
    config.enabled = enabled;
  }

  return {
    init,
    destroy,
    setConfig,
    toggle,
    get config() { return { ...config }; }
  };
})();

if (typeof window !== 'undefined') {
  window.PigmentTrail = PigmentTrail;
}

export default PigmentTrail;
