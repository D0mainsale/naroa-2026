import json
import os
from pathlib import Path

def verify_integrity():
    base_dir = Path(os.getcwd())
    # Images are in root/images/artworks based on ls output
    img_dir = base_dir / 'images' / 'artworks'
    
    # Load JSON data
    try:
        # database.json is what gallery.js loads
        with open(base_dir / 'public' / 'data' / 'database.json', 'r') as f:
            data = json.load(f)
            # Handle if it's an array or object with 'artworks' key
            artworks = data if isinstance(data, list) else data.get('artworks', [])
            
    except FileNotFoundError as e:
        print(f"❌ Critical Error: Data file not found: {e}")
        return

    print(f"🔍 Audit Started: {len(artworks)} artworks in DB")
    print(f"📂 Image Dir: {img_dir}")
    
    missing_files = []
    orphaned_files = []
    referenced_files = set()

    # 1. Check References -> Files
    for art in artworks:
        # Handle various image key formats
        # gallery.js logic: art.image ? art.image.replace('images/artworks/', '') : art.file
        img_path = art.get('image') or art.get('file')
        
        if not img_path:
            # Some entries might be text-only, skip/warn?
            # print(f"⚠️  Artwork ID {art.get('id')} has no image entry")
            continue
            
        # Clean path to get just filename
        clean_name = img_path.replace('images/artworks/', '')
        
        # Add to set of referenced files
        referenced_files.add(clean_name)
        
        # Check existence
        full_path = img_dir / clean_name
        if not full_path.exists():
            missing_files.append({
                'id': art.get('id'),
                'title': art.get('title'),
                'missing_file': clean_name,
                'raw_path': img_path
            })

    # 2. Check Files -> References (Orphans)
    if img_dir.exists():
        physical_files = set(f.name for f in img_dir.glob('*') if f.suffix.lower() in ['.webp', '.jpg', '.png'])
        orphaned_files = list(physical_files - referenced_files)
    else:
        print(f"❌ Error: Image directory {img_dir} does not exist!")
        return

    # REPORT
    print("\n" + "="*40)
    print("📊 INTEGRITY REPORT (database.json)")
    print("="*40)
    
    if missing_files:
        print(f"\n❌ MISSING IMAGES ({len(missing_files)}):")
        for m in missing_files:
            print(f"   - ID: {m['id']}")
            print(f"     Title: {m['title']}")
            print(f"     Missing: {m['missing_file']}")
    else:
        print("\n✅ All JSON references point to existing files.")

    if orphaned_files:
        print(f"\n⚠️  ORPHANED FILES ({len(orphaned_files)}):")
        print(f"   (Files in folder but not in JSON)")
        for f in sorted(orphaned_files):
            print(f"   - {f}")
    else:
        print("\n✅ No orphaned files found.")

if __name__ == "__main__":
    verify_integrity()
