const fs = require('fs');
const path = require('path');

const METADATA_PATH = path.join(__dirname, '../../data/artworks-metadata.json');
const IMAGES_DIR = path.join(__dirname, '../../public/images/artworks'); // Assume public/images/artworks is the source of truth
const RELATIVE_IMG_DIR = 'images/artworks';

// Map of common ID variations to actual filenames found in listing
const MANUAL_MAPPING = {
    'james-rocks': 'james-rocks-hq-3.webp',
    'johnny-rocks': 'johnny-rocks-hq-5.webp',
    'marilyn-rocks': 'marilyn-rocks-hq-5.webp'
};

function fixMetadata() {
    console.log('🔧 Starting Image Path Repair...');
    
    if (!fs.existsSync(METADATA_PATH)) {
        console.error('❌ Metadata file not found:', METADATA_PATH);
        return;
    }

    const data = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    let changes = 0;

    // Get actual files in directory
    const actualFiles = new Set(fs.readdirSync(IMAGES_DIR));
    
    data.artworks.forEach(artwork => {
        let validImage = null;
        
        // 1. Check existing image property
        if (artwork.image) {
            const basename = path.basename(artwork.image);
            if (actualFiles.has(basename)) {
                 // It's valid, but ensure path consistency
                 const newPath = `${RELATIVE_IMG_DIR}/${basename}`;
                 if (artwork.image !== newPath) {
                     artwork.image = newPath;
                     changes++;
                 }
                 return;
            } else {
                console.warn(`⚠️  Image not found for ${artwork.id}: ${artwork.image}`);
            }
        }

        // 2. Try to find a match by ID
        const candidates = [
            `${artwork.id}.webp`,
            `${artwork.id}.jpg`,
            `${artwork.id}.png`,
            MANUAL_MAPPING[artwork.id] // Check manual map
        ];

        for (const candidate of candidates) {
            if (candidate && actualFiles.has(candidate)) {
                validImage = `${RELATIVE_IMG_DIR}/${candidate}`;
                break;
            }
        }

        // 3. Fallback: Fuzzy search (e.g. "james-rocks" matches "james-rocks-hq-3.webp")
        if (!validImage) {
            const fuzzyMatch = Array.from(actualFiles).find(f => f.startsWith(artwork.id));
            if (fuzzyMatch) {
                validImage = `${RELATIVE_IMG_DIR}/${fuzzyMatch}`;
            }
        }

        if (validImage) {
            console.log(`✅ Fixed ${artwork.id} -> ${validImage}`);
            artwork.image = validImage;
            changes++;
        } else {
            console.error(`❌ NO IMAGE FOUND for ${artwork.id}`);
            // Set a default placeholder to prevent broken UI
            artwork.image = 'images/artworks/placeholder.webp'; 
            changes++;
        }
    });

    if (changes > 0) {
        fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
        console.log(`🎉 Updated ${changes} artworks in metadata.`);
    } else {
        console.log('✨ No changes needed.');
    }
}

fixMetadata();
