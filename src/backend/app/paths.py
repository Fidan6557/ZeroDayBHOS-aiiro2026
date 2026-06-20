from pathlib import Path


def get_data_dir() -> Path:
    docker_path = Path("/app/sample-data")
    if docker_path.exists():
        return docker_path

    here = Path(__file__).resolve()
    for i in range(2, 6):
        if i >= len(here.parents):
            continue
        candidate = here.parents[i] / "data"
        if candidate.exists():
            return candidate

    return docker_path
