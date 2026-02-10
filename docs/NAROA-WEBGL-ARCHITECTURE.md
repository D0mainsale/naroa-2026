# Arquitectura WebGL: Cosmovisión de Naroa

## Documento de Diseño Técnico | Naroa 2026

> *"Las grietas no se ocultan, se doran"* — Pilar del Kintsugi

---

## 1. Visión General

### 1.1 Propósito
Sistema WebGL inmersivo que materializa los tres pilares filosóficos de Naroa Gutiérrez Gil en experiencias visuales interactivas, integrando el catálogo completo de obras (`works-complete-catalog.json`) como fuente de datos viva.

### 1.2 Principios de Diseño
- **Piel Bajo Carboncillo**: Estética texturizada, orgánica, imperfecta
- **Caos Manipulado**: El "error" como precursor estético (Cantinflas)
- **ReCreo**: Reinvención continua del espacio digital
- **Materialidad**: Pizarra, mica, papel rasgado como elementos WebGL

### 1.3 Referencia Filosófica
Del archivo `ia-soul-persona.json`:

```json
{
  "manifesto": {
    "pillar_1": "El Kintsugi y el Trampolín",
    "pillar_2": "La Manipulación del Caos", 
    "pillar_3": "El ReCreo"
  },
  "alchemy": {
    "pizarra": "Lo terrenal, la caverna, el refugio",
    "mica_mineral": "Brillo celestial, latido en los ojos",
    "textura_rasgada": "Metáfora de la lucha humana visibilizada"
  }
}
```

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAROA WEBGL ENGINE                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   PILLAR 1  │  │   PILLAR 2  │  │       PILLAR 3          │  │
│  │  Kintsugi   │  │    Caos     │  │      ReCreo             │  │
│  │  Shader     │  │  Shader     │  │   Metamorphosis         │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ALCHEMY MATERIAL LAYER                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌─────────────┐  │   │
│  │  │ Pizarra │ │  Mica   │ │ Papel Ras │ │ Pigmento    │  │   │
│  │  │ Shader  │ │ Particle│ │ Parallax  │ │ Trail       │  │   │
│  │  └─────────┘ └─────────┘ └───────────┘ └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              WORKS CATALOG INTEGRATION                   │   │
│  │       (works-complete-catalog.json + Live API)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Estructura de Directorios

```
js/webgl/naroa/
├── core/
│   ├── NaroaWebGLEngine.js          # Motor principal
│   ├── ShaderLibrary.js             # Biblioteca de shaders
│   └── TextureManager.js            # Gestor de texturas
├── pillars/
│   ├── KintsugiShader.js            # Pilar 1: Grietas doradas
│   ├── ChaosShader.js               # Pilar 2: Turbulencia controlada
│   └── RecreoShader.js              # Pilar 3: Transformación
├── materials/
│   ├── SlateMaterial.js             # Pizarra (piedra, terrenal)
│   ├── MicaMaterial.js              # Mica mineral (brillo)
│   ├── PaperMaterial.js             # Papel rasgado
│   └── PigmentMaterial.js           # Pigmentos tierra
├── works/
│   ├── WorksCatalogAdapter.js       # Adaptador del JSON
│   ├── ArtworkVisualization.js      # Visualización de obras
│   └── SeriesMapping.js             # Mapeo de series
└── effects/
    ├── CharcoalEffect.js            # Efecto carboncillo
    ├── GoldLeafEffect.js            # Pan de oro
    └── ReactiveShimmer.js           # Brillo reactivo
```

---

## 3. Shaders por Pilar Filosófico

### 3.1 Pilar 1: Kintsugi Shader
*Las grietas no se ocultan, se doran*

