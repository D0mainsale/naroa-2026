/**
 * BLOG ENGINE - CMS Minimalista para MICA v2.0
 * Posts en markdown con integración comercial
 */

(function() {
  'use strict';

  const BlogEngine = {
    posts: [
      {
        id: 'rocks-mica-mineral',
        title: 'Los Rocks: iconos del rock con mica mineral',
        summary: 'Te cuento cómo Naroa transforma a los iconos del rock usando mi mineral favorito.',
        category: 'tecnica',
        relatedArtworks: ['rocks', 'jimi-hendrix', 'david-bowie', 'amy-winehouse'],
        tags: ['mica', 'retrato', 'rock', 'técnica'],
        body: `
# Los Rocks: iconos del rock con mica mineral

¿Sabes por qué me llamo MICA? Cada retrato de la serie **Rocks** lleva incrustaciones de **mica mineral auténtica** en los ojos. Sí, el mismo mineral que da nombre a tu galerista favorita. 💎

## ¿Qué hace Naroa con la mica?
La mica es un mineral que brilla de forma natural con la luz. Naroa la descubrió por accidente en una playa de Bilbao y desde entonces es su firma distintiva. Cuando la luz cambia, los ojos del retrato parecen *seguirte*.

## El proceso que yo vigilo
1. Retrato base en acrílico sobre lienzo
2. Capa de médium brillante en la zona ocular
3. Incrustación de escamas de mica natural
4. Sellado final para preservar el brillo

**Cada pieza es única** - la mica se comporta diferente según la luz de TU espacio. 

¿Quieres ver cómo quedaría en tu pared? → [Ver serie Rocks](#/archivo/rocks)
        `,
        publishedAt: '2026-01-15'
      },
      {
        id: 'filosofia-kintsugi',
        title: 'Filosofía Kintsugi: el problema como trampolín',
        summary: 'La técnica japonesa de dorar las grietas: así trabaja Naroa.',
        category: 'filosofia',
        relatedArtworks: ['en-lata', 'kintsugi', 'conservas-emocionales'],
        tags: ['kintsugi', 'filosofía', 'grietas', 'oro'],
        body: `
# Filosofía Kintsugi: el problema como trampolín

El **kintsugi** es el arte japonés de reparar cerámica rota con oro. En lugar de ocultar las grietas, las celebra. Y déjame decirte: Naroa aplica esto a TODO.

## ¿Cómo funciona en su arte?
Cuando un lienzo se rompe o un trazo sale "mal", Naroa no lo descarta. Lo dora. Lo convierte en el punto focal. He visto cómo transforma accidentes en obras maestras.

## La serie En.lata
Las **conservas emocionales** son mi ejemplo favorito: emociones "rotas" (tristeza, rabia, nostalgia) enlatadas y doradas. Lo que normalmente escondemos, exhibido con orgullo. Muy Naroa.

## Para ti, coleccionista
Cada pieza con kintsugi tiene una historia de "error transformado". El certificado de autenticidad incluye la narrativa de esa grieta específica. **Historia + arte = valor.**

→ [Explora la serie En.lata](#/archivo/en-lata)
        `,
        publishedAt: '2026-01-20'
      },
      {
        id: 'invertir-arte-emergente',
        title: 'Invertir en arte emergente: guía de tu galerista',
        summary: 'Te cuento sin rodeos cómo empezar tu colección de arte.',
        category: 'mercado',
        relatedArtworks: [],
        tags: ['inversión', 'colección', 'mercado', 'arte emergente'],
        body: `
# Invertir en arte emergente: guía de tu galerista

Hola, soy MICA, y voy a ser directa contigo: coleccionar arte NO es solo para millonarios. Aquí te cuento cómo empezar con **1.000-3.000€**.

## Por qué arte emergente (como el de Naroa)
- **Precios accesibles** antes del boom
- **Relación directa** con la artista (a través de mí 😉)
- **Potencial de revalorización** 5-10x en 10 años
- **Placer estético** inmediato en tu espacio

## Qué busco yo en una buena inversión
1. **Técnica distintiva** (ej: mica mineral en los ojos ✨)
2. **Trayectoria demostrable** (exposiciones, prensa)
3. **Certificado de autenticidad**
4. **Ediciones limitadas** (numeradas y firmadas)

## Formatos de entrada
| Formato | Precio | Ideal para |
|---------|--------|------------|
| Print firmado | 150-400€ | Primera compra |
| Obra pequeña | 800-1.500€ | Coleccionista primerizo |
| Obra mediana | 1.500-4.000€ | Inversión seria |
| Encargo personalizado | Desde 2.500€ | Pieza única |

## Mi consejo final
Elige una obra que te **emocione**, no solo que "parezca buena inversión". El arte que amas lo disfrutas mientras se revaloriza.

→ [Ver galería completa](#/galeria)
→ [Pregúntame sobre encargos](#/contacto)
        `,
        publishedAt: '2026-01-25'
      }
    ],

    /**
     * Obtener todos los posts
     */
    getAllPosts() {
      return this.posts.sort((a, b) => 
        new Date(b.publishedAt) - new Date(a.publishedAt)
      );
    },

    /**
     * Obtener post por ID
     */
    getPostById(id) {
      return this.posts.find(p => p.id === id) || null;
    },

    /**
     * Filtrar por categoría
     */
    getPostsByCategory(category) {
      return this.posts.filter(p => p.category === category);
    },

    /**
     * Obtener posts relacionados con una obra
     */
    getRelatedPosts(artworkId) {
      return this.posts.filter(p => 
        p.relatedArtworks.includes(artworkId)
      );
    },

    /**
     * Búsqueda simple por texto
     */
    search(query) {
      const q = query.toLowerCase();
      return this.posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.body.toLowerCase().includes(q)
      );
    },

    /**
     * Detectar intención y sugerir post (para MICA)
     */
    suggestPost(userMessage) {
      const msg = userMessage.toLowerCase();
      
      // Mapeo de intenciones a posts
      const intentMap = [
        { keywords: ['mica', 'ojos', 'mineral', 'brillo', 'rocks', 'rock'], postId: 'rocks-mica-mineral' },
        { keywords: ['kintsugi', 'grietas', 'dorar', 'rotura', 'error', 'problema'], postId: 'filosofia-kintsugi' },
        { keywords: ['invertir', 'comprar', 'precio', 'colección', 'mercado', 'valor'], postId: 'invertir-arte-emergente' }
      ];
      
      for (const intent of intentMap) {
        if (intent.keywords.some(k => msg.includes(k))) {
          return this.getPostById(intent.postId);
        }
      }
      
      return null;
    },

    /**
     * Renderizar markdown básico a HTML
     */
    renderMarkdown(md) {
      return md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^([0-9]+)\. (.*$)/gim, '<li>$2</li>')
        .replace(/\n/gim, '<br>');
    }
  };

  // Export global
  window.BlogEngine = BlogEngine;
  
  console.log('[BlogEngine] Inicializado con', BlogEngine.posts.length, 'posts');
})();
