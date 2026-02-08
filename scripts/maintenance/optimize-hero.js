import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_DIR = 'images/artworks'; // Relative to process.cwd()
const FILES = [
  'source-amy.png',
  'source-james.png',
  'source-johnny.png',
  'source-marilyn.png',
  'source-portrait-1.png',
  'source-portrait-2.png'
];

async function optimizeHero() {
  console.log('🚀 Starting Lossless Optimization for Hero Images...');

  for (const file of FILES) {
    const inputPath = path.join(SRC_DIR, file);
    const outputFilename = file.replace('source-', 'super-hq-').replace('.png', '.webp');
    const outputPath = path.join(SRC_DIR, outputFilename);

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️ Source file not found: ${inputPath}`);
      continue;
    }

    try {
      console.log(`Processing ${file} ...`);
      await sharp(inputPath)
        .webp({ 
          lossless: true, 
          quality: 100, 
          effort: 6 // Max compression effort
        })
        .toFile(outputPath);
      
      const originalSize = fs.statSync(inputPath).size / (1024 * 1024);
      const newSize = fs.statSync(outputPath).size / (1024 * 1024);
      
      console.log(`✅ Optimized ${outputFilename}: ${originalSize.toFixed(2)}MB -> ${newSize.toFixed(2)}MB`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }
}

optimizeHero();
