import json

from app.database import SessionLocal
from app.engine.pipeline import run_pipeline
from app.models.scan import Scan
from app.paths import get_data_dir
from app.services.scan_service import save_scan


async def _seed():
    data_path = get_data_dir()
    if not data_path.exists():
        return

    attacks = json.loads((data_path / "sample-attacks.json").read_text(encoding="utf-8"))
    safe = json.loads((data_path / "sample-safe.json").read_text(encoding="utf-8"))

    db = SessionLocal()
    try:
        if db.query(Scan).count() > 0:
            return
        for item in attacks[:5] + safe[:2]:
            result = await run_pipeline(item["content"], item.get("source_type", "text"))
            save_scan(db, result, item["content"])
    finally:
        db.close()
