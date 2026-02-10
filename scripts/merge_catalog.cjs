const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../data/works-complete-catalog.json');
const dbPath = path.join(__dirname, '../data/database.json');
const taxonomyPath = path.join(__dirname, '../data/artworks-taxonomy.json');
const artworksListPath = path.join(__dirname, '../artworks_list.txt');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const artworksFiles = fs.readFileSync(artworksListPath, 'utf8').split('\n').filter(Boolean);

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Handle accents
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const finalDb = [];
const seenTitles = new Set();

// Catalog is the source of truth
catalog.works.forEach((work, index) => {
    const slug = slugify(work.titulo);
    
    // Attempt to match image
    let imageFile = artworksFiles.find(f => f === `${slug}.webp`);
    if (!imageFile) imageFile = artworksFiles.find(f => f.includes(slug) && f.endsWith('.webp'));
    
    // Case specific hardcoded mapping for key works
    if (work.titulo.includes('Asúcar')) imageFile = 'celia-cruz-cantinflowers.webp';
    if (work.titulo.includes('Cantinflas I')) imageFile = 'cantinflas-0.webp';
    if (work.titulo.includes('Cantinflas II')) imageFile = 'cantinflas-1.webp';
    if (work.titulo.includes('Cantinflas III')) imageFile = 'cantinflas-2.webp';
    if (work.titulo.includes('Cantinflas IV')) imageFile = 'cantinflas-3.webp';
    if (work.titulo.includes('Cantinflas V')) imageFile = 'cantinflas-4.webp';

    let series = work.serie_o_categoria.split('/')[0].trim().toLowerCase();
    if (series.startsWith('serie:')) series = series.replace('serie:', '').trim();
    const taxKeys = Object.keys(taxonomy.series);
    const matchedKey = taxKeys.find(k => k === series || taxonomy.series[k].displayName.toLowerCase() === series);
    const finalSeries = matchedKey || series;

    finalDb.push({
        id: slug || `work-${index}`,
        title: work.titulo,
        series: finalSeries,
        year: parseInt(work.ano) || 2026,
        technique: work.tecnica || 'Mixta',
        image: imageFile ? `images/artworks/${imageFile}` : 'images/artworks/placeholder.webp',
        altText: `Obra ${work.titulo} de Naroa Gutiérrez Gil`,
        metaDescription: `${work.titulo} - Arte por Naroa Gutiérrez Gil. ${work.tecnica || ''}`,
        category: work.serie_o_categoria || 'Collection',
        style: 'Mixed Media',
        featured: index < 10
    });
});

fs.writeFileSync(dbPath, JSON.stringify(finalDb, null, 2));
console.log(`Successfully populated database.json with ${finalDb.length} artworks`);