```glsl
// kintsugi.frag
precision highp float;

uniform sampler2D u_artwork;      // Textura de obra
uniform sampler2D u_crackMap;     // Mapa de grietas
uniform float u_time;
uniform float u_goldIntensity;    // 0.0 - 1.0

// Paleta Kintsugi
const vec3 GOLD_22K = vec3(0.957, 0.792, 0.208);  // #f4ca35
const vec3 GOLD_PALE = vec3(0.831, 0.686, 0.216); // #d4af37
const vec3 CRACK_SHADOW = vec3(0.08, 0.06, 0.04);

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec4 artwork = texture2D(u_artwork, uv);
    
    // Detectar "grietas" en la imagen (bordes de alto contraste)
    float crack = detectCracks(u_artwork, uv);
    
    // Animación dorada pulsante
    float goldPulse = sin(u_time * 2.0) * 0.1 + 0.9;
    vec3 gold = mix(GOLD_PALE, GOLD_22K, goldPulse);
    
    // Componer: obra original + grietas doradas
    vec3 color = mix(artwork.rgb, gold, crack * u_goldIntensity);
    
    // Sombra en las grietas para profundidad
    color = mix(color, CRACK_SHADOW, crack * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
}
```

**Parámetros Interactivos:**
- `u_goldIntensity`: Control de user (slider "Resiliencia")
- `u_time`: Animación continua del brillo dorado
- Hover: Las grietas brillan más intensamente

### 3.2 Pilar 2: Chaos Shader
*Manipulación del Caos - Cantinflas*

```glsl
// chaos.frag
precision highp float;

uniform sampler2D u_artwork;
uniform float u_chaosLevel;       // 0.0 (orden) - 1.0 (caos)
uniform float u_time;
uniform vec2 u_mouse;

// Función de ruido turbulenta
float turbulentNoise(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 5; i++) {
        value += amplitude * abs(snoise(p));
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Distorsión tipo "Cantinflas" - brillante incoherencia
    vec2 distortion = vec2(
        turbulentNoise(uv * 3.0 + u_time * 0.5),
        turbulentNoise(uv * 3.0 + 100.0 + u_time * 0.3)
    ) * u_chaosLevel * 0.1;
    
    // Influencia del mouse (atrae/distorsiona)
    vec2 mouseInfluence = (u_mouse - uv) * u_chaosLevel * 0.05;
    
    vec2 distortedUV = uv + distortion + mouseInfluence;
    
    // Samplear con distorsión
    vec4 color = texture2D(u_artwork, distortedUV);
    
    // Añadir "accidentes" artísticos (manchas de pigmento)
    float splatter = splatterNoise(uv, u_time) * u_chaosLevel;
    color.rgb = mix(color.rgb, PIGMENT_BROWN, splatter * 0.2);
    
    gl_FragColor = color;
}
```

**Interacciones:**
- Mouse move: "Atrae" el caos hacia el cursor
- Click: Explosión momentánea de distorsión
- Scroll: Transición gradual orden→caos

### 3.3 Pilar 3: Recreo Shader
*Transformación y metamorfosis*

```glsl
// recreo.frag
precision highp float;

uniform sampler2D u_artwork;
uniform sampler2D u_alternateWork;  // Otra obra para morph
uniform float u_transformProgress;  // 0.0 - 1.0
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Efecto de "partículas de pigmento" reconstruyendo
    float particleReveal = particleNoise(uv, u_time);
    
    // Morph entre obras usando partículas
    vec4 workA = texture2D(u_artwork, uv);
    vec4 workB = texture2D(u_alternateWork, uv);
    
    // La transformación no es lineal, es orgánica
    float organicMix = smoothstep(
        u_transformProgress - 0.2,
        u_transformProgress + 0.2,
        particleReveal
    );
    
    vec4 color = mix(workA, workB, organicMix);
    
    // Brillo de "renacimiento" en los bordes
    float rim = rimLight(uv, u_time);
    color.rgb += vec3(0.957, 0.792, 0.208) * rim * u_transformProgress;
    
    gl_FragColor = color;
}
```

---

## 4. Materiales Alquímicos

### 4.1 Pizarra Material (SlateMaterial.js)
```javascript
class SlateMaterial {
  constructor() {
    this.properties = {
      roughness: 0.9,        // Áspera
      metallic: 0.1,         // Poco metálica
      baseColor: [0.15, 0.14, 0.13], // Gris oscuro
      grainScale: 2.5,       // Escala del grano
      // Referencia: "La vuelta a casa y su tejado"
    };
  }
  
  // Generar textura procedimental de pizarra
  generateTexture() {
    // Ruido de Perlin multi-octava para vetas
    // Manchas oscuras aleatorias (mineral)
  }
}
```

