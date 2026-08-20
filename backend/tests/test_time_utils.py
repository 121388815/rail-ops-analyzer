import pytest

from app.domain.time_utils import format_service_time, parse_service_time


def test_cross_midnight_rolls_into_next_day() -> None:
    arrival = parse_service_time("23:58")
    departure = parse_service_time("00:03", previous_sec=arrival)

    assert departure - arrival == 300
    assert departure == 86580
    assert format_service_time(departure) == "00:03:00 (+1日)"


def test_invalid_time_is_rejected_in_chinese() -> None:
    with pytest.raises(ValueError, match="时刻格式"):
        parse_service_time("8点整")

