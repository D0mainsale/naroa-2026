# AUDITORÍA DE DISEÑO: PROPORCIÓN ÁUREA φ (1.618)

**Proyecto:** naroa-2026  
**Fecha:** 2026-02-08  
**Auditor:** Kimi Code CLI  
**Directrices:** MÁS MINIMAL · MÁS INTUITIVA · MÁS VISUAL · MÁS VIAJE · PROGRESIONES ÁUREAS

---

## A) QUÉ SOBRA — Elementos Decorativos Innecesarios

### Efectos Visuales Redundantes (Ruido Acumulado)
| Elemento | Ubicación | Problema | Severidad |
|----------|-----------|----------|-----------|
| `.aurora` | Líneas 196 + 277 (duplicado) | Dos auroras, una innecesaria | 🔴 Alta |
| `.cursor-light` | Línea 198 | Cursor personalizado que compite con el contenido | 🟡 Media |
| `.particles` | Línea 199 | Partículas sobre el arte | 🔴 Alta |
| `.noise-overlay` | Línea 273 | Ruido sobre imagen | 🟡 Media |
| `.holistic-concept` | Línea 197 | Capa adicional sin función clara | 🟡 Media |
| `.scroll-progress-container` | Líneas 222-226 | Barra de progreso innecesaria | 🟢 Baja |

### Audio Dock Sobrecargado
```html
<!-- Líneas 229-251 -->
<div class="audio-dock">
  <div class="audio-dock__vinyl">     <!-- Animación constante -->
  <div class="equalizer">             <!-- 5 barras animadas -->
  <div class="audio-dock__panel">     <!-- Panel iframe complejo -->
```
**Problema:** Elemento visualmente dominante que compite con las obras de arte.

### Efectos de Texto Excesivos
| Selector | Problema | Ubicación |
|----------|----------|-----------|
| `.hero__line` | `-webkit-text-stroke` + `text-shadow` | layout.css:201-211 |
| `.text-shimmer` | Animación constante | Múltiples secciones |
| `.game-card` | `box-shadow: 8px 8px 0` + hover shifts | games-hub.css:74-78 |
| `.gallery__item` | Glow + border + shadow simultáneos | gallery.css:58-65 |

### Emojis en Headers (21 ocurrencias)
```
🎮 Sala de Juegos    🧠 Memory    🧩 Puzzle    🐍 Snake
🧱 Breakout          🔨 Whack     🎵 Simon     ❓ Quiz
🧺 Atrapa Arte       🎨 Collage   👑 Repóker   ✨ MICA VIVA
🥇 Kintsugi          🏓 Pong      ⚡ Test      ⌨️ Typing
♟️ Ajedrez          🔴 Damas     🔵 Conecta   ⚫ Reversi
🎲 Juego de la Oca   🕹️ Tetris
```

### Badges y Etiquetas Visuales
- `NEW_RELEASE` — esquina superior derecha de tarjetas
- `🔥 Viral` — en tarjetas destacadas
- `⚡ MODO CAOS` — botón prominente

### Footer Sobrecargado
- Reproductor Bandcamp embedido (iframe)
- Múltiples iconos emoji
- Texto de desarrollo visible

---

## B) QUÉ FALTA — Progresión Áurea φ (1.618)

### 1. Sistema de Espaciado
**Actual:** Variables arbitrarias sin relación matemática
```css
/* variables.css:92-100 */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
/* Ratio inconsistente: 1:2, 1:1.5, 1:1.33 */
```

**Falta:** Escalado áureo proporcional
```css
/* Ideal φ-based */
--space-1: 0.382rem;   /* base / φ² */
--space-2: 0.618rem;   /* base / φ */
--space-3: 1rem;       /* base */
--space-5: 1.618rem;   /* base × φ */
--space-8: 2.618rem;   /* base × φ² */
/* Ratio constante: 1:1.618 */
```

### 2. Escalado Tipográfico
**Actual:** Valores arbitrarios
```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 2rem;       /* 32px */
```

### 3. Proporciones de Layout
**Actual:** Todas las secciones son 100vh
```css
.view--home, .view--rocks, .view--archivo {
  min-height: 100vh;  /* Sin variación */
}
```

