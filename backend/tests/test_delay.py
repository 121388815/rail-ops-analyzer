from app.domain.delay_simulator import simulate_delay
from app.schemas.analysis import AnalysisRules
from app.services.dataset_service import ensure_demo_dataset


def test_eight_minute_delay_propagates_to_following_trains() -> None:
    result = simulate_delay(
        ensure_demo_dataset(), "g101", 480, AnalysisRules(), "test-run"
    )
    affected = [train for train in result.trains if train.max_delay_sec > 0]

    assert result.injected_delay_sec == 480
    assert result.metrics.affected_train_count >= 3
    assert any(train.train_no == "D205" and train.max_delay_sec > 0 for train in affected)

