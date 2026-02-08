/**
 * GENERADOR INFINITO DE PALÍNDROMOS ÁUREOS
 * Cada visita = experiencia visual única
 * Proporciones Áureas (φ = 1.618) aplicadas a tipografía
 * Textura mica/papel rugosa
 */

const PalindromeGenerator = (() => {
  // Ratio Áureo
  const PHI = 1.618033988749;
  const PHI_INV = 0.618033988749;
  
  // Semilla única por visita (timestamp + random)
  const SEED = Date.now() + Math.random() * 999999;
  
  // Letras disponibles para generar palíndromos
  const NAROA_LETTERS = ['N', 'A', 'R', 'O', 'A'];
  const ART_LETTERS = ['A', 'R', 'T', 'E'];
  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  const CONSONANTS = ['N', 'R', 'T', 'S', 'L', 'M', 'C', 'D'];
  
  // Generador pseudo-aleatorio seedeado (para consistencia)
  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }
  
  const random = seededRandom(SEED);
  
  // Genera palíndromo de longitud variable (3-9 caracteres)
  function generatePalindrome() {
    // Longitud basada en proporción áurea
    const lengths = [3, 5, 7, 9, 11];
    const lengthIndex = Math.floor(random() * lengths.length);
    const length = lengths[lengthIndex];
    
    // Mitad del palíndromo (redondeando hacia arriba)
    const halfLength = Math.ceil(length / 2);
    let half = '';
    
    // Construcción con preferencia por letras de NAROA
    for (let i = 0; i < halfLength; i++) {
      const useNaroa = random() > PHI_INV; // ~62% NAROA, ~38% otras
      if (useNaroa) {
        half += NAROA_LETTERS[Math.floor(random() * NAROA_LETTERS.length)];
      } else {
        const useVowel = random() > 0.5;
        half += useVowel 
          ? VOWELS[Math.floor(random() * VOWELS.length)]
          : CONSONANTS[Math.floor(random() * CONSONANTS.length)];
      }
    }
    
    // Construir palíndromo completo
    const reversed = half.slice(0, -1).split('').reverse().join('');
    const palindrome = half + reversed;
    
    // Añadir separador áureo en posición φ
    const separatorPos = Math.floor(palindrome.length * PHI_INV);
    return palindrome.slice(0, separatorPos) + '·' + palindrome.slice(separatorPos);
  }
  
  // Genera secuencia de múltiples palíndromos (modo loop)
  function generateSequence(count = 5) {
    const sequence = [];
    for (let i = 0; i < count; i++) {
      sequence.push(generatePalindrome());
    }
    return sequence;
  }
  
  // Aplica textura mica/rugosidad al texto
  function applyMicaTexture(element) {
    if (!element) return;
    
    // Variables CSS para rugosidad
    element.style.setProperty('--mica-roughness', '0.4');
    element.style.textShadow = `
      0 0 ${1 * PHI}px rgba(139, 92, 246, 0.1),
      ${PHI}px ${PHI}px ${PHI * 2}px rgba(0, 0, 0, 0.3)
    `;
    
    // Animación sutil de rugosidad
    let frame = 0;
    function animateRoughness() {
      frame += 0.02;
      const roughness = 0.3 + Math.sin(frame) * 0.15;
      element.style.filter = `blur(${roughness}px)`;
      requestAnimationFrame(animateRoughness);
    }
    animateRoughness();
  }
  
  // Inicialización
  function init() {
    const palindromeEl = document.querySelector('.hero__palindrome-text');
    if (!palindromeEl) return;
    
    // Generar palíndromo único para esta visita
    const palindrome = generatePalindrome();
    palindromeEl.textContent = palindrome;
    
    // Aplicar textura mica
    applyMicaTexture(palindromeEl);
    
    // Log para debugging
    
    // Modo loop: cambiar cada 30 segundos (opcional, para exposiciones)
    if (window.PALINDROME_LOOP_MODE) {
      const sequence = generateSequence(10);
      let index = 0;
      setInterval(() => {
        index = (index + 1) % sequence.length;
        palindromeEl.textContent = sequence[index];
      }, 30000);
    }
  }
  
  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  return { 
    generatePalindrome, 
    generateSequence, 
    PHI, 
    init 
  };
})();
