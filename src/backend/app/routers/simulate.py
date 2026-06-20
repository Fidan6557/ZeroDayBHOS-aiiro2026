import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.engine.pipeline import run_pipeline
from app.paths import get_data_dir
from app.schemas.scan import SimulateRequest, SimulateResponse
from app.services.scan_service import save_scan

router = APIRouter(prefix="/api/v1", tags=["simulate"])


def load_scenarios() -> list[dict]:
    path = get_data_dir() / "sample-attacks.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


@router.get("/scenarios")
def list_scenarios():
    scenarios = load_scenarios()
    return [{"id": s["id"], "name": s["name"], "source_type": s["source_type"], "steps": s["steps"]} for s in scenarios]


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    scenarios = load_scenarios()
    scenario = next((s for s in scenarios if s["id"] == req.scenario_id), None)
    if not scenario:
        raise HTTPException(404, f"Scenario '{req.scenario_id}' not found")

    result = await run_pipeline(scenario["content"], scenario["source_type"])
    scan = save_scan(db, result, scenario["content"], agent_id="smart-city-demo")
    result.id = scan.id
    timeline = []
    for i, step in enumerate(scenario["steps"]):
        entry = {"step": i + 1, "label": step, "status": "pending"}
        if step == "BLOCKED":
            entry["status"] = "blocked" if result.blocked else "warning"
        elif i < len(scenario["steps"]) - 1:
            entry["status"] = "completed"
        timeline.append(entry)

    for f in result.findings[:3]:
        timeline.append({
            "step": len(timeline) + 1,
            "label": f"{f.category.value}: {f.explanation}",
            "status": "detected",
        })

    return SimulateResponse(
        scenario_id=scenario["id"],
        scenario_name=scenario["name"],
        steps=scenario["steps"],
        scan=result,
        timeline=timeline,
    )
