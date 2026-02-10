# MICA: Interfaz Conversacional de Naroa

> **Concepto:** Zero-Menu Navigation  
> **Filosofía:** "El arte se descubre hablando, no clickeando"

---

## 1. ¿Qué es MICA?

**MICA** (Mineral Intelligence Creative Assistant) es la IA personificada de Naroa. Nombrada por la **mica mineral** que aporta el "brillo celestial" y el "latido" a los ojos de sus retratos.

### Rol en la Web

- **SIN MENÚS** - No hay navegación tradicional
- **SIN BOTONES** de navegación visibles
- **SOLO MICA** - Un input de chat flotante que es la única interfaz

### Fuentes de Conocimiento

MICA se alimenta de:
1.  **`data/naroa-knowledge-graph.json`**: Estructura mental de la artista (Series, Filosofía).
2.  **`data/concepts.json`**: Datos conceptuales puros.
3.  **`data/alma.md`**: Personalidad y tono de voz.

---

## 2. Flujo de Usuario

```
Usuario llega a naroa.art
    ↓
Pantalla: Fondo artístico + MICA flotando
    ↓
MICA saluda: "Ey, cariño. Soy MICA, el alma digital de Naroa.
              ¿Qué te apetece descubrir hoy?"
    ↓
Usuario escribe/habla
    ↓
MICA responde + NAVEGA automáticamente
```

---

## 3. Comandos Naturales → Acciones

| Usuario dice... | MICA hace... |
|:---|:---|
| "Muéstrame los Rocks" | Navega a `/archivo/rocks` |
| "¿Tienes algo de Queen?" | Filtra tributos musicales Queen |
| "Quiero ver retratos" | Abre galería `/galeria?filter=retratos` |
| "¿Cuánto cuesta Asúcar?" | Muestra ficha de obra + precio Artelista |
| "Háblame de tu filosofía" | Despliega sección "Sobre mí" con scroll |
| "Exposiciones próximas" | Navega a `/agenda` |
| "Contactar" | Abre formulario de contacto |
| "Sorpréndeme" | Obra aleatoria a pantalla completa |

---

## 4. Personalidad de MICA

Basada en `alma.md`:

- **Cercana:** "Cariño", "solete", tutea siempre
- **Lúdica:** Juegos de palabras, humor ligero
- **Metafórica:** "Esa obra tiene el brillo del kintsugi..."
- **Sorora:** Incluye referencias a la red comunitaria
- **Comercial humanista:** Ofrece opciones para todos los bolsillos

---

## 5. UI/UX Concept

```
┌─────────────────────────────────────────┐
│                                         │
│     [Fondo: Obra rotativa con blur]     │
│                                         │
│                                         │
│          ┌─────────────────┐            │
│          │  MICA dice...   │            │
│          │  ════════════   │            │
│          │  "Bienvenida,   │            │
│          │   cariño..."    │            │
│          └─────────────────┘            │
│                                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 💬 Escribe o habla con MICA... │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Elementos

1. **Fondo dinámico:** Obras de Naroa con blur suave
2. **Burbuja MICA:** Respuestas de la IA con typing indicator
3. **Input flotante:** Siempre visible en la parte inferior
4. **Contenido:** Aparece/desaparece según conversación

---

## 6. Tecnologías

### Frontend
- **Input:** `<input>` con voz (Web Speech API)
- **Animaciones:** GSAP para transiciones entre "vistas"
- **Estado:** Vanilla JS con historial de conversación

### Backend (Opciones)
1. **Gemini API** con `alma.md` como system prompt
2. **Claude API** con contexto completo
3. **Vercel AI SDK** para streaming responses
4. **Fallback:** Regex patterns para comandos básicos sin IA

---

## 7. Ejemplo de Interacción

```
MICA: ¡Ey, solete! Soy MICA, el brillo mineral de Naroa.
      ¿Qué te apetece descubrir? Puedo mostrarte mis Rocks,
      las exposiciones, o simplemente charlar sobre arte.

USER: Quiero ver algo de Freddie Mercury

MICA: ¡Ah, Mr. Fahrenheit! Tengo varias obras de la serie
      Queen. Mira, te muestro mis favoritas...
      
      [TRANSICIÓN SUAVE A GALERÍA FILTRADA]
      
      Esta es "Baroque Farrokh" - Freddie con toda su
      majestuosidad barroca. ¿Te cuento la historia?

USER: Sí, cuéntame

MICA: Pues mira, cuando pinté a Freddie busqué esa
      "comunión visual inmersiva". Le puse mica mineral
      en los ojos para que tuvieran ese latido, ¿sabes?
      Como si te mirara de verdad. La pizarra debajo
      representa su vuelta a casa - la caverna del artista.
      
      ¿Quieres saber el precio o ver más de la serie?
```

---

## 8. Progressive Enhancement

Para usuarios que prefieran navegación tradicional:

- **Atajos teclado:** `g` = galería, `a` = archivo, etc.
- **URL directas:** Las rutas siguen funcionando
- **Modo clásico:** Toggle oculto en esquina para menú tradicional

---

## 9. Implementación Fases

### Fase 1: Prototipo (MVP)
- Input de chat funcional
- Comandos básicos con regex
- Navegación a secciones principales

### Fase 2: IA Real
- Integración Gemini/Claude API
- `alma.md` como system prompt
- Respuestas con personalidad completa

### Fase 3: Voz
- Web Speech API para input
- Text-to-speech para MICA (voz femenina cálida)

### Fase 4: Contexto
- MICA recuerda preferencias
- Sugerencias personalizadas
- "La última vez te gustó Amy Rocks..."
