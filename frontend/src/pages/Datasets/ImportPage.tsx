import { Button, Card, Result } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSample } from '../../services/datasets'

export function DatasetImportPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  return <Card><Result status="info" title="选择预置案例" subTitle="CSV 字段映射属于后续增强；当前版本提供完整可演示的数据集。" extra={<Button type="primary" loading={loading} onClick={async () => { setLoading(true); const item = await createSample(); navigate(`/datasets/${item.id}`) }}>创建 Demo Central Station</Button>} /></Card>
}

