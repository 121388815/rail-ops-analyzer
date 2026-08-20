import { DownloadOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, InputNumber, Space, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ConflictTable } from '../../components/analysis/ConflictTable'
import { MetricsGrid } from '../../components/analysis/MetricsGrid'
import { TrackOccupancyChart } from '../../components/charts/TrackOccupancyChart'
import { ErrorState, LoadingState } from '../../components/common/States'
import { defaultRules, runConflictAnalysis } from '../../services/analyses'
import type { AnalysisRules, ConflictAnalysis } from '../../types/analysis'
import { downloadUrl } from '../../utils/download'
import { isStaticDemo, reportDownloadUrl } from '../../utils/runtime'

export function ConflictAnalysisPage() {
  const { id = 'demo-central-01' } = useParams()
  const [result, setResult] = useState<ConflictAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [form] = Form.useForm<AnalysisRules>()
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const run = async (rules: AnalysisRules = defaultRules) => {
    setLoading(true); setError(false)
    try { setResult(await runConflictAnalysis(id, rules)) }
    catch { setError(true) } finally { setLoading(false) }
  }
  useEffect(() => {
    runConflictAnalysis(id, defaultRules)
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])
  if (error) return <ErrorState message="冲突分析失败，请检查后端服务。" onRetry={() => void run(form.getFieldsValue())} />
  return <>{contextHolder}<div className="page-heading"><div><Typography.Title level={2}>资源冲突检测</Typography.Title><Typography.Paragraph>规则参数会随本次分析结果保存，所有建议仅用于模拟。</Typography.Paragraph></div><Button type="primary" onClick={() => navigate(`/analysis/delay/${id}`)}>继续晚点仿真</Button></div>
    <Card title="规则参数"><Form form={form} layout="inline" initialValues={defaultRules} onFinish={run}>
      <Form.Item name="min_headway_sec" label="最小追踪间隔（秒）"><InputNumber min={0} step={60} /></Form.Item>
      <Form.Item name="track_approach_sec" label="进路提前（秒）"><InputNumber min={0} step={30} /></Form.Item>
      <Form.Item name="track_clearance_sec" label="出清附加（秒）"><InputNumber min={0} step={30} /></Form.Item>
      <Form.Item name="min_dwell_sec" label="最小停站（秒）"><InputNumber min={0} step={30} /></Form.Item>
      <Form.Item><Button htmlType="submit" type="primary" icon={<PlayCircleOutlined />} loading={loading}>运行扫描</Button></Form.Item>
    </Form></Card>
    {loading || !result ? <Card className="section-gap"><LoadingState /></Card> : <>
      <div className="section-gap"><MetricsGrid metrics={result.metrics} /></div>
      <Alert className="section-gap" type="warning" showIcon message={`发现 ${result.metrics.conflict_count} 项冲突，其中高严重度 ${result.metrics.high_severity_count} 项。`} description={isStaticDemo ? `在线静态演示展示默认规则结果；本地启动可动态调整参数。${result.disclaimer}` : result.disclaimer} />
      <Card title="冲突股道定位" className="section-gap"><TrackOccupancyChart occupancies={result.occupancies} conflicts={result.conflicts} /></Card>
      <Card title="冲突明细与建议" className="section-gap" extra={<Space><Button icon={<DownloadOutlined />} onClick={() => downloadUrl(reportDownloadUrl(result.run_id, 'json'))}>JSON</Button><Button icon={<DownloadOutlined />} onClick={() => { downloadUrl(reportDownloadUrl(result.run_id, 'csv')); messageApi.success('已开始导出 CSV') }}>CSV</Button><Button type="link" onClick={() => navigate(`/reports/${result.run_id}`)}>查看报告</Button></Space>}><ConflictTable conflicts={result.conflicts} /></Card>
    </>}
  </>
}
