def track_overlap_suggestion(train_nos: list[str], wait_sec: int) -> str:
    wait_minutes = max(1, round(wait_sec / 60))
    return (
        f"建议检查可用兼容股道；若无法换线，优先级较低的 {train_nos[-1]} "
        f"至少推迟约 {wait_minutes} 分钟。算法建议，仅用于模拟分析。"
    )


def headway_suggestion(train_no: str, gap_sec: int) -> str:
    return (
        f"建议将后车 {train_no} 进入区间的时刻推迟 {max(1, round(gap_sec / 60))} 分钟，"
        "以满足最小追踪间隔。算法建议，仅用于模拟分析。"
    )

