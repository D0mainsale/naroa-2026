/**
 * Generador de Palíndromos Infinitos para el Hero
 * Cada visita muestra un palíndromo diferente relacionado con NAROA
 * Incluye efectos audio-reactivos en la rugosidad del texto
 */

const PalindromeHero = (() => {
  // Biblioteca de palíndromos artísticos relacionados con Naroa/Arte
  const PALINDROMES = [
    'ANARO·ARAN',
    'NAROA·OARAN',
    'AROAN·AORA',
    'ROAN·NAOR',
    'OJO·EL·ARTE·TRA·LE·OJO',
    'AMA·LA·PINTURA·RUT·NIP·AL·AMA',
    'RADAR·NAROA·OARAN·RADAR',
    'SOMOS·O·SOMOS',
    'RECONOCER',
    'ANILINA',
    'SOMETEMOS',
    'AMOR·A·ROMA',
    'A·MI·LEMA·ES·AMAR·ES·AMEL·IMA',
    'OJO·POR·OJO',
    'NADA·Y·NADAN',
    'LUZ·AZUL',
  ];

  // Generador de palíndromos basados en letras de NAROA
  const NAROA_LETTERS = ['N', 'A', 'R', 'O', 'A'];
  
  function generateNaroaPalindrome() {
    // Crea variaciones aleatorias basadas en NAROA
    const variations = [
      () => 'NARO' + '·' + 'ORAN',
      () => 'AROAN' + '·' + 'NAORA',
      () => 'OAN' + '·' + 'NAO',
      () => 'RONA' + '·' + 'ANOR',
      () => 'ANORA' + '·' + 'ARONA',
      () => 'ORANA' + '·' + 'ANARO',
      () => 'NAROAN' + '·' + 'NAORAN',
    ];
    return variations[Math.floor(Math.random() * variations.length)]();
  }

  // Selecciona palíndromo aleatorio (50% predefinido, 50% generado)
  function getRandomPalindrome() {
    if (Math.random() > 0.5) {
      return PALINDROMES[Math.floor(Math.random() * PALINDROMES.length)];
    }
    return generateNaroaPalindrome();
  }

  // Inicializa con palíndromo aleatorio
  function init() {
    const palindromeElement = document.querySelector('.hero__palindrome-text');
    if (!palindromeElement) return;

    // Palíndromo aleatorio en cada visita
    const palindrome = getRandomPalindrome();
    palindromeElement.textContent = palindrome;

    // Guardar para analytics (opcional)
    console.log(`🔮 Palíndromo del día: ${palindrome}`);

    // Iniciar efectos audio-reactivos si hay audio activo
    initAudioReactive(palindromeElement);
  }

  // Sistema audio-reactivo: la rugosidad del texto responde al audio
  function initAudioReactive(element) {
    // Escuchar eventos del sistema de audio existente
    window.addEventListener('naroa:audio-levels', (e) => {
      const { bass, mid, high, average } = e.detail || {};
      if (average === undefined) return;

      // Rugosidad = blur + distorsión basada en frecuencias
      const roughness = Math.min(average * 3, 2); // 0-2px max
      const waveIntensity = bass * 0.1 || 0;
      
      element.style.filter = `blur(${0.3 + roughness}px)`;
      element.style.transform = `
        translateX(${Math.sin(Date.now() * 0.001) * waveIntensity}%)
      `;
    });

    // Si no hay audio, usar variación sutil temporal
    let frame = 0;
    function animateRoughness() {
      frame++;
      const subtleRoughness = 0.3 + Math.sin(frame * 0.02) * 0.2;
      element.style.filter = `blur(${subtleRoughness}px)`;
      requestAnimationFrame(animateRoughness);
    }
    animateRoughness();
  }

  // Auto-init cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, getRandomPalindrome };
})();