**Falta:** Progresión áurea en alturas
```css
/* Sección Hero: 100% (base) */
/* Sección Rocks: 61.8% */
/* Sección Archivo: 100% */
/* Sección About: 61.8% */
/* Sección Contacto: 38.2% */
```

### 4. Grid/Columnas Masonry
**Actual:** Breakpoints arbitrarios
```css
.gallery--masonry {
  columns: 4;                    /* Desktop */
  @media (max-width: 1400px) { columns: 3; }
  @media (max-width: 1024px) { columns: 2; }
  @media (max-width: 640px)  { columns: 1; }
}
```

### 5. Whitespace Intencional
**Problema:** Padding inconsistente entre secciones
```css
.view--home { padding: 3rem; }
.view--rocks { padding: 0; }
.view--archivo { padding-top: 2rem; padding-bottom: 4rem; }
.view--about { padding: 6rem 2rem; }
```

### 6. Jerarquía Visual
**Problema:** Múltiples elementos compiten por atención
- Hero tiene: slider + overlay + content-layer + brand-header + title-mega + footer
- Todos con z-index superpuestos

---

## C) PLAN DE 10 CAMBIOS CONCRETOS

### Cambio 1: Consolidar Efectos de Fondo
**Acción:** Eliminar duplicados, mantener solo uno sutil
```css
/* ELIMINAR */
.aurora:nth-of-type(2),      /* Segunda aurora */
.cursor-light,               /* Cursor personalizado */
.particles,                  /* Partículas */
.noise-overlay,              /* Ruido */
.holistic-concept            /* Concepto holístico */

/* MANTENER (1 solo) */
.aurora {
  opacity: 0.3;              /* Reducir de 0.5 a 0.3 */
  animation-duration: 30s;   /* Más lento */
}
```

### Cambio 2: Simplificar Audio Dock
**Acción:** Convertir a botón minimal
```css
.audio-dock {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(212,175,55,0.3);
}
.audio-dock__vinyl,
.audio-dock__info,
.equalizer { display: none; }
```

### Cambio 3: Implementar Sistema φ-Spacing
**Acción:** Reemplazar todas las variables de espaciado
```css
:root {
  --phi: 1.618033988749;
  --phi-base: 0.618rem;  /* ≈ 10px */
  
  /* Escalado */
  --s-1: calc(var(--phi-base) / var(--phi) / var(--phi));  /* 0.236rem */
  --s-2: calc(var(--phi-base) / var(--phi));               /* 0.382rem */
  --s-3: var(--phi-base);                                  /* 0.618rem */
  --s-5: calc(var(--phi-base) * var(--phi));               /* 1rem */
  --s-8: calc(var(--s-5) * var(--phi));                    /* 1.618rem */
  --s-13: calc(var(--s-8) * var(--phi));                   /* 2.618rem */
  --s-21: calc(var(--s-13) * var(--phi));                  /* 4.236rem */
  --s-34: calc(var(--s-21) * var(--phi));                  /* 6.854rem */
  --s-55: calc(var(--s-34) * var(--phi));                  /* 11.09rem */
}
```

### Cambio 4: Escalado Tipográfico Áureo
**Acción:** Jerarquía φ-based
```css
:root {
  --t-base: 1rem;                    /* 16px */
  --t-sm: calc(var(--t-base) / var(--phi));           /* 0.618rem */
  --t-body: var(--t-base);                            /* 1rem */
  --t-lg: calc(var(--t-base) * var(--phi));           /* 1.618rem */
  --t-xl: calc(var(--t-lg) * var(--phi));             /* 2.618rem */
  --t-2xl: calc(var(--t-xl) * var(--phi));            /* 4.236rem */
  --t-hero: calc(var(--t-2xl) * var(--phi));          /* 6.854rem */
  
  /* Line-heights áureos */
  --lh-tight: 1;
  --lh-normal: var(--phi);           /* 1.618 */
  --lh-relaxed: calc(var(--phi) * var(--phi));        /* 2.618 */
}
```

### Cambio 5: Reducir Hero a Esencial
**Acción:** Eliminar capas superpuestas
```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s-34);
}

/* ELIMINAR */
.hero__slider,        /* Usar imagen estática */
.hero__overlay,       /* Eliminar gradiente complejo */
.hero__brand-header,  /* Redundante con nav */
.hero__scroll-indicator  /* Innecesario */
```

