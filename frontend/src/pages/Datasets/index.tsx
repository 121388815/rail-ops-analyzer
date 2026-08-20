import { Button, Card, Space, Table, Tag, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/common/States'
import { createSample, listDatasets } from '../../services/datasets'
import type { DatasetSummary } from '../../types/dataset'

export function DatasetListPage() {
  const [items, setItems] = useState<DatasetSummary[] | null>(null)
  const [error, setError] = useState(false)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const load = () => { setError(false); listDatasets().then(setItems).catch(() => setError(true)) }
  useEffect(() => { listDatasets().then(setItems).catch(() => setError(true)) }, [])
  const create = async () => {
    setCreating(true)
    try { const dataset = await createSample(); messageApi.success('示例数据已准备好'); navigate(`/datasets/${dataset.id}`) }
    catch { messageApi.error('创建示例失败') } finally { setCreating(false) }
  }
  if (error) return <ErrorState message="数据集加载失败" onRetry={load} />
  if (!items) return <LoadingState />
  return <>{contextHolder}<div className="page-heading"><div><Typography.Title level={2}>数据集</Typography.Title><Typography.Paragraph>当前 MVP 使用可重复构建的人工示例数据。</Typography.Paragraph></div><Button type="primary" loading={creating} onClick={create}>载入预置案例</Button></div><Card><Table rowKey="id" dataSource={items} pagination={false} columns={[
    { title: '名称', dataIndex: 'name' },
    { title: '服务日', dataIndex: 'service_date' },
    { title: '列车', dataIndex: 'train_count', render: (value: number) => `${value} 列` },
    { title: '状态', dataIndex: 'status', render: () => <Tag color="green">可分析</Tag> },
    { title: '操作', render: (_: unknown, item: DatasetSummary) => <Space><Button type="link" onClick={() => navigate(`/datasets/${item.id}`)}>详情</Button><Button type="link" onClick={() => navigate(`/diagram/${item.id}`)}>运行图</Button></Space> },
  ]} /></Card></>
}
