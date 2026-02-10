const fs = require('fs');
const path = require('path');

const artworksDir = path.join(__dirname, '../images/artworks');

const files = fs.readdirSync(artworksDir);
const pngs = files.filter(f => f.endsWith('.png'));
const webps = new Set(files.filter(f => f.endsWith('.webp')).map(f => f.replace('.webp', '')));

let deletedCount = 0;
pngs.forEach(png => {
    const base = png.replace('.png', '');
    if (webps.has(base)) {
        fs.unlinkSync(path.join(artworksDir, png));
        deletedCount++;
    }
});

console.log(`Deleted ${deletedCount} redundant PNG files.`);
