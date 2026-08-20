import { ArrowRightOutlined, ExperimentOutlined, FundOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/common/States'
import { listDatasets } from '../../services/datasets'
import type { DatasetSummary } from '../../types/dataset'

export function DashboardPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[] | null>(null)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const load = () => { setError(false); listDatasets().then(setDatasets).catch(() => setError(true)) }
  useEffect(() => { listDatasets().then(setDatasets).catch(() => setError(true)) }, [])
  if (error) return <ErrorState message="无法加载总览，请确认后端已经启动。" onRetry={load} />
  if (!datasets) return <LoadingState />
  const dataset = datasets[0]
  return (
    <div>
      <div className="page-heading">
        <div><Typography.Title level={2}>分析总览</Typography.Title><Typography.Paragraph>从预置案例开始一条完整的演示路径。</Typography.Paragraph></div>
        <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(`/diagram/${dataset.id}`)}>进入分析</Button>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}><Card><Statistic title="数据集" value={datasets.length} suffix="份" /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="列车" value={dataset.train_count} suffix="列" /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="车站" value={dataset.station_count} suffix="座" /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="核心规则" value={4} suffix="类" /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} className="section-gap">
        <Col xs={24} lg={12}><Card title={<Space><FundOutlined />运行图与股道占用</Space>} extra={<Button type="link" onClick={() => navigate(`/diagram/${dataset.id}`)}>查看</Button>}>10 列模拟列车、3 座车站与 4 条到发线，支持缩放和悬停。</Card></Col>
        <Col xs={24} lg={12}><Card title={<Space><ExperimentOutlined />冲突与晚点分析</Space>} extra={<Button type="link" onClick={() => navigate(`/analysis/conflicts/${dataset.id}`)}>开始</Button>}>使用可解释规则扫描冲突，再注入 8 分钟晚点观察传播。</Card></Col>
      </Row>
    </div>
  )
}
