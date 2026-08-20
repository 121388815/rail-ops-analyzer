"""Export deterministic demo responses for the GitHub Pages static showcase."""

import json
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.schemas.analysis import ConflictAnalysisRequest  # noqa: E402
from app.schemas.simulation import DelaySimulationRequest  # noqa: E402
from app.services.analysis_service import run_conflict_analysis, run_delay_simulation  # noqa: E402
from app.services.dataset_service import ensure_demo_dataset, get_diagram, list_datasets  # noqa: E402
from app.services.report_service import conflicts_to_csv  # noqa: E402


def write_json(path: Path, value: object) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    output_dir = PROJECT_ROOT / "frontend" / "public" / "demo"
    output_dir.mkdir(parents=True, exist_ok=True)
    dataset = ensure_demo_dataset()
    analysis = run_conflict_analysis(
        dataset,
        ConflictAnalysisRequest(dataset_id=dataset.id),
    )
    simulation = run_delay_simulation(
        dataset,
        DelaySimulationRequest(dataset_id=dataset.id, train_id="g101", delay_sec=480),
    )

    write_json(output_dir / "datasets.json", [item.model_dump(mode="json") for item in list_datasets()])
    write_json(output_dir / "dataset.json", dataset.model_dump(mode="json"))
    write_json(output_dir / "diagram.json", get_diagram(dataset).model_dump(mode="json"))
    write_json(output_dir / "analysis.json", analysis.model_dump(mode="json"))
    write_json(output_dir / "simulation.json", simulation.model_dump(mode="json"))
    (output_dir / "conflicts.csv").write_text(conflicts_to_csv(analysis), encoding="utf-8")


if __name__ == "__main__":
    main()

