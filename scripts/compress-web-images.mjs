/**
 * compress-web-images.mjs
 * Comprime in-place las imágenes >500KB del directorio images/artworks.
 * - WebP: quality 80, max width 2400px (suficiente para lightbox 4K)
 * - PNG → WebP convertido
 * - Backup de originales en images/artworks/.originals/
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const ARTWORKS_DIR = './images/artworks';
const BACKUP_DIR = './images/artworks/.originals';
const MAX_WIDTH = 2400;
const WEBP_QUALITY = 80;
const MIN_SIZE_BYTES = 500 * 1024; // 500KB threshold

async function main() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  
  const files = await fs.readdir(ARTWORKS_DIR);
  const imageFiles = files.filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
  
  let totalSaved = 0;
  let processed = 0;
  
  for (const file of imageFiles) {
    const filePath = path.join(ARTWORKS_DIR, file);
    const stat = await fs.stat(filePath);
    
    if (stat.size < MIN_SIZE_BYTES) continue;
    
    const originalSize = stat.size;
    const ext = path.extname(file).toLowerCase();
    const baseName = path.parse(file).name;
    
    try {
      // Read and get metadata
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      // Backup original
      await fs.copyFile(filePath, path.join(BACKUP_DIR, file));
      
      // Determine output path (convert PNG/JPG → WebP)
      const outputName = ext === '.webp' ? file : `${baseName}.webp`;
      const outputPath = path.join(ARTWORKS_DIR, outputName);
      
      // Resize + compress
      const pipeline = sharp(filePath);
      
      if (metadata.width > MAX_WIDTH) {
        pipeline.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
      
      await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outputPath + '.tmp');
      
      // Replace original
      await fs.rename(outputPath + '.tmp', outputPath);
      
      // If we converted from PNG/JPG, remove the original non-webp file
      if (ext !== '.webp' && outputName !== file) {
        await fs.unlink(filePath);
      }
      
      const newStat = await fs.stat(outputPath);
      const saved = originalSize - newStat.size;
      totalSaved += saved;
      processed++;
      
      const ratio = ((1 - newStat.size / originalSize) * 100).toFixed(1);
      console.log(
        `  ✅ ${file}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newStat.size / 1024 / 1024).toFixed(1)}MB (-${ratio}%)`
      );
      
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n🎯 Total: ${processed} images, saved ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(console.error);