### Cambio 6: Simplificar Navegación
**Acción:** Nav minimal que respira
```css
.nav {
  position: fixed;
  top: var(--s-8);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--s-3) var(--s-8);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--s-21);  /* φ-based */
}

.nav__link {
  font-size: var(--t-sm);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

### Cambio 7: Gallery Masonry φ-Grid
**Acción:** Columnas basadas en proporciones áureas
```css
.gallery--masonry {
  column-gap: var(--s-5);     /* 1rem φ-based */
  padding: var(--s-21) var(--s-13);
}

.gallery__item {
  margin-bottom: var(--s-8);  /* 1.618rem */
  border-radius: var(--s-3);  /* Esquinas sutiles */
  border: none;               /* Sin borde */
  transition: transform 0.4s var(--ease-smooth);
}

.gallery__item:hover {
  transform: translateY(calc(var(--s-3) * -1));
}
```

### Cambio 8: Tarjetas de Juegos Minimal
**Acción:** Eliminar sombras, bordes, badges
```css
.game-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  padding: var(--s-8);
  transition: border-color 0.3s ease;
}

.game-card:hover {
  border-color: rgba(212,175,55,0.3);
}

/* ELIMINAR */
.game-card__icon,
.game-card::before,
.game-card--new::after,
.game-card--spectacular::after  /* Todos los badges */
```

### Cambio 9: Progresión de Secciones
**Acción:** Alturas basadas en φ
```css
.view--home     { min-height: 100vh; }
.view--rocks    { min-height: 61.8vh; padding: var(--s-34) 0; }
.view--archivo  { min-height: 100vh; padding: var(--s-34) 0; }
.view--about    { min-height: 61.8vh; padding: var(--s-34) 0; }
.view--contacto { min-height: 38.2vh; padding: var(--s-21) 0; }
```

### Cambio 10: Footer Esencial
**Acción:** Solo información necesaria
```html
<footer class="site-footer">
  <p>© 2026 Naroa Gutiérrez Gil</p>
  <a href="mailto:naroa@naroa.eu">naroa@naroa.eu</a>
  <a href="https://instagram.com/naroagutierrezgil">@naroagutierrezgil</a>
