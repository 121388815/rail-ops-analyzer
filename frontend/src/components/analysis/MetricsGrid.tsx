import { Card, Col, Row, Statistic } from 'antd'

import type { Metrics } from '../../types/analysis'

export function MetricsGrid({ metrics }: { metrics: Metrics }) {
  const items = [
    ['列车数', metrics.train_count, '列'],
    ['冲突数', metrics.conflict_count, '项'],
    ['正点率', metrics.on_time_rate, '%'],
    ['受影响列车', metrics.affected_train_count, '列'],
  ] as const
  return (
    <Row gutter={[16, 16]}>
      {items.map(([title, value, suffix]) => (
        <Col xs={12} lg={6} key={title}>
          <Card className="metric-card"><Statistic title={title} value={value} suffix={suffix} /></Card>
        </Col>
      ))}
    </Row>
  )
}

