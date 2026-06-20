from pathlib import Path


def get_data_dir() -> Path:
    candidates = [
        Path("/app/sample-data"),
        Path(__file__).resolve().parents[2] / "data",
        Path(__file__).resolve().parents[3] / "data",
        Path(__file__).resolve().parents[4] / "data",
    ]
    for path in candidates:
        if path.exists():
            return path
    return Path("/app/sample-data")
