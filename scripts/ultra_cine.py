#!/usr/bin/env python3
"""
UltraCine Pipeline v2.0
Pipeline profesional de generación de video para Google AI Ultra (Veo 3.1)
Soporta: A/B testing masivo, extend de clips, referencias consistentes, tracking de costos Ultra

Instalación:
    pip install google-genai opencv-python pillow requests

Uso:
    export GOOGLE_API_KEY="tu_key_ultra"
    python ultra_cine.py
"""

import os
import json
import time
import logging
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Literal
from datetime import datetime

import cv2
from google import genai
from google.genai import types
from PIL import Image
import requests

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ultra_cine.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class ShotConfig:
    """Configuración de un shot cinematográfico"""
    shot_id: str
    prompt: str
    duration_seconds: int = 8
    aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9"
    version_name: str = "A"
    use_audio: bool = True
    extend_from: Optional[str] = None
    camera_movement: Optional[str] = None
    
    def get_model(self) -> str:
        """Retorna el modelo según configuración"""
        if self.use_audio:
            return "veo-3.1-generate-preview"
        else:
            return "veo-3.1-fast-generate-preview"


@dataclass
class ProjectConfig:
    """Configuración global del proyecto Ultra"""
    project_name: str
    output_dir: str = "./output"
    reference_images: List[str] = None
    aspect_ratio: str = "16:9"
    quality_preset: Literal["ultra", "fast"] = "ultra"
    monthly_budget_usd: float = 250.0
    cost_per_second_ultra: float = 0.40
    cost_per_second_fast: float = 0.15
    requests_per_minute: int = 20
    safety_buffer: float = 1.2


class ReferenceValidator:
    """Valida y prepara imágenes de referencia para Veo (máx 3, <20MB)"""
    
    MAX_IMAGES = 3
    MAX_SIZE_MB = 20
    SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.webp'}
    
    def __init__(self, image_paths: List[str]):
        self.image_paths = [Path(p) for p in image_paths if p]
        self.validated = []
        
    def validate(self) -> List[types.Image]:
        """Valida y convierte imágenes a formato GenAI"""
        if len(self.image_paths) > self.MAX_IMAGES:
            raise ValueError(f"Veo permite máximo {self.MAX_IMAGES} imágenes")
        
        validated = []
        for img_path in self.image_paths:
            if not img_path.exists():
                raise FileNotFoundError(f"No encontrada: {img_path}")
            
            if img_path.suffix.lower() not in self.SUPPORTED_FORMATS:
                raise ValueError(f"Formato no soportado: {img_path.suffix}")
            
            size_mb = img_path.stat().st_size / (1024 * 1024)
            if size_mb > self.MAX_SIZE_MB:
                raise ValueError(f"{img_path.name} excede {self.MAX_SIZE_MB}MB")
            
            with open(img_path, "rb") as f:
                image_bytes = f.read()
            
            validated.append(types.Image(image_bytes=image_bytes))
            logger.info(f"✓ Referencia validada: {img_path.name} ({size_mb:.1f}MB)")
            
        return validated


class VideoExtender:
    """Maneja extensión de videos usando first/last frame"""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.extends_dir = output_dir / "extends"
        self.extends_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_last_frame(self, video_path: Path) -> Path:
        """Extrae último frame para continuación"""
        cap = cv2.VideoCapture(str(video_path))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames - 1)
        
        ret, frame = cap.read()
        if not ret:
            raise ValueError(f"No se pudo extraer frame de {video_path}")
        
        frame_path = self.extends_dir / f"{video_path.stem}_lastframe.png"
        cv2.imwrite(str(frame_path), frame)
        cap.release()
        
        logger.info(f"Frame final extraído: {frame_path}")
        return frame_path
    
    def prepare_extend_prompt(self, original: str, continuation: str) -> str:
        """Prepara prompt para continuación seamless"""
        return (f"{original}. Continuation: {continuation}. "
                f"Maintain exact lighting, color grading, atmosphere. "
                f"Seamless temporal continuation.")


