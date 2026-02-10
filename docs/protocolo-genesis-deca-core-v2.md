# 🧠 Protocolo Génesis Deca-Core v2.0

> Flujo de producción multimedia profesional con 10 IAs, loops de retroalimentación y QA cruzada.

## Mejoras Clave Implementadas

- **Loops de Retroalimentación**: No más proceso lineal; ahora hay ciclos de refinación entre fases.
- **Stack Técnico 2024-2025**: Reemplazo de herramientas obsoletas por Flux, Luma Ray, ElevenLabs v3, etc.
- **Capa de QA (Control de Calidad)**: Validación cruzada entre IAs antes de aprobar.
- **Sincronización Lápiz-Audio Precisa**: Workflow de beat-matching automatizado.
- **Optimización Web Real**: Core Web Vitals, lazy loading, y PWA capabilities.

---

## Fase 1: Concepción Híper-Estratégica (El Alma)

### 1. ChatGPT o1 / Claude 3.5 Sonnet (Los Estrategas Binarios)

**Tarea:** Co-creación narrativa + Arquitectura técnica.

```
Actúa como director creativo y tech lead. Diseña concepto "Neo-Kinki Cyberpunk" 
especificando: BPM objetivo (recomendado 140-160 para Phonk), keyframes 
narrativos sincronizados con drops musicales, paleta de colores HEX para 
consistencia visual, y especificaciones técnicas para rendering 4K.
```

**Output:** JSON estructurado con `{concept, lyrics_structure, visual_beats, color_palette, technical_specs}`.

**Nuevo:** Generar Documento Maestro (Single Source of Truth) compartido entre todas las IAs.

### 2. Midjourney v6.1 + Flux Pro (Los Visualizadores)

**Tarea:** Generación de Moodboards técnicos y Keyframes maestros.

**Workflow:**
- MJ para exploración conceptual (variaciones creativas)
- Flux Pro para consistencia de personajes (`--seed` consistente + LoRAs personalizados)

```
Neo-Kinki cyberpunk character, industrial trap aesthetics, 
chromatic aberration, 35mm lens, f/1.4, cinematic lighting, 
color palette [insertar HEX del Documento Maestro], 
--ar 16:9 --s 750 --style raw --seed 12345
```

---

## Fase 2: Producción de Activos (El Cuerpo)

### 3. Suno v3 / Udio (El Compositor)

**Mejora:** Usar estructura de stems (pistas separadas: drums, bass, vocals, FX).

```
[Verse] Industrial phonk bass, 145 BPM, distorted 808s, 
[Chorus] Aggressive Spanish trap vocals, glitch effects, 
[Outro] Ambient cyberpunk synths fading to noise.
--separate_stems --mastering_loud
```

### 4. ElevenLabs v3 + Audio2Face (La Voz y el Labio)

- **Audio2Face (NVIDIA)** para sincronización labial automática si hay diálogos
- Voz clonada: Stability 0.35 (más expresiva), Clarity +0.8
- Exportar en 48kHz/24bit para headroom en post-producción

### 5. Luma Dream Machine / Runway Gen-3 (El Cinematógrafo)

- Luma para movimientos de cámara complejos (dolly, crane shots)
- Runway para Motion Brush específico
- Generar clips de 5s a 24fps consistentes
- Camera Motion: `Zoom In 1.5x + Pan Right`
- Negative prompt: `"blur, distorted architecture, inconsistent lighting"`

---

## Fase 3: Post-Producción Inteligente (El Pulido)

### 6. Topaz Video AI + Magnific (El Escalador Híbrido)

- **Magnific** para upscalar keyframes estáticos (texturas detalladas)
- **Topaz Video AI** (modelo Apollo o Chronos) para interpolación a 60fps y escalado 4K
- Capa de restauración para eliminar artefactos de compresión de IAs generativas

### 7. Sync Automated (El Cronometrador)

