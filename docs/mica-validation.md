# Validación del Concepto MICA: Análisis de Viabilidad

> **Fecha:** 2026-02-01  
> **Concepto:** Zero-Menu Navigation vía IA Conversacional

---

## 1. Análisis de Mercado

### Precedentes Encontrados

| Sector | Ejemplo | Nivel de adopción |
|:-------|:--------|:------------------|
| Healthcare | Aetna (CVS Health) | ⭐⭐⭐ Embedded AI que reduce menús |
| E-commerce | Qualtrics + Drift | ⭐⭐ Chatbot complementario |
| **Arte/Galerías** | **NINGUNO** | 🆕 **Territorio virgen** |

> **Oportunidad:** Ser la primera galería de arte con navegación 100% conversacional.

---

## 2. Riesgos Identificados (UX Research)

### ⚠️ Riesgo 1: "No sé qué preguntar"
**Problema:** Usuarios acostumbrados a menús visuales no saben formular queries  
**Mitigación MICA:**
- Saludo inicial con sugerencias: "Puedo mostrarte Rocks, retratos, o sorprenderte..."
- Botones flotantes con opciones rápidas (no menú, sino "chips")
- MICA proactiva: "¿Te cuento sobre [obra del día]?"

### ⚠️ Riesgo 2: Descubribilidad del contenido
**Problema:** El contenido queda "oculto" detrás de preguntas correctas  
**Mitigación MICA:**
- "Inventario visible": Indicador flotante "196 obras · 28 exposiciones"
- Comando "Todo": Revela grid masonry de exploración
- "Mapa mental" opcional que MICA puede mostrar

### ⚠️ Riesgo 3: Accesibilidad (WCAG)
**Problema:** Screen readers necesitan estructura semántica, no chat dinámico  
**Mitigación MICA:**
- Modo accesible automático detectado
- Fallback a navegación tradicional aria-labeled
- Transcript de conversación como texto estático

### ⚠️ Riesgo 4: Velocidad
**Problema:** Escribir > clickear para usuarios que saben lo que quieren  
**Mitigación MICA:**
- Atajos de teclado: `g` = galería, `r` = rocks, `c` = contacto
- URLs directas funcionando: `/archivo/rocks` siempre accesible
- Historial: "Lo último que viste" sin re-preguntar

### ⚠️ Riesgo 5: Frustración cuando no entiende
**Problema:** "No entiendo" loops destruyen la experiencia  
**Mitigación MICA:**
- Nunca decir "no entiendo" → Siempre ofrecer alternativas
- Fuzzy matching: "freddy" → "¿Te refieres a Freddie Mercury?"
- Escalación graciosa: "Cariño, me has pillado. Pero mira esto..."

---

## 3. Análisis DAFO

### Debilidades
- Curva de aprendizaje para usuarios de 50+
- Dependencia de API de IA (costes, latencia)
- SEO más complejo (contenido dinámico)

### Amenazas
- Usuarios que abandonan sin explorar
- Costes de API si escala (Gemini/Claude)
- Competidores copiando el concepto

### Fortalezas
- **Diferenciación radical** - Única en el sector arte
- **Alineación con marca** - MICA = mica mineral = filosofía Naroa
- **Experiencia memorable** - WOW factor instantáneo
- **Datos ricos** - Cada conversación = insight sobre usuario

### Oportunidades
- **Press coverage** - "La primera galería sin menús"
- **Caso de estudio** - Publicable en UX/AI conferences
- **Monetización** - API vendible a otras galerías
- **Engagement** - Usuarios pasan más tiempo interactuando

---

## 4. Propuesta: Modelo Híbrido Progresivo

En lugar de eliminar menús de golpe, **transición gradual**:

### Fase 0: Actual (Menú tradicional)
```
[Logo] [Galería] [Archivo] [Exposiciones] [Contacto]
```

### Fase 1: MICA como complemento
```
[Logo] [Galería] [Archivo] [Expo] [Contact]
                                    [💬 MICA]  ← Flotante
```

### Fase 2: MICA prominente
```
[Logo]  ─────────────────────────  [≡]  ← Menú colapsado
         [💬 Pregúntame cualquier cosa...]
```

### Fase 3: MICA dominante (Experimento)
```
         [Obra de fondo con blur]
         
         ┌────────────────────┐
         │  MICA te saluda... │
         └────────────────────┘
         
         [💬 Escribe o habla...]
         
         [g] galería  [r] rocks  [?] ayuda  ← Atajos sutiles
```

---

## 5. Métricas de Éxito (KPIs)

| Métrica | Objetivo Fase 1 | Objetivo Fase 3 |
|:--------|:----------------|:----------------|
| % usuarios que usan MICA | >30% | >70% |
| Tiempo medio en sitio | +20% | +50% |
| Obras vistas por sesión | +2 | +5 |
| Conversiones a contacto | +10% | +30% |
| Bounce rate | <60% | <40% |
| NPS (satisfacción) | >40 | >60 |

---

## 6. Estimación de Costes

### API (Gemini 1.5 Flash)
- ~$0.00025 por 1K tokens input
- ~$0.0005 por 1K tokens output
- Conversación media: ~2K tokens = $0.001
- 1000 usuarios/mes conversando = **$1/mes**
- 10,000 usuarios = **$10/mes** ✅ Muy asequible

### Alternativa: Regex local (sin API)
- $0/mes
- Menos "inteligente", más predecible
- Viable para MVP

---

## 7. Veredicto

### ✅ CONCEPTO VÁLIDO con condiciones:

1. **Implementar como Fase 1 primero** (MICA complementaria)
2. **Medir engagement** antes de eliminar menús
3. **Mantener fallbacks** (atajos, URLs directas, modo accesible)
4. **Empezar con regex** → escalar a Gemini API
5. **Iterar basado en datos** de usuarios reales

### 📊 Recomendación: Prototipo Fase 1

Crear versión con:
- Menú tradicional visible
- MICA como botón flotante
- Medir % de usuarios que la usan
- Si >30% la usan → avanzar a Fase 2

---

## 8. Próximos Pasos

- [ ] Crear prototipo Fase 1 con regex básico
- [ ] Desplegar A/B test (con/sin MICA)
- [ ] Medir métricas 2 semanas
- [ ] Decidir avance a Fase 2 basado en datos
