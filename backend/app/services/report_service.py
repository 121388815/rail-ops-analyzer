import csv
import io

from app.schemas.analysis import ConflictAnalysisResponse


def conflicts_to_csv(result: ConflictAnalysisResponse) -> str:
    stream = io.StringIO()
    stream.write("\ufeff")
    writer = csv.writer(stream)
    writer.writerow(["类型", "资源", "开始秒", "结束秒", "严重度", "相关车次", "建议"])
    for conflict in result.conflicts:
        writer.writerow([
            conflict.type, conflict.resource_name, conflict.start_sec, conflict.end_sec,
            conflict.severity, "/".join(conflict.train_nos), conflict.suggestion,
        ])
    return stream.getvalue()

