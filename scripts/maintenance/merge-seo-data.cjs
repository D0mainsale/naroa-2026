const fs = require('fs');
const path = require('path');

const META_PATH = path.join(__dirname, '../../data/artworks-metadata.json');
const SEO_PATH = path.join(__dirname, '../../data/seo-artworks.json');

try {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const seo = JSON.parse(fs.readFileSync(SEO_PATH, 'utf8'));
  
  let addedCount = 0;
  let updatedCount = 0;


  const TAXONOMY = {
    'rocks': { category: 'Premium Collection', style: 'Hyperrealism', materials: ['Natural Slate', 'Acrylic'] },
    'tributos-musicales': { category: 'Music Tributes', style: 'Pop Art', materials: ['Mixed Media', 'Canvas'] },
    'enlatas': { category: 'Recycled Art', style: 'Conceptual', materials: ['Metal Cans', 'Collage'] },
    'walking-gallery': { category: 'Street Art', style: 'Urban', materials: ['Mixed Media'] },
    'retratos': { category: 'Portraits', style: 'Realism', materials: ['Oil', 'Canvas', 'Pencil'] },
    'golden': { category: 'Gold Series', style: 'Contemporary', materials: ['Gold Leaf', 'Mixed Media'] },
    'amor': { category: 'Love Series', style: 'Expressive', materials: ['Mixed Media'] },
    'naturaleza': { category: 'Nature', style: 'Naturalism', materials: ['Mixed Media'] },
    'espejos-del-alma': { category: 'Introspective', style: 'Abstract', materials: ['Mirrors', 'Mixed Media'] },
    'cantinflas': { category: 'Icons', style: 'Pop Art', materials: ['Mixed Media'] },
    'bodas': { category: 'Celebration', style: 'Romantic', materials: ['Mixed Media'] },
    'divinos': { category: 'Divine Collection', style: 'Pop Surrealism', materials: ['Digital', 'Mixed Media'] }
  };

  const enrichTaxonomy = (item) => {
    const tax = TAXONOMY[item.series] || { category: 'General', style: 'Contemporary', materials: ['Mixed Media'] };
    return {
      ...item,
      category: tax.category,
      style: tax.style,
      materials: tax.materials,
      tags: [...new Set([item.series, tax.style, ...(item.tags || [])])]
    };
  };

  // Process SEO items and merge
  seo.artworks.forEach(seoItem => {
    const enrichedItem = enrichTaxonomy(seoItem);
    const existingIndex = meta.artworks.findIndex(a => a.id === enrichedItem.id);
    
    if (existingIndex !== -1) {
      meta.artworks[existingIndex] = { ...meta.artworks[existingIndex], ...enrichedItem };
      updatedCount++;
    } else {
      meta.artworks.push(enrichedItem);
      console.log(`➕ Added new artwork with taxonomy: ${enrichedItem.title} (${enrichedItem.category})`);
      addedCount++;
    }
  });

  // Also enrich existing items that might not be in SEO file (if any)
  meta.artworks = meta.artworks.map(item => enrichTaxonomy(item));


  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
  console.log(`✅ Merge Complete: ${updatedCount} updated, ${addedCount} added.`);

} catch (err) {
  console.error('❌ Error merging:', err);
}