</footer>
```
```css
.site-footer {
  padding: var(--s-13) var(--s-8);
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* ELIMINAR */
.footer__bandcamp,
.footer__dev-notice
```

---

## D) CÓDIGO CSS LISTO PARA COPIAR

### Sistema Completo de Espaciado Áureo φ

```css
/* ==========================================================================
   GOLDEN RATIO DESIGN SYSTEM φ = 1.618033988749
   ========================================================================== */

:root {
  /* ═══════════════════════════════════════════
     CONSTANTE ÁUREA
     ═══════════════════════════════════════════ */
  --phi: 1.618033988749;
  --phi-sqrt: 1.27201964951;  /* √φ */
  --phi-inv: 0.618033988749;  /* 1/φ */
  
  /* ═══════════════════════════════════════════
     UNIDAD BASE
     0.618rem ≈ 10px @ 16px root
     ═══════════════════════════════════════════ */
  --phi-unit: 0.618rem;
  
  /* ═══════════════════════════════════════════
     SISTEMA DE ESPACIADO ÁUREO (Fibonacci)
     Cada valor = anterior × φ
     ═══════════════════════════════════════════ */
  --space-phi-1: calc(var(--phi-unit) * var(--phi-inv) * var(--phi-inv));  /* 0.236rem ≈ 3.8px */
  --space-phi-2: calc(var(--phi-unit) * var(--phi-inv));                   /* 0.382rem ≈ 6.1px */
  --space-phi-3: var(--phi-unit);                                          /* 0.618rem ≈ 9.9px */
  --space-phi-5: calc(var(--phi-unit) * var(--phi));                       /* 1.000rem ≈ 16px */
  --space-phi-8: calc(var(--space-phi-5) * var(--phi));                    /* 1.618rem ≈ 26px */
  --space-phi-13: calc(var(--space-phi-8) * var(--phi));                   /* 2.618rem ≈ 42px */
  --space-phi-21: calc(var(--space-phi-13) * var(--phi));                  /* 4.236rem ≈ 68px */
  --space-phi-34: calc(var(--space-phi-21) * var(--phi));                  /* 6.854rem ≈ 110px */
  --space-phi-55: calc(var(--space-phi-34) * var(--phi));                  /* 11.090rem ≈ 177px */
  --space-phi-89: calc(var(--space-phi-55) * var(--phi));                  /* 17.944rem ≈ 287px */
  
  /* Aliases semánticos */
  --space-phi-xs: var(--space-phi-2);    /* Micro */
  --space-phi-sm: var(--space-phi-3);    /* Small */
  --space-phi-md: var(--space-phi-5);    /* Medium */
  --space-phi-lg: var(--space-phi-8);    /* Large */
  --space-phi-xl: var(--space-phi-13);   /* Extra Large */
  --space-phi-2xl: var(--space-phi-21);  /* 2× Extra Large */
  --space-phi-3xl: var(--space-phi-34);  /* 3× Extra Large */
  --space-phi-4xl: var(--space-phi-55);  /* 4× Extra Large */
  
  /* ═══════════════════════════════════════════
     SISTEMA TIPOGRÁFICO ÁUREO
     ═══════════════════════════════════════════ */
  --text-phi-base: 1rem;  /* 16px */
  
  --text-phi-xs: calc(var(--text-phi-base) / var(--phi) / var(--phi));  /* 0.382rem ≈ 6px */
  --text-phi-sm: calc(var(--text-phi-base) / var(--phi));               /* 0.618rem ≈ 10px */
  --text-phi-md: var(--text-phi-base);                                  /* 1.000rem ≈ 16px */
  --text-phi-lg: calc(var(--text-phi-base) * var(--phi));               /* 1.618rem ≈ 26px */
  --text-phi-xl: calc(var(--text-phi-lg) * var(--phi));                 /* 2.618rem ≈ 42px */
  --text-phi-2xl: calc(var(--text-phi-xl) * var(--phi));                /* 4.236rem ≈ 68px */
  --text-phi-3xl: calc(var(--text-phi-2xl) * var(--phi));               /* 6.854rem ≈ 110px */
  --text-phi-hero: calc(var(--text-phi-3xl) * var(--phi));              /* 11.090rem ≈ 177px */
  
  /* Line heights áureos */
  --lh-phi-tight: 1;
  --lh-phi-snug: var(--phi-inv);         /* 0.618 */
  --lh-phi-normal: 1;
  --lh-phi-relaxed: var(--phi);          /* 1.618 */
  --lh-phi-loose: calc(var(--phi) * var(--phi));  /* 2.618 */
  
  /* ═══════════════════════════════════════════
     PROPORCIONES DE LAYOUT
     ═══════════════════════════════════════════ */
  --ratio-square: 1;
  --ratio-landscape: var(--phi);         /* 1:1.618 */
  --ratio-portrait: var(--phi-inv);      /* 1.618:1 */
  --ratio-widescreen: calc(var(--phi) * var(--phi));  /* 1:2.618 */
  --ratio-golden: var(--phi);
  
  /* Secciones */
  --section-full: 100vh;
  --section-large: 61.8vh;   /* 100 / φ */
  --section-medium: 38.2vh;  /* 100 / φ² */
  --section-small: 23.6vh;   /* 100 / φ³ */
  
  /* ═══════════════════════════════════════════
     BORDES ÁUREOS
     ═══════════════════════════════════════════ */
  --radius-phi-none: 0;
  --radius-phi-sm: var(--space-phi-2);   /* 0.382rem */
  --radius-phi-md: var(--space-phi-3);   /* 0.618rem */
  --radius-phi-lg: var(--space-phi-5);   /* 1rem */
  --radius-phi-xl: var(--space-phi-8);   /* 1.618rem */
  --radius-phi-full: 9999px;
  
  /* ═══════════════════════════════════════════
     PALEta MINIMAL
     ═══════════════════════════════════════════ */
  --color-bg: #050505;
  --color-surface: #0a0a0a;
  --color-elevated: #111111;
  
  --color-text: #ededed;
  --color-text-muted: rgba(237, 237, 237, 0.6);
  --color-text-subtle: rgba(237, 237, 237, 0.38);
  
  --color-accent: #d4af37;  /* Oro sutil */
  --color-accent-soft: rgba(212, 175, 55, 0.1);
  
  --color-border: rgba(255, 255, 255, 0.04);
  --color-border-hover: rgba(255, 255, 255, 0.08);
  
  /* ═══════════════════════════════════════════
     ANIMACIONES ÁUREAS
     ═══════════════════════════════════════════ */
  --duration-phi-fast: calc(0.1s * var(--phi));      /* 162ms */
  --duration-phi-normal: calc(0.2s * var(--phi));   /* 324ms */
  --duration-phi-slow: calc(0.3s * var(--phi));     /* 485ms */
  --duration-phi-slower: calc(0.5s * var(--phi));   /* 809ms */
  
  --ease-phi: cubic-bezier(0.618, 0, 0.382, 1);     /* Curva áurea */
  --ease-phi-smooth: cubic-bezier(0.23, 1, 0.32, 1);
}

/* ==========================================================================
   CLASES UTILITARIAS ÁUREAS
   ========================================================================== */

/* Espaciado */
.p-phi-1 { padding: var(--space-phi-1); }
.p-phi-2 { padding: var(--space-phi-2); }
.p-phi-3 { padding: var(--space-phi-3); }
.p-phi-5 { padding: var(--space-phi-5); }
.p-phi-8 { padding: var(--space-phi-8); }
.p-phi-13 { padding: var(--space-phi-13); }
.p-phi-21 { padding: var(--space-phi-21); }
.p-phi-34 { padding: var(--space-phi-34); }

.px-phi-8 { padding-left: var(--space-phi-8); padding-right: var(--space-phi-8); }
.py-phi-21 { padding-top: var(--space-phi-21); padding-bottom: var(--space-phi-21); }

.m-phi-3 { margin: var(--space-phi-3); }
.m-phi-5 { margin: var(--space-phi-5); }
.m-phi-8 { margin: var(--space-phi-8); }

.gap-phi-5 { gap: var(--space-phi-5); }
.gap-phi-8 { gap: var(--space-phi-8); }
.gap-phi-13 { gap: var(--space-phi-13); }

/* Tipografía */
.text-phi-sm { font-size: var(--text-phi-sm); }
.text-phi-md { font-size: var(--text-phi-md); }
.text-phi-lg { font-size: var(--text-phi-lg); }
.text-phi-xl { font-size: var(--text-phi-xl); }
.text-phi-2xl { font-size: var(--text-phi-2xl); }
.text-phi-hero { font-size: var(--text-phi-hero); }

.lh-phi-relaxed { line-height: var(--lh-phi-relaxed); }

/* Layout */
.section-phi-full { min-height: var(--section-full); }
.section-phi-large { min-height: var(--section-large); }
.section-phi-medium { min-height: var(--section-medium); }
.section-phi-small { min-height: var(--section-small); }

/* Grid áureo */
.grid-phi {
  display: grid;
  gap: var(--space-phi-8);
}

.grid-phi-2 {
  grid-template-columns: 61.8% 38.2%;
}

.grid-phi-3 {
  grid-template-columns: 38.2% 23.6% 38.2%;
}

/* Aspect ratios */
.aspect-phi {
  aspect-ratio: var(--ratio-golden);
}

.aspect-phi-inv {
  aspect-ratio: calc(1 / var(--ratio-golden));
}

/* ==========================================================================
   COMPONENTES BASE ÁUREOS
   ========================================================================== */

/* Botón Minimal */
.btn-phi {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-phi-3) var(--space-phi-8);
  font-size: var(--text-phi-sm);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-phi-md);
  transition: 
    border-color var(--duration-phi-fast) ease,
    color var(--duration-phi-fast) ease;
  cursor: pointer;
}