class UltraCinePipeline:
    """Pipeline principal de producción para Google AI Ultra"""
    
    def __init__(self, api_key: str, config: ProjectConfig):
        self.client = genai.Client(api_key=api_key)
        self.config = config
        self.output_dir = Path(config.output_dir) / config.project_name
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Validar referencias globales
        self.reference_images = []
        if config.reference_images:
            validator = ReferenceValidator(config.reference_images)
            self.reference_images = validator.validate()
            logger.info(f"✓ {len(self.reference_images)} referencias cargadas")
        
        self.extender = VideoExtender(self.output_dir)
        
        # Tracking
        self.session_cost = 0.0
        self.requests_made = 0
        self.last_request_time = 0
        self.min_interval = 60.0 / (config.requests_per_minute / config.safety_buffer)
        
        self.project_log = {
            "project_name": config.project_name,
            "start_time": datetime.now().isoformat(),
            "shots": [],
            "total_cost_usd": 0.0,
            "config": asdict(config)
        }
        
    def _wait_rate_limit(self):
        """Rate limiting de 20 req/min"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_interval:
            sleep_time = self.min_interval - elapsed
            logger.info(f"Rate limiting: {sleep_time:.1f}s...")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def _calculate_cost(self, shot: ShotConfig) -> float:
        """Calcula costo estimado de un shot"""
        cost_per_sec = (self.config.cost_per_second_ultra if shot.use_audio 
                       else self.config.cost_per_second_fast)
        duration = max(shot.duration_seconds, 8)
        return duration * cost_per_sec
    
    def _check_budget(self, estimated_cost: float):
        """Verifica presupuesto mensual"""
        if self.session_cost + estimated_cost > self.config.monthly_budget_usd:
            raise RuntimeError(
                f"⚠️ ALERTA: ${self.session_cost + estimated_cost:.2f} "
                f"excede presupuesto ${self.config.monthly_budget_usd}"
            )
    
    def generate_shot(self, shot: ShotConfig, 
                     ref_images: Optional[List[types.Image]] = None) -> Dict:
        """Genera un shot individual con Veo 3.1"""
        self._wait_rate_limit()
        
        cost = self._calculate_cost(shot)
        self._check_budget(cost)
        
        enhanced_prompt = self._enhance_prompt_ultra(shot)
        refs = ref_images if ref_images is not None else self.reference_images
        
        logger.info(f"🎬 Generando: {shot.shot_id} [{shot.version_name}] "
                   f"(${cost:.2f}) - {shot.get_model()}")
        
        try:
            generation_config = types.GenerateVideoConfig(
                aspect_ratio=shot.aspect_ratio,
                number_of_commerce_candidates=1,
            )
            
            operation = self.client.models.generate_videos(
                model=shot.get_model(),
                prompt=enhanced_prompt,
                reference_images=refs if refs else None,
                config=generation_config
            )
            
            while not operation.done:
                time.sleep(2)
                operation = self.client.operations.get(operation)
            
            video_metadata = operation.response.generated_videos[0]
            video_bytes = self._download_video(video_metadata.video.uri)
            
            filename = f"{shot.shot_id}_v{shot.version_name}.mp4"
            save_path = self._get_save_path(shot, filename)
            
            with open(save_path, "wb") as f:
                f.write(video_bytes)
            
            self.session_cost += cost
            self.requests_made += 1
            
            result = {
                "shot_id": shot.shot_id,
                "version": shot.version_name,
                "path": str(save_path),
                "cost_usd": cost,
                "model": shot.get_model(),
                "prompt": enhanced_prompt,
                "duration": 8,
                "timestamp": datetime.now().isoformat()
            }
            
            self.project_log["shots"].append(result)
            self._save_project_log()
            
            logger.info(f"✓ Completado: {filename} (${cost:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"✗ Error en {shot.shot_id}: {str(e)}")
            raise
    
    def _enhance_prompt_ultra(self, shot: ShotConfig) -> str:
        """Mejora prompt con técnicas Veo 3.1 Ultra"""
        prompt = shot.prompt
        
        enhancements = [
            "24fps cinematic",
            "professional color grading",
            "1080p high definition"
        ]
        
        if shot.camera_movement:
            prompt += f", camera: {shot.camera_movement}"
            
        if shot.use_audio and "audio:" not in prompt.lower():
            prompt += ", with synchronized ambient audio"
            
        prompt += f", {', '.join(enhancements)}"
        return prompt
    
    def _get_save_path(self, shot: ShotConfig, filename: str) -> Path:
        """Organiza archivos en estructura profesional"""
        shot_dir = self.output_dir / "shots" / f"{shot.shot_id}"
        shot_dir.mkdir(parents=True, exist_ok=True)
        return shot_dir / filename
    
    def _download_video(self, uri: str) -> bytes:
        """Descarga video generado"""
        if uri.startswith('http'):
            response = requests.get(uri)
            return response.content
        return b''
    
    def extend_shot(self, original_shot: ShotConfig, 
                   continuation_prompt: str, new_version: str = "extended") -> Dict:
        """Extiende shot usando último frame como referencia"""
        original_path = self._find_shot_path(original_shot.shot_id, original_shot.version_name)
        if not original_path:
            raise FileNotFoundError(f"No encontrado: {original_shot.shot_id}")
        
        last_frame = self.extender.extract_last_frame(Path(original_path))
        
        with open(last_frame, "rb") as f:
            frame_img = types.Image(image_bytes=f.read())
        
        extended_shot = ShotConfig(
            shot_id=f"{original_shot.shot_id}_ext",
            prompt=self.extender.prepare_extend_prompt(
                original_shot.prompt, continuation_prompt),
            aspect_ratio=original_shot.aspect_ratio,
            version_name=new_version,
            use_audio=original_shot.use_audio,
            extend_from=original_shot.shot_id
        )
        
        logger.info(f"⏩ Extendiendo: {original_shot.shot_id}")
        return self.generate_shot(extended_shot, ref_images=[frame_img])
    
    def generate_ab_test(self, shot_base: ShotConfig, 
                        variations: List[Dict]) -> List[Dict]:
        """Genera múltiples versiones A/B/C para un shot"""
        results = []
        base_prompt = shot_base.prompt
        
        for var in variations:
            variant_shot = ShotConfig(
                shot_id=shot_base.shot_id,
                prompt=f"{base_prompt}, {var.get('prompt_addon', '')}",
                version_name=var.get('version_name', 'B'),
                aspect_ratio=var.get('aspect_ratio', shot_base.aspect_ratio),
                use_audio=var.get('use_audio', shot_base.use_audio),
                camera_movement=var.get('camera_movement', shot_base.camera_movement)
            )
            
            try:
                result = self.generate_shot(variant_shot)
                results.append(result)
            except Exception as e:
                logger.error(f"Error variante {var.get('version_name')}: {e}")
                
        return results
    
    def _find_shot_path(self, shot_id: str, version: str) -> Optional[str]:
        """Busca ruta de shot previo"""
        shot_dir = self.output_dir / "shots" / shot_id
        if not shot_dir.exists():
            return None
        target = shot_dir / f"{shot_id}_v{version}.mp4"
        return str(target) if target.exists() else None
    
    def _save_project_log(self):
        """Guarda registro del proyecto"""
        log_path = self.output_dir / "project_log.json"
        self.project_log["total_cost_usd"] = self.session_cost
        self.project_log["last_update"] = datetime.now().isoformat()
        
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(self.project_log, f, indent=2, ensure_ascii=False)
    
    def create_contact_sheet(self, shot_ids: List[str]):
        """Crea video comparando versiones A/B/C lado a lado"""
        import subprocess
        
        for shot_id in shot_ids:
            shot_dir = self.output_dir / "shots" / shot_id
            if not shot_dir.exists():
                continue
                
            videos = sorted(shot_dir.glob("*.mp4"))
            if len(videos) < 2:
                continue
            
            inputs = ' '.join([f'-i {v}' for v in videos])
            filters = f"hstack=inputs={len(videos)}"
            
            output = self.output_dir / "contact_sheets" / f"{shot_id}_compare.mp4"
            output.parent.mkdir(exist_ok=True)
            
            cmd = f"ffmpeg -y {inputs} -filter_complex \"{filters}\" -c:v libx264 -crf 18 {output}"
            try:
                subprocess.run(cmd, shell=True, check=True)
                logger.info(f"📊 Contact sheet: {output}")
            except subprocess.CalledProcessError:
                logger.error("ffmpeg no encontrado")
    
    def get_summary(self) -> Dict:
        """Resumen de la sesión"""
        return {
            "project": self.config.project_name,
            "videos_generados": self.requests_made,
            "costo_total_usd": f"${self.session_cost:.2f}",
            "presupuesto_restante": f"${self.config.monthly_budget_usd - self.session_cost:.2f}",
            "output_dir": str(self.output_dir)
        }


# ═══════════════════════════════════════════════════════════
# EJEMPLO NAROA-2026: Generación de Videos Promocionales
# ═══════════════════════════════════════════════════════════

def naroa_gallery_videos():
    """Genera videos para galería de arte Naroa"""
    
    config = ProjectConfig(
        project_name="naroa_gallery_2026",
        output_dir="./assets/videos",
        reference_images=[
            "./images/artworks/lagrimas-de-oro.webp",
            "./images/artworks/amy-rocks.webp",
        ],
        monthly_budget_usd=200.0,
        quality_preset="ultra"
    )
    
    pipeline = UltraCinePipeline(
        api_key=os.environ.get("GOOGLE_API_KEY"),
        config=config
    )
    
    # Shot 1: Transición Rocks Series
    shot_rocks = ShotConfig(
        shot_id="trans_rocks",
        prompt="""Liquid paint morph transition, 8 seconds.
        Frame A: Amy Winehouse hyperrealist pop art portrait, bold colors, golden particles.
        Frame B: Johnny Depp portrait in matching aesthetic.
        Interpolation: Features dissolve into flowing paint streams, colors blend in chromatic rivers.
        Midpoint: Abstract color explosion - neither face recognizable.
        Atmosphere: Dark museum with warm accent lighting, gold dust floating.""",
        aspect_ratio="16:9",
        use_audio=True
    )
    
    # Shot 2: Loop Golden Tears (Seamless)
    shot_golden_loop = ShotConfig(
        shot_id="loop_golden_tears",
        prompt="""Seamless loop, 8 seconds.
        First frame: Golden artwork 'Lágrimas de Oro'.
        Last frame: Exact same artwork (photogrammetrically identical).
        Internal motion: Gold leaf particles floating in divine light beams,
        soft fabric waving in slow motion, candle flicker reflection.
        Camera: locked, micro-breathing returning to origin.
        Negative: no cuts, no scene changes, locked exposure, static lighting.""",
        aspect_ratio="9:16",  # Spotify Canvas
        use_audio=False  # Loop silencioso
    )
    
    # Generar
    results = []
    results.append(pipeline.generate_shot(shot_rocks))
    results.append(pipeline.generate_shot(shot_golden_loop))
    
    # A/B test para variación de estilo
    variations = [
        {"version_name": "B", "prompt_addon": "anamorphic lens flare, cinematic"},
        {"version_name": "C", "prompt_addon": "vintage film grain, warm highlights"}
    ]
    results.extend(pipeline.generate_ab_test(shot_rocks, variations))
    
    # Resumen
    print("\n" + "="*50)
    print("NAROA GALLERY - PRODUCCIÓN COMPLETADA")
    print("="*50)
    for k, v in pipeline.get_summary().items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    # Ejecutar pipeline Naroa
    naroa_gallery_videos()