- **Beatoven.ai** o análisis con **Ableton + Max4Live** para mapear BPM exacto
- Generar EDL (Edit Decision List) automática:
  - Cortes en cada downbeat
  - Transiciones en drops
  - Sincronización lyrics-visuales (palabras clave = cambios de escena)

---

## Fase 4: Integración Web 3D Avanzada (El Metaverso)

### 8. Tripo3D / Meshy v4 + Hyper3D (El Escultor y Optimizador)

**Pipeline de optimización para web:**
1. Generar en Tripo (calidad máxima)
2. Pasar por Hyper3D (Rodin) para retopología automática (<50k polígonos)
3. Texturizado en 2K con baking de normales
4. Formato: **GLB con compresión Draco + KTX2** para carga instantánea

### 9. Cursor AI + v0.dev + Three.js React Fiber (Los Arquitectos Web)

**Stack:**
```bash
npm install @react-three/fiber @react-three/drei three@latest 
npm install @react-three/postprocessing leva zustand
npm install @splinetool/react-spline
```

**Features:**
- Shader personalizado: Scanlines + CRT distortion + Bloom
- Audio-reactive: Web Audio API → Three.js (pulsación con beat)
- PWA: Service workers para precarga del video en caché
- Responsive: Detección de GPU para degradado graceful

```javascript
// Componente AudioVisualizer integrado
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function CyberpunkScene({ audioAnalyzer }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (audioAnalyzer) {
      const frequency = audioAnalyzer.getAverageFrequency();
      meshRef.current.scale.setScalar(1 + frequency * 0.01);
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <primitive object={optimizedGLB} />
      <meshStandardMaterial emissive="#ff0040" emissiveIntensity={2} />
    </mesh>
  );
}
```

---

## Fase 5: Distribución y Análisis (El Impacto)

### 10. Perplexity + Claude 3.5 + Hypefury (El Equipo de Marketing)

- **Perplexity:** Research de trending topics en cyberpunk aesthetic y phonk 2024
- **Claude:** 20 variaciones de copy (A/B testing) con tone "críptico-místico"
- **Hypefury/Typefully:** Scheduling automatizado con optimización de horarios
- **Opus Clip:** Generar shorts/tiktoks automáticos desde el video principal

---

## 🔄 Sistema de Feedback y QA

### Checkpoint de Validación Cruzada

```bash
python validate_assets.py --phase 2 --check "resolution,consistency,color_match"
```

### Matriz de Aprobación

| Check | Herramienta | Criterio |
|-------|------------|----------|
| Coherencia Visual | ClipDrop / Adobe Firefly | Consistencia de personajes entre escenas |
| Alineación Audio-Visual | Waveform overlay interno | Verificar sincronía |
| Web Performance | Lighthouse CI | >90 en Performance Score antes del deploy |

---

## 🚀 Protocolo de Ejecución

```bash
# 1. Setup inicial con gestión de versiones
mkdir -p glorious_launch/{src,assets,exports,docs}
cd glorious_launch && git init

# 2. Instalación del stack completo
npm create vite@latest . -- --template react
npm install three @react-three/fiber @react-three/drei zustand leva

# 3. Estructura de assets versionada
assets/
├── 01_concept/        # Prompts y moodboards
├── 02_audio/          # Stems y masters
├── 03_video/          # Raw clips y renders
├── 04_web/            # Models 3D optimizados
└── 05_exports/        # Finales para distribución
```

---

## 💡 Pro-Tips

- **Color Management:** Usar Colour.io o Coolors.co para exportar paletas directamente a CSS variables y Three.js uniforms
- **Backup de Seeds:** Documentar todos los seeds en `docs/seeds_log.md`
- **Render Farm:** Google Colab Pro con FFmpeg para concatenar sin perder calidad:
  ```bash
  ffmpeg -f concat -i input.txt -c copy -movflags +faststart output.mp4
  ```
- **Legal/Ética:** Disclaimer de "AI-generated content" + verificar derechos de voz clonada
