import { DownloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Descriptions, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ConflictTable } from '../../components/analysis/ConflictTable'
import { MetricsGrid } from '../../components/analysis/MetricsGrid'
import { ErrorState, LoadingState } from '../../components/common/States'
import { getAnalysis } from '../../services/analyses'
import type { ConflictAnalysis } from '../../types/analysis'
import { downloadUrl } from '../../utils/download'
import { reportDownloadUrl } from '../../utils/runtime'

export function ReportPage() {
  const { runId = '' } = useParams()
  const [result, setResult] = useState<ConflictAnalysis | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { getAnalysis(runId).then(setResult).catch(() => setError(true)) }, [runId])
  if (error) return <ErrorState message="报告不存在或服务已重启。请重新运行一次冲突分析。" />
  if (!result) return <LoadingState />
  return <div><div className="page-heading"><div><Typography.Title level={2}>冲突分析报告</Typography.Title><Typography.Paragraph>任务编号：{result.run_id}</Typography.Paragraph></div><Space><Button icon={<DownloadOutlined />} onClick={() => downloadUrl(reportDownloadUrl(runId, 'json'))}>导出 JSON</Button><Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadUrl(reportDownloadUrl(runId, 'csv'))}>导出 CSV</Button></Space></div>
    <MetricsGrid metrics={result.metrics} />
    <Card title="分析参数" className="section-gap"><Descriptions column={{ xs: 1, md: 4 }} items={[
      { key: 'headway', label: '追踪间隔', children: `${result.rules.min_headway_sec} 秒` },
      { key: 'approach', label: '进路提前', children: `${result.rules.track_approach_sec} 秒` },
      { key: 'clearance', label: '出清附加', children: `${result.rules.track_clearance_sec} 秒` },
      { key: 'dwell', label: '最小停站', children: `${result.rules.min_dwell_sec} 秒` },
    ]} /></Card>
    <Alert className="section-gap" type="warning" showIcon message="方法与数据声明" description={result.disclaimer} />
    <Card title="冲突明细" className="section-gap"><ConflictTable conflicts={result.conflicts} /></Card>
  </div>
}
