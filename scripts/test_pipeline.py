#!/usr/bin/env python3
"""
Test del Pipeline UltraCine - Modo Dry Run
Verifica configuración, imágenes y genera prompts sin llamar a la API
"""

import os
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Literal

# Configuración del proyecto
PROJECT_ROOT = Path(__file__).parent.parent
IMAGES_DIR = PROJECT_ROOT / "images" / "artworks"
OUTPUT_DIR = PROJECT_ROOT / "assets" / "videos" / "output"

@dataclass
class ShotConfig:
    shot_id: str
    prompt: str
    aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9"
    version_name: str = "A"
    use_audio: bool = True
    motion_intensity: float = 0.4

def verify_images():
    """Verifica que las imágenes existen"""
    print("\n🖼️  VERIFICACIÓN DE IMÁGENES")
    print("=" * 50)
    
    images = list(IMAGES_DIR.glob("*.webp"))
    print(f"✓ Encontradas: {len(images)} imágenes .webp")
    
    # Imágenes clave para videos
    key_images = [
        "amy-rocks.webp",
        "johnny-rocks-hq-1.webp", 
        "lagrimas-de-oro.webp",
        "baroque-farrokh.webp",
        "celia-cruz-asucar.webp"
    ]
    
    for img in key_images:
        path = IMAGES_DIR / img
        if path.exists():
            size_kb = path.stat().st_size / 1024
            print(f"  ✓ {img} ({size_kb:.0f} KB)")
        else:
            print(f"  ✗ {img} NO ENCONTRADA")
    
    return len(images)

def generate_test_prompts():
    """Genera prompts de prueba para verificar formato"""
    print("\n🎬 PROMPTS GENERADOS (DRY RUN)")
    print("=" * 50)
    
    shots = [
        ShotConfig(
            shot_id="trans_rocks_amy_johnny",
            prompt="""Liquid paint morph transition, 8 seconds.
Frame A: Amy Winehouse hyperrealist pop art portrait, bold colors, beehive hair.
Frame B: Johnny Depp portrait in matching Rocks aesthetic, intense gaze.
Interpolation: Features dissolve into flowing paint streams, colors blend.
Midpoint: Abstract color explosion - neither face recognizable.
Atmosphere: Dark gallery with golden particles floating.""",
            aspect_ratio="16:9",
            motion_intensity=0.6
        ),
        ShotConfig(
            shot_id="loop_golden_tears",
            prompt="""Seamless loop, 8 seconds.
First frame: Golden artwork 'Lágrimas de Oro'. Last frame: Exact same.
Internal motion: Gold leaf particles floating in divine light beams,
soft fabric waving in slow motion, candle flicker on gold surface.
Camera: locked, micro-breathing returning to origin.
Negative: no cuts, no scene changes, locked exposure.""",
            aspect_ratio="9:16",  # Spotify Canvas
            motion_intensity=0.15
        ),
        ShotConfig(
            shot_id="trans_freddie_celia",
            prompt="""Atmospheric dissolve transition, 10 seconds.
Frame A: Baroque Farrokh (Freddie Mercury) portrait, dramatic lighting.
Frame B: Celia Cruz Asucar portrait, vibrant tropical colors.
Interpolation: Musical notes float between portraits,
colors shift from baroque gold to tropical sunshine.
Midpoint: Pure musical energy - silhouettes merging.""",
            aspect_ratio="16:9",
            motion_intensity=0.5
        )
    ]
    
    for i, shot in enumerate(shots, 1):
        print(f"\n--- Shot {i}: {shot.shot_id} ---")
        print(f"Aspect: {shot.aspect_ratio} | Motion: {shot.motion_intensity}")
        print(f"Audio: {'Veo 3.1' if shot.use_audio else 'Fast (mudo)'}")
        print(f"Prompt preview: {shot.prompt[:100]}...")
        
        # Calcular costo estimado
        cost_per_sec = 0.40 if shot.use_audio else 0.15
        cost = 8 * cost_per_sec
        print(f"💰 Costo estimado: ${cost:.2f}")
    
    return shots

def verify_output_structure():
    """Verifica estructura de carpetas de salida"""
    print("\n📁 ESTRUCTURA DE OUTPUT")
    print("=" * 50)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "shots").mkdir(exist_ok=True)
    (OUTPUT_DIR / "extends").mkdir(exist_ok=True)
    (OUTPUT_DIR / "contact_sheets").mkdir(exist_ok=True)
    
    print(f"✓ Output dir: {OUTPUT_DIR}")
    print(f"✓ shots/")
    print(f"✓ extends/")
    print(f"✓ contact_sheets/")

def check_api_key():
    """Verifica si hay API key configurada"""
    print("\n🔑 API KEY STATUS")
    print("=" * 50)
    
    key = os.environ.get("GOOGLE_API_KEY")
    if key:
        print(f"✓ GOOGLE_API_KEY configurada ({key[:8]}...)")
        return True
    else:
        print("⚠️ GOOGLE_API_KEY no configurada")
        print("   Para generar videos reales, ejecuta:")
        print("   export GOOGLE_API_KEY='tu_key_aqui'")
        return False

def main():
    print("=" * 60)
    print("🎬 ULTRACINE PIPELINE - TEST MODE")
    print("   Naroa Gallery 2026")
    print("=" * 60)
    
    # 1. Verificar imágenes
    num_images = verify_images()
    
    # 2. Verificar estructura
    verify_output_structure()
    
    # 3. Generar prompts de prueba
    shots = generate_test_prompts()
    
    # 4. Verificar API key
    has_key = check_api_key()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"Imágenes disponibles: {num_images}")
    print(f"Shots configurados: {len(shots)}")
    print(f"Costo total estimado: ${sum(8 * 0.40 for s in shots):.2f}")
    print(f"API Ready: {'✓ SÍ' if has_key else '✗ NO (dry run)'}")
    
    if has_key:
        print("\n🚀 Pipeline listo para generar videos reales")
        print("   Ejecuta: python scripts/ultra_cine.py")
    else:
        print("\n💡 Para ejecutar generación real:")
        print("   1. Configura: export GOOGLE_API_KEY='tu_key'")
        print("   2. Ejecuta: python scripts/ultra_cine.py")
    
    print("\n" + "=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