.btn-phi:hover {
  border-color: var(--color-accent-soft);
  color: var(--color-accent);
}

/* Tarjeta Minimal */
.card-phi {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-phi-md);
  padding: var(--space-phi-8);
  transition: border-color var(--duration-phi-normal) ease;
}

.card-phi:hover {
  border-color: var(--color-border-hover);
}

/* Input Minimal */
.input-phi {
  width: 100%;
  padding: var(--space-phi-5) var(--space-phi-8);
  font-size: var(--text-phi-md);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-phi-sm);
  transition: border-color var(--duration-phi-fast) ease;
}

.input-phi:focus {
  outline: none;
  border-color: var(--color-accent-soft);
}

.input-phi::placeholder {
  color: var(--color-text-subtle);
}

/* ==========================================================================
   SECCIONES ÁUREAS
   ========================================================================== */

.section-phi {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.section-phi-hero {
  min-height: var(--section-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-phi-34) var(--space-phi-13);
}

.section-phi-content {
  min-height: var(--section-large);
  padding: var(--space-phi-34) var(--space-phi-13);
}

.section-phi-compact {
  min-height: var(--section-medium);
  padding: var(--space-phi-21) var(--space-phi-13);
}

/* Container áureo */
.container-phi {
  width: 100%;
  max-width: calc(var(--phi) * 100ch);  /* ~162ch */
  margin-inline: auto;
  padding-inline: var(--space-phi-13);
}

/* ==========================================================================
   GALERÍA ÁUREA
   ========================================================================== */

.gallery-phi {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(var(--phi) * 150px), 1fr));
  gap: var(--space-phi-8);
  padding: var(--space-phi-21) var(--space-phi-13);
}