### 4.2 Mica Material (MicaMaterial.js)
```javascript
class MicaMaterial {
  constructor() {
    this.properties = {
      iridescence: true,
      shimmerSpeed: 0.02,
      layers: 5,             // Capas de mica
      colors: [
        '#d4af37',           // Oro
        '#c9b037',           // Oro viejo
        '#b8860b',           // Dorado oscuro
        '#f4ca35'            // Oro brillante
      ]
      // Referencia: "Dimensionalidad brillante"
    };
  }
}
```

### 4.3 Papel Rasgado Material
```javascript
class TornPaperMaterial {
  constructor() {
    this.properties = {
      tearIntensity: 0.7,
      fiberVisibility: 0.8,
      edgeRoughness: 0.9,
      // Referencia: "Lucha entre acrílico y pegamento"
    };
  }
  
  generateTearPath() {
    // Curvas de Bézier irregulares
    // Simular fibras desgarradas
  }
}
```

---

## 5. Integración con Works Catalog

### 5.1 Adaptador de Datos

```javascript
// works/WorksCatalogAdapter.js

class WorksCatalogAdapter {
  constructor(catalogPath = 'data/works-complete-catalog.json') {
    this.catalog = null;
    this.seriesMap = new Map();
    this.techniqueMap = new Map();
  }

  async load() {
    const response = await fetch(this.catalogPath);
    this.catalog = await response.json();
    this.buildIndices();
    return this;
  }

  buildIndices() {
    // Indexar por series
    this.catalog.works.forEach(work => {
      const series = work.serie_o_categoria;
      if (!this.seriesMap.has(series)) {
        this.seriesMap.set(series, []);
      }
      this.seriesMap.get(series).push(work);
      
      // Indexar por técnica
      const tech = work.tecnica;
      if (tech) {
        if (!this.techniqueMap.has(tech)) {
          this.techniqueMap.set(tech, []);
        }
        this.techniqueMap.get(tech).push(work);
      }
    });
  }

  // Obtener obra por pilar filosófico
  getWorksForPillar(pillar) {
    const mappings = {
      'kintsugi': ['Espejos del Alma', 'Kintsugi Emocional', 'Artivismos'],
      'chaos': ['DiviNos', 'Vaivenes', 'RockaGipsy'],
      'recreo': ['En.lata', 'Facefood', 'Walking Gallery']
    };
    
    const series = mappings[pillar] || [];
    return series.flatMap(s => this.seriesMap.get(s) || []);
  }

  // Mapear técnica a material WebGL
  getMaterialForTechnique(technique) {
    const materialMap = {
      'Acrílico y Posca sobre pizarra': 'slate',
      'Acrílico sobre pizarra natural': 'slate',
      'Collage textil y acrílico': 'torn_paper',
      'Intervención en lata': 'metallic',
      'Pintura sobre lienzo': 'canvas'
    };
    
    for (const [key, material] of Object.entries(materialMap)) {
      if (technique?.includes(key)) return material;
    }
    return 'default';
  }
}
```

### 5.2 Mapeo de Series a Experiencias

| Serie | Pilar | Material WebGL | Efecto Principal |
|-------|-------|----------------|------------------|
| **Rocks** | Kintsugi | Pizarra | Grietas doradas sobre piedra |
| **DiviNos** | Caos | Pigmento | Turbulencia controlada |
| **En.lata** | Recreo | Metálico | Transformación/reciclaje |
| **Facefood** | Recreo | Mixto | Fusión inesperada |
| **Walking Gallery** | Caos | Urbano | Caos organizado |
| **Espejos del Alma** | Kintsugi | Cristal | Reflexión dorada |

---

## 6. API del Sistema

### 6.1 Inicialización

```javascript
import { NaroaWebGLEngine } from './webgl/naroa/core/NaroaWebGLEngine.js';

// Inicializar motor
const engine = new NaroaWebGLEngine({
  canvas: document.getElementById('webgl-canvas'),
  fallback: true,  // CSS fallback si WebGL no disponible
  mobileOptimized: true
});

// Cargar catálogo
await engine.loadCatalog('data/works-complete-catalog.json');

// Inicializar con pilar específico
engine.activatePillar('kintsugi', {
  intensity: 0.7,
  goldColor: '#d4af37'
});
```

