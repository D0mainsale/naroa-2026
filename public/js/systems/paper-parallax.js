/**
 * Paper Parallax Effect - Naroa 2026
 * ===================================
 * Capa de textura de papel con parallax sutil
 * 
 * @author Kimi 2.5 CLI
 */

const PaperParallax = (() => {
  const config = {
    depth: 8, // pixels de movimiento máximo
    smoothing: 0.1,
    textureUrl: 'assets/textures/paper-grain.png',
    opacity: 0.15
  };

  let overlay = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationId = null;

  function init(container) {
    // Crear overlay de textura
    overlay = document.createElement('div');
    overlay.className = 'paper-parallax-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: -${config.depth}px;
      left: -${config.depth}px;
      right: -${config.depth}px;
      bottom: -${config.depth}px;
      background-image: url('${config.textureUrl}');
      background-size: 200px 200px;
      opacity: ${config.opacity};
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: multiply;
    `;

    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.appendChild(overlay);

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);

    // Iniciar animación suave
    animate();
  }

  function handleMouseMove(e) {
    // Normalizar posición del cursor a -1...1
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function animate() {
    // Suavizado con lerp
    currentX += (targetX - currentX) * config.smoothing;
    currentY += (targetY - currentY) * config.smoothing;

    // Aplicar transformación
    if (overlay) {
      const translateX = currentX * config.depth;
      const translateY = currentY * config.depth;
      overlay.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    if (overlay) overlay.remove();
    document.removeEventListener('mousemove', handleMouseMove);
  }

  function setConfig(newConfig) {
    Object.assign(config, newConfig);
    if (overlay) {
      overlay.style.opacity = config.opacity;
    }
  }

  return {
    init,
    destroy,
    setConfig,
    get config() { return { ...config }; }
  };
})();

if (typeof window !== 'undefined') {
  window.PaperParallax = PaperParallax;
}

export default PaperParallax;
