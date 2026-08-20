import { Alert, Card, Collapse, Typography } from 'antd'

export function MethodologyPage() {
  return <div><div className="page-heading"><div><Typography.Title level={2}>方法说明</Typography.Title><Typography.Paragraph>公开模型假设、判定规则与适用边界，保证分析结果可复现、可解释。</Typography.Paragraph></div></div>
    <Alert type="warning" showIcon message="非生产用途" description="本系统不连接铁路生产网络，不使用真实内部数据，所有数据为人工构造；结果不构成调度指令。" />
    <Card className="section-gap"><Collapse defaultActiveKey={['occupancy', 'conflict', 'delay']} items={[
      { key: 'occupancy', label: '资源占用区间', children: <Typography.Paragraph>站线占用采用半开区间 [到达 − 进路提前, 出发 + 出清附加)。因此前一作业的结束时刻等于后一作业开始时刻时，不判定为冲突。</Typography.Paragraph> },
      { key: 'conflict', label: '冲突检测', children: <Typography.Paragraph>股道区间按资源分组并排序，扫描所有重叠对；区间追踪按区间和方向分组，相邻列车进入时刻之差小于最小追踪间隔时告警。总体复杂度 O(n log n)。</Typography.Paragraph> },
      { key: 'delay', label: '晚点传播', children: <Typography.Paragraph>实际到达不得早于上一站实际出发加最小运行时分；实际出发不得早于实际到达加最小停站时分，也不得早于计划出发。再按股道计划顺序和区间最小追踪间隔传递必要等待，直至结果稳定。</Typography.Paragraph> },
      { key: 'limits', label: '限制与后续方向', children: <Typography.Paragraph>当前只分析一个中间站和相邻区间，采用启发式规则，不求解全网最优运行调整。后续可引入 CSV 字段映射、SQLite 持久化和 OR-Tools 约束优化。</Typography.Paragraph> },
    ]} /></Card>
  </div>
}

