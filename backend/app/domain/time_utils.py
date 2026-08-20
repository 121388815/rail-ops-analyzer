import re


TIME_PATTERN = re.compile(r"^(?P<hour>\d{1,2}):(?P<minute>[0-5]\d)(?::(?P<second>[0-5]\d))?$")


def parse_service_time(value: str, previous_sec: int | None = None) -> int:
    """Convert HH:MM[:SS] to service-day seconds, rolling over when needed."""
    match = TIME_PATTERN.match(value.strip())
    if not match:
        raise ValueError("时刻格式应为 HH:MM 或 HH:MM:SS")
    hour = int(match.group("hour"))
    if hour > 47:
        raise ValueError("小时数不能超过 47")
    seconds = hour * 3600 + int(match.group("minute")) * 60 + int(match.group("second") or 0)
    if previous_sec is not None:
        while seconds < previous_sec:
            seconds += 24 * 3600
    return seconds


def format_service_time(seconds: int) -> str:
    if seconds < 0:
        raise ValueError("服务日秒数不能为负数")
    day, remainder = divmod(seconds, 24 * 3600)
    hour, remainder = divmod(remainder, 3600)
    minute, second = divmod(remainder, 60)
    suffix = f" (+{day}日)" if day else ""
    return f"{hour:02d}:{minute:02d}:{second:02d}{suffix}"

