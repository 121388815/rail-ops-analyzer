import { Button, Card, Segmented, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TrainDiagramChart } from '../../components/charts/TrainDiagramChart'
import { TrackOccupancyChart } from '../../components/charts/TrackOccupancyChart'
import { ErrorState, LoadingState } from '../../components/common/States'
import { getDiagram } from '../../services/datasets'
import type { DiagramData } from '../../types/dataset'

export function DiagramPage() {
  const { id = 'demo-central-01' } = useParams()
  const [data, setData] = useState<DiagramData | null>(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState<string>('运行图')
  const navigate = useNavigate()
  const load = () => { setError(false); getDiagram(id).then(setData).catch(() => setError(true)) }
  useEffect(() => { getDiagram(id).then(setData).catch(() => setError(true)) }, [id])
  if (error) return <ErrorState message="运行图加载失败" onRetry={load} />
  if (!data) return <LoadingState />
  return <div><div className="page-heading"><div><Typography.Title level={2}>运行图与资源占用</Typography.Title><Typography.Paragraph>实线为上行、虚线为下行；拖动底部滑块可缩放时间范围。</Typography.Paragraph></div><Space><Button onClick={() => navigate(`/analysis/conflicts/${id}`)}>扫描冲突</Button><Button type="primary" onClick={() => navigate(`/analysis/delay/${id}`)}>晚点仿真</Button></Space></div>
    <Segmented options={['运行图', '股道占用']} value={view} onChange={(value) => setView(String(value))} />
    <Card className="section-gap" title={view === '运行图' ? '时间—里程运行图' : '中心站股道占用'}>
      {view === '运行图' ? <TrainDiagramChart data={data} /> : <TrackOccupancyChart occupancies={data.occupancies} />}
    </Card>
  </div>
}