.gallery-phi--masonry {
  columns: 3;
  column-gap: var(--space-phi-8);
}

@media (max-width: 1024px) {
  .gallery-phi--masonry { columns: 2; }
}

@media (max-width: 640px) {
  .gallery-phi--masonry { columns: 1; }
}

.gallery-phi__item {
  break-inside: avoid;
  margin-bottom: var(--space-phi-8);
  border-radius: var(--radius-phi-sm);
  overflow: hidden;
  transition: transform var(--duration-phi-slow) var(--ease-phi-smooth);
}

.gallery-phi__item:hover {
  transform: translateY(calc(var(--space-phi-3) * -1));
}

.gallery-phi__item img {
  width: 100%;
  height: auto;
  display: block;
}

/* ==========================================================================
   NAVEGACIÓN ÁUREA
   ========================================================================== */

.nav-phi {
  position: fixed;
  top: var(--space-phi-13);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: var(--space-phi-8);
  padding: var(--space-phi-3) var(--space-phi-8);
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--space-phi-21);
}

.nav-phi__link {
  font-size: var(--text-phi-sm);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: var(--space-phi-2) var(--space-phi-3);
  transition: color var(--duration-phi-fast) ease;
}

.nav-phi__link:hover,
.nav-phi__link--active {
  color: var(--color-text);
}

/* ==========================================================================
   FOOTER ÁUREO
   ========================================================================== */

.footer-phi {
  padding: var(--space-phi-21) var(--space-phi-13);
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.footer-phi__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-phi-5);
}

.footer-phi__links {
  display: flex;
  gap: var(--space-phi-8);
}

.footer-phi a {
  font-size: var(--text-phi-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--duration-phi-fast) ease;
}

.footer-phi a:hover {
  color: var(--color-text);
}
```

---

## RESUMEN EJECUTIVO

### Problemas Críticos Identificados
1. **Ruido visual excesivo**: 6+ efectos de fondo simultáneos
2. **Densidad de información**: 21 juegos con emojis distraen del arte
3. **Inconsistencia espacial**: Padding arbitrario entre secciones
4. **Ausencia de φ**: Ningún sistema basado en proporción áurea

### Impacto Esperado tras Implementación
| Métrica | Antes | Después |
|---------|-------|---------|
| Elementos decorativos | ~25 | ~5 |
| Variables de espaciado | 9 | 10 (φ-based) |
| Tamaños de fuente | 9 | 8 (φ-based) |
| Alturas de sección | 1 (100vh) | 4 (φ-based) |
| Líneas de CSS crítico | ~2,500 | ~1,200 |
| Tiempo de carga estimado | 100% | 65% |

### Prioridad de Implementación
1. **Inmediata**: Eliminar efectos duplicados (aurora, particles)
2. **Alta**: Implementar sistema φ-spacing
3. **Media**: Rediseñar navegación y hero
4. **Baja**: Simplificar footer y tarjetas de juegos

---

*"El diseño minimal no es eliminar hasta que no queda nada, sino hasta que no queda nada que eliminar."* — Antoine de Saint-Exupéry (parafraseado)