### 6.2 Eventos y Hooks

```javascript
// Escuchar cambios de obra
engine.on('artwork:change', (work) => {
  console.log(`Visualizando: ${work.titulo}`);
});

// Escuchar interacciones
engine.on('kintsugi:crackHover', (crackData) => {
  // Reproducir sonido cristalino
  audioEngine.play('gold-shimmer');
});

// Cambio de pilar
engine.on('pillar:transition', (from, to) => {
  // Efecto de transición
});
```

### 6.3 Render Loop

```javascript
class NaroaWebGLEngine {
  render(time) {
    // 1. Actualizar materiales alquímicos
    this.materials.update(time);
    
    // 2. Aplicar shader del pilar activo
    this.activePillar.render(time);
    
    // 3. Componer capas
    this.composer.render();
    
    requestAnimationFrame((t) => this.render(t));
  }
}
```

---

## 7. Optimización y Performance

### 7.1 Estrategias

| Técnica | Implementación |
|---------|---------------|
| **Texture Atlasing** | Obras relacionadas en mismo atlas |
| **LOD System** | Calidad según distancia al viewport |
| **Shader Precompilation** | Compilar shaders al cargar |
| **Frame Skipping** | Reducir a 30fps en móviles |
| **Offscreen Canvas** | Web Workers para generación de texturas |

### 7.2 Detección de Capacidades

```javascript
class CapabilityDetector {
  static detect() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    
    return {
      webgl2: !!gl,
      maxTextureSize: gl?.getParameter(gl.MAX_TEXTURE_SIZE) || 2048,
      floatTextures: gl?.getExtension('OES_texture_float') || false,
      instancing: gl?.getExtension('ANGLE_instanced_arrays') || false,
      // Fallback a CSS effects si no soportado
      fallback: !gl
    };
  }
}
```

---

## 8. Accesibilidad

### 8.1 Reducción de Movimiento

```css
@media (prefers-reduced-motion: reduce) {
  .naroa-webgl-canvas {
    display: none;
  }
  
  .naroa-webgl-fallback {
    display: block;
    /* Versión estática de alta calidad */
  }
}
```

### 8.2 Alternativas

- **Versión CSS**: Efectos puramente CSS para usuarios con `prefers-reduced-motion`
- **Descripción sonora**: Audio que describe las transformaciones visuales
- **Control manual**: Sliders para controlar intensidad de efectos

---

## 9. Roadmap de Implementación

### Fase 1: Fundamentos (Week 1-2)
- [ ] Implementar `NaroaWebGLEngine` core
- [ ] Crear `ShaderLibrary` con utilidades base
- [ ] Integrar `WorksCatalogAdapter`

### Fase 2: Pilares (Week 3-4)
- [ ] Kintsugi Shader completo
- [ ] Chaos Shader con interacción mouse
- [ ] Recreo Shader con morphing

### Fase 3: Materiales (Week 5-6)
- [ ] SlateMaterial procedimental
- [ ] MicaMaterial con partículas
- [ ] TornPaperMaterial

### Fase 4: Integración (Week 7-8)
- [ ] Conectar con galería existente
- [ ] Implementar eventos
- [ ] Testing en dispositivos

### Fase 5: Polish (Week 9-10)
- [ ] Optimizaciones performance
- [ ] Fallbacks CSS
- [ ] Documentación final

---

## 10. Referencias

### Archivos del Proyecto
- `data/works-complete-catalog.json` — Catálogo de obras
- `data/ia-soul-persona.json` — Cosmovisión Naroa
- `js/systems/charcoal-shader.js` — Shader base existente
- `js/mica-particles-webgl.js` — Sistema de partículas

### Inspiración Visual
- Kintsugi: Cerámica japonesa reparada con oro
- Cantinflas: Caos cómico organizado
- Mica: Mineral brillante en capas
- Pizarra: Textura de tejado vasco

---

*Documento generado para Naroa 2026 | Artivista del Caos*
