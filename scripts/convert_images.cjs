const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const artworkDir = 'public/images/artworks';
const files = [
  'source-amy.png',
  'source-james.png', 
  'source-marilyn.png',
  'source-johnny.png',
  'source-portrait-1.png',
  'source-portrait-2.png'
];

files.forEach(file => {
  const input = path.join(artworkDir, file);
  if (!fs.existsSync(input)) return;
  
  const name = file.replace('source-', '').replace('.png', '');
  const output = path.join(artworkDir, `hq-${name}.webp`);
  
  sharp(input)
    .resize(2560, null, { withoutEnlargement: true })
    .webp({ quality: 90, smartSubsample: true })
    .toFile(output)
    .then(info => console.log(`Converted ${file} to ${output}`))
    .catch(err => console.error(`Error converting ${file}:`, err));
});
