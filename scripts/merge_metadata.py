import json
import os
from pathlib import Path
from difflib import SequenceMatcher

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def merge_data():
    base_dir = Path(os.getcwd())
    db_path = base_dir / 'public' / 'data' / 'database.json'
    notebook_path = base_dir / 'notebook_data.json'

    with open(db_path, 'r') as f:
        db_data = json.load(f)
        # Handle if it's an object with 'artworks' key
        artworks = db_data['artworks'] if isinstance(db_data, dict) and 'artworks' in db_data else db_data

    with open(notebook_path, 'r') as f:
        notebook_data = json.load(f)

    print(f"Loaded {len(artworks)} artworks from DB")
    print(f"Loaded {len(notebook_data)} artworks from Notebook")

    updated_count = 0
    matched_ids = set()

    # 1. Direct ID Match
    for note_art in notebook_data:
        note_id = note_art.get('id')
        found = False
        
        # Try exact ID match
        for art in artworks:
            if art.get('id') == note_id:
                update_artwork(art, note_art)
                matched_ids.add(note_id)
                found = True
                updated_count += 1
                break
        
        if not found:
            # Try fuzzy Title match
            best_match = None
            highest_ratio = 0.0
            note_title = note_art.get('title', '').lower()
            
            for art in artworks:
                art_title = art.get('title', '').lower()
                ratio = similar(note_title, art_title)
                if ratio > 0.85: # High threshold for safety
                    if ratio > highest_ratio:
                        highest_ratio = ratio
                        best_match = art
            
            if best_match:
                print(f"🔗 Fuzzy Match: '{note_title}' -> '{best_match.get('title')}' (Score: {highest_ratio:.2f})")
                update_artwork(best_match, note_art)
                matched_ids.add(note_id)
                updated_count += 1

    print(f"\n✅ Updated {updated_count} artworks with new metadata.")
    
    # Save updated DB
    # Preserve original structure
    if isinstance(db_data, dict) and 'artworks' in db_data:
        db_data['artworks'] = artworks
    else:
        db_data = artworks

    with open(db_path, 'w') as f:
        json.dump(db_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved updated database to {db_path}")

def update_artwork(target, source):
    # Only update empty or missing fields, OR fields that are clearly better in source
    
    # Year
    if not target.get('year') and source.get('year'):
        target['year'] = source['year']
    
    # Technique
    if not target.get('technique') and source.get('technique'):
        target['technique'] = source['technique']
    
    # Series (if missing)
    if not target.get('series') and source.get('series'):
        target['series'] = source['series']
        
    # Alt Text / Description (Always add if available)
    if source.get('altText'):
        target['description'] = source.get('altText') # Map altText to description for now

    # Ensure format consistency
    if 'technique' in target:
        target['technique'] = target['technique'].capitalize()

if __name__ == "__main__":
    merge_data()
