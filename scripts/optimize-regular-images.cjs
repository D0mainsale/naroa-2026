const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

/**
 * Optimize all regular images (thumbnails, optimized, regular artworks)
 * PRESERVE giant images: *hq*, *4x*, *source*
 */

const PRESERVE_PATTERNS = ['*hq*', '*4x*', '*source*', '*super-hq*'];
const OPTIMIZE_DIRS = ['images/thumbnails', 'images/optimized', 'images/artworks'];

async function shouldOptimize(filePath) {
  const basename = path.basename(filePath).toLowerCase();
  
  // Skip if matches preserve pattern
  for (const pattern of PRESERVE_PATTERNS) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    if (regex.test(basename)) {
      console.log(`⏭️  SKIP (preserve): ${filePath}`);
      return false;
    }
  }
  
  // Skip if already optimized
  if (basename.endsWith('.webp')) {
    const stats = fs.statSync(filePath);
    if (stats.size < 500 * 1024) { // < 500KB = ya optimizado
      console.log(`⏭️  SKIP (already small): ${filePath}`);
      return false;
    }
  }
  
  return true;
}

async function optimizeImage(inputPath) {
  try {
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    
    // Decide output format
    let outputPath;
    let processor = sharp(inputPath);
    
    if (ext === '.webp') {
      // Re-compress WebP
      outputPath = inputPath;
      processor = processor.webp({ quality: 85, effort: 6 });
    } else {
      // Convert to WebP
      outputPath = path.join(dir, `${basename}.webp`);
      processor = processor.webp({ quality: 85, effort: 6 });
    }
    
    // Resize if too large (max 1920px width for regular images)
    const metadata = await sharp(inputPath).metadata();
    if (metadata.width > 1920) {
      processor = processor.resize(1920, null, { withoutEnlargement: true });
    }
    
    const info = await processor.toFile(outputPath + '.tmp');
    
    // Replace original only if smaller
    const originalSize = fs.statSync(inputPath).size;
    const newSize = info.size;
    
    if (newSize < originalSize) {
      fs.renameSync(outputPath + '.tmp', outputPath);
      if (ext !== '.webp') {
        fs.unlinkSync(inputPath); // Delete original PNG/JPG
      }
      const saved = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✅ ${inputPath} → ${(newSize / 1024).toFixed(0)}KB (saved ${saved}%)`);
    } else {
      fs.unlinkSync(outputPath + '.tmp');
      console.log(`⏭️  SKIP (no improvement): ${inputPath}`);
    }
  } catch (err) {
    console.error(`❌ Error optimizing ${inputPath}:`, err.message);
  }
}

async function main() {
  console.log('🔍 Finding images to optimize...\n');
  
  const allFiles = [];
  for (const dir of OPTIMIZE_DIRS) {
    const pattern = `${dir}/**/*.{jpg,jpeg,png,webp}`;
    const files = await glob(pattern, { nocase: true });
    allFiles.push(...files);
  }
  
  console.log(`📦 Found ${allFiles.length} total images\n`);
  
  const toOptimize = [];
  for (const file of allFiles) {
    if (await shouldOptimize(file)) {
      toOptimize.push(file);
    }
  }
  
  console.log(`\n🎯 ${toOptimize.length} images to optimize\n`);
  
  let optimized = 0;
  for (const file of toOptimize) {
    await optimizeImage(file);
    optimized++;
  }
  
  console.log(`\n✅ Optimization complete! Processed ${optimized}/${toOptimize.length} images`);
}

main().catch(console.error);
