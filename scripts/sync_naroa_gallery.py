import json
import os
import re
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/borjafernandezangulo/game/naroa-2026")
IMAGES_DIR = PROJECT_ROOT / "public/images/artworks"
DB_PATH = PROJECT_ROOT / "data/artworks-metadata.json"  # Targeting the BIG file

# Taxonomy / Heuristics for auto-categorization
SERIES_MAP = {
    "rocks": "Rocks",
    "divinos": "DiviNos",
    "cantinflas": "CantinFlowers", 
    "en-lata": "En.lata.das",
    "lata": "En.lata.das",
    "walking": "Performance",
    "golden": "Golden Series",
    "amor": "Love & Joy",
    "naturaleza": "Nature & Fantasy",
    "retratos": "Retratos Personalizados",
    "munsters": "The Munsters",
    "facefood": "Facefood & Gastronomy",
    "flores": "Flores de Papel",
    "vaivenes": "VaiVenes"
}

def infer_title(filename_stem):
    """Convert 'amy-rocks' to 'Amy Rocks'."""
    text = filename_stem.replace("-", " ").replace("_", " ")
    return text.title()

def infer_series(filename_stem):
    """Guess series from filename."""
    lower_name = filename_stem.lower()
    for key, series in SERIES_MAP.items():
        if key in lower_name:
            return series
    return "Retratos Personalizados"

def generate_seo(title, series, technique="Mixed Media"):
    """Generate rich SEO tags."""
    artist = "Naroa Gutiérrez Gil"
    # Create simple alt text and meta for now, assuming Spanish context
    alt_text = f"Obra de arte '{title}' de la serie {series} por {artist}. Técnica: {technique}."
    meta_desc = f"{title} - Obra original de {artist}. Parte de la colección {series}. Arte contemporáneo en Bilbao. Técnica: {technique}."
    
    schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        "name": title,
        "artist": {
            "@type": "Person",
            "name": artist
        },
        "artMedium": technique,
        "artform": "Painting", 
        "artworkSurface": "Canvas"
    }, ensure_ascii=False)
    
    return alt_text, meta_desc, schema

def main():
    print(f"Loading metadata from {DB_PATH}")
    # Read existing data
    try:
        with open(DB_PATH, "r") as f:
            # Handle potential JSON or array root
            content = f.read()
            # If it wrapped in "artworks": [] or is a list directly?
            # Based on previous view, it seemed to be a list of objects at root? 
            # Actually line 800 indent suggests it's inside an object or array.
            data = json.loads(content)
    except Exception as e:
        print(f"Error reading DB: {e}")
        return

    # Normalize data structure (if it's a dict with "artworks" key, use that. If list, use that)
    if isinstance(data, dict) and "artworks" in data:
        artworks_list = data["artworks"]
        is_wrapper = True
    elif isinstance(data, list):
        artworks_list = data
        is_wrapper = False
    else:
        print("Unknown JSON structure")
        return

    existing_files = set()
    for art in artworks_list:
        if "file" in art:
             # Normalize path: remove 'images/artworks/' prefix if present for comparison
             fname = art["file"].replace("images/artworks/", "")
             existing_files.add(fname)
        elif "image" in art:
             fname = art["image"].replace("images/artworks/", "")
             existing_files.add(fname)
    
    print(f"Found {len(artworks_list)} existing artworks in metadata.")
    
    # Scan images
    image_files = sorted([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg'))])
    
    new_count = 0
    

    for img_file in image_files:
        # Ignore variants and system files
        if (img_file.startswith("super-hq-") or 
            img_file.startswith("blur-") or 
            img_file.startswith("web-") or 
            img_file.startswith("source-") or 
            "placeholder" in img_file):
            continue
            
        if img_file in existing_files:
            continue
            
        # Add new
        stem = Path(img_file).stem
        title = infer_title(stem)
        series = infer_series(stem)
        technique = "Mixed Media"
        if "pencil" in stem: technique = "Pencil"
        
        alt, meta, schema = generate_seo(title, series, technique)
        
        new_entry = {
            "id": stem,
            "title": title,
            "series": series,
            "technique": technique,
            "year": 2026,
            "file": f"images/artworks/{img_file}", # Standardize path
            "image": f"images/artworks/{img_file}", # Dual compatibility
            "altText": alt,
            "metaDescription": meta,
            "schemaLD": schema,
            "category": series
        }
        
        artworks_list.append(new_entry)
        new_count += 1
        print(f"Added: {title}")

    # Write back
    if is_wrapper:
        data["artworks"] = artworks_list
    else:
        data = artworks_list
        
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Done. Added {new_count} new artworks. Total: {len(artworks_list)}")

if __name__ == "__main__":
    main()
