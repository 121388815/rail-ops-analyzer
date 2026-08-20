import { PlayCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, InputNumber, Select, Table, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { MetricsGrid } from '../../components/analysis/MetricsGrid'
import { DelayChart } from '../../components/charts/DelayChart'
import { ErrorState, LoadingState } from '../../components/common/States'
import { getDataset } from '../../services/datasets'
import { runDelaySimulation } from '../../services/simulations'
import type { Dataset } from '../../types/dataset'
import type { DelaySimulation } from '../../types/simulation'
import { formatMinutes } from '../../utils/time'

export function DelaySimulationPage() {
  const { id = 'demo-central-01' } = useParams()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [result, setResult] = useState<DelaySimulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const run = async (values = { train_id: 'g101', delay_min: 8 }) => {
    setLoading(true); setError(false)
    try { setResult(await runDelaySimulation({ dataset_id: id, train_id: values.train_id, delay_sec: values.delay_min * 60 })) }
    catch { setError(true) } finally { setLoading(false) }
  }
  useEffect(() => {
    getDataset(id).then(setDataset).catch(() => setError(true))
    runDelaySimulation({ dataset_id: id, train_id: 'g101', delay_sec: 480 })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])
  if (error) return <ErrorState message="晚点仿真失败，请检查数据与后端服务。" onRetry={() => void run()} />
  if (!dataset) return <LoadingState />
  const affected = result?.trains.filter((train) => train.max_delay_sec > 0) ?? []
  return <div><div className="page-heading"><div><Typography.Title level={2}>晚点传播仿真</Typography.Title><Typography.Paragraph>保持计划顺序，按最小运行/停站时分、股道出清和追踪间隔传播必要等待。</Typography.Paragraph></div></div>
    <Card title="仿真场景"><Form layout="inline" initialValues={{ train_id: 'g101', delay_min: 8 }} onFinish={run}>
      <Form.Item name="train_id" label="注入车次" rules={[{ required: true }]}><Select style={{ width: 140 }} options={dataset.trains.map((train) => ({ value: train.id, label: train.train_no }))} /></Form.Item>
      <Form.Item name="delay_min" label="初始晚点（分钟）" rules={[{ required: true }]}><InputNumber min={1} max={120} /></Form.Item>
      <Form.Item><Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />} loading={loading}>运行仿真</Button></Form.Item>
    </Form></Card>
    {loading || !result ? <Card className="section-gap"><LoadingState /></Card> : <>
      <div className="section-gap"><MetricsGrid metrics={result.metrics} /></div>
      <Alert className="section-gap" type="info" showIcon message={`${dataset.trains.find((train) => train.id === result.injected_train_id)?.train_no} 注入 ${formatMinutes(result.injected_delay_sec)}，影响 ${result.metrics.affected_train_count} 列车。`} description={result.disclaimer} />
      <Card title="晚点传播结果" className="section-gap"><DelayChart trains={result.trains} /></Card>
      <Card title="受影响列车" className="section-gap"><Table rowKey="train_id" dataSource={affected} pagination={false} columns={[
        { title: '车次', dataIndex: 'train_no' },
        { title: '方向', dataIndex: 'direction', render: (value: string) => <Tag>{value === 'UP' ? '上行' : '下行'}</Tag> },
        { title: '最大晚点', dataIndex: 'max_delay_sec', render: (value: number) => formatMinutes(value) },
        { title: '传播状态', render: (_: unknown, item) => item.train_id === result.injected_train_id ? <Tag color="red">初始晚点</Tag> : <Tag color="orange">受传播影响</Tag> },
      ]} /></Card>
    </>}
  </div>
}
