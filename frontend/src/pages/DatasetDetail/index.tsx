import { Button, Card, Descriptions, Space, Table, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/common/States'
import { getDataset } from '../../services/datasets'
import type { Dataset, Train } from '../../types/dataset'
import { formatTime } from '../../utils/time'

export function DatasetDetailPage() {
  const { id = 'demo-central-01' } = useParams()
  const [data, setData] = useState<Dataset | null>(null)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const load = () => { setError(false); getDataset(id).then(setData).catch(() => setError(true)) }
  useEffect(() => { getDataset(id).then(setData).catch(() => setError(true)) }, [id])
  if (error) return <ErrorState message="数据集详情加载失败" onRetry={load} />
  if (!data) return <LoadingState />
  const stationMap = Object.fromEntries(data.stations.map((item) => [item.id, item.name]))
  const trackMap = Object.fromEntries(data.tracks.map((item) => [item.id, item.code]))
  return <div><div className="page-heading"><div><Typography.Title level={2}>{data.name}</Typography.Title><Typography.Paragraph>{data.disclaimer}</Typography.Paragraph></div><Space><Button onClick={() => navigate(`/analysis/conflicts/${id}`)}>扫描冲突</Button><Button type="primary" onClick={() => navigate(`/diagram/${id}`)}>查看运行图</Button></Space></div>
    <Descriptions bordered size="small" column={{ xs: 1, md: 3 }} items={[
      { key: 'date', label: '服务日', children: data.service_date },
      { key: 'stations', label: '车站', children: `${data.stations.length} 座` },
      { key: 'trains', label: '列车', children: `${data.trains.length} 列` },
    ]} />
    <Card title="列车计划" className="section-gap"><Table rowKey="id" dataSource={data.trains} pagination={{ pageSize: 6 }} expandable={{ expandedRowRender: (train: Train) => <Table size="small" pagination={false} rowKey="station_id" dataSource={train.stops} columns={[
      { title: '车站', dataIndex: 'station_id', render: (value: string) => stationMap[value] },
      { title: '到达', dataIndex: 'arr_sec', render: formatTime },
      { title: '出发', dataIndex: 'dep_sec', render: formatTime },
      { title: '股道', dataIndex: 'track_id', render: (value: string | null) => value ? trackMap[value] : '—' },
    ]} /> }} columns={[
      { title: '车次', dataIndex: 'train_no' },
      { title: '类别', dataIndex: 'category' },
      { title: '方向', dataIndex: 'direction', render: (value: string) => <Tag color={value === 'UP' ? 'blue' : 'purple'}>{value === 'UP' ? '上行' : '下行'}</Tag> },
      { title: '优先级', dataIndex: 'priority' },
    ]} /></Card>
  </div>
}
