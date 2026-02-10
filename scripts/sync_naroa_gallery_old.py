import json
import os
import re
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/borjafernandezangulo/game/naroa-2026")
IMAGES_DIR = PROJECT_ROOT / "public/images/artworks"
DB_PATH = PROJECT_ROOT / "data/database.json"

# Taxonomy / Heuristics for auto-categorization
SERIES_MAP = {
    "rocks": "Rocks",
    "divinos": "DiviNos",
    "cantinflas": "CantinFlowers", # Or "Cantinflas" depending on file
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
    return "Retratos Personalizados" # Default fallback for Naroa's work usually

def generate_seo(title, series, technique="Mixed Media"):
    """Generate rich SEO tags."""
    artist = "Naroa Gutiérrez Gil"
    
    alt_text = f"Obra de arte '{title}' de la serie {series} por {artist}. Técnica: {technique}."
    
    meta_desc = f"{title} - Obra original de {artist}. Parte de la colección {series}. Arte contemporáneo en Bilbao. Técnica: {technique}."
    
    schema = {
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        "name": title,
        "artist": {
            "@type": "Person",
            "name": artist
        },
        "artMedium": technique,
        "artform": "Painting", # Generalization
        "artworkSurface": "Canvas" # Generalization
    }
    
    return alt_text, meta_desc, json.dumps(schema, ensure_ascii=False)

def main():
    print(f"Loading database from {DB_PATH}")
    with open(DB_PATH, "r") as f:
        data = json.load(f)
    
    existing_files = {art["file"] for art in data["artworks"] if "file" in art}
    existing_artworks = data["artworks"]
    
    print(f"Found {len(existing_artworks)} existing artworks in DB.")
    
    # Scan images
    image_files = sorted([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg'))])
    
    new_count = 0
    
    for img_file in image_files:
        # Skip super-hq files or special system files
        if img_file.startswith("super-hq-") or "placeholder" in img_file:
            continue
            
        if img_file in existing_files:
            continue
            
        # New artwork found!
        stem = Path(img_file).stem
        title = infer_title(stem)
        series = infer_series(stem)
        
        # Determine technique based on series (heuristic)
        technique = "Mixed Media"
        if "pencil" in stem or "lapiz" in stem:
            technique = "Pencil"
        elif series == "En.lata.das":
            technique = "Sculpture / Tin"
        
        alt, meta, schema = generate_seo(title, series, technique)
        
        new_entry = {
            "id": stem,
            "title": title,
            "series": series,
            "year": 2026, # Default for new finds, manual fix needed later
            "technique": technique,
            "file": img_file,
            "tags": [series.lower(), "art", "naroa"],
            "altText": alt,
            "metaDescription": meta,
            "schemaLD": schema,
            "category": series # Legacy field comp
        }
        
        existing_artworks.append(new_entry)
        new_count += 1
        print(f"Added: {title} ({img_file})")

    data["artworks"] = existing_artworks
    
    # Save
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Done. Added {new_count} new artworks. Total: {len(data['artworks'])}")

if __name__ == "__main__":
    main()
