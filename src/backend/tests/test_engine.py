import asyncio
import json
import unittest
from pathlib import Path

from app.engine.pipeline import run_pipeline


DATA_DIR = Path(__file__).resolve().parents[3] / "data"


class DetectionPipelineTests(unittest.TestCase):
    def test_all_attack_scenarios_are_blocked(self):
        attacks = json.loads((DATA_DIR / "sample-attacks.json").read_text(encoding="utf-8"))

        async def scan_all():
            return [
                await run_pipeline(item["content"], item.get("source_type", "text"))
                for item in attacks
            ]

        results = asyncio.run(scan_all())
        self.assertTrue(all(result.blocked for result in results))
        self.assertTrue(all(result.threat_level.value in {"medium", "high"} for result in results))

    def test_safe_scenarios_remain_low_risk(self):
        safe_items = json.loads((DATA_DIR / "sample-safe.json").read_text(encoding="utf-8"))

        async def scan_all():
            return [
                await run_pipeline(item["content"], item.get("source_type", "text"))
                for item in safe_items
            ]

        results = asyncio.run(scan_all())
        self.assertTrue(all(not result.blocked for result in results))
        self.assertTrue(all(result.threat_level.value == "low" for result in results))
        self.assertTrue(all(result.classification.value == "safe" for result in results))


if __name__ == "__main__":
    unittest.main()
