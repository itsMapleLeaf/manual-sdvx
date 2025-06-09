from pathlib import Path


def manual_data_path(*segments: str | Path):
    return Path(__file__).parent.parent / "src" / "data" / Path(*segments)
