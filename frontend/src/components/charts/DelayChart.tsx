import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'

import type { SimulatedTrain } from '../../types/simulation'
import { EChart } from './EChart'

export function DelayChart({ trains }: { trains: SimulatedTrain[] }) {
  const affected = trains.filter((train) => train.max_delay_sec > 0)
  const option = useMemo<EChartsOption>(() => ({
    color: ['#e76f51'],
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => `${Number(value).toFixed(1)} 分钟` },
    grid: { left: 56, right: 24, top: 24, bottom: 42 },
    xAxis: { type: 'category', data: affected.map((train) => train.train_no) },
    yAxis: { type: 'value', name: '最大晚点 / 分钟' },
    series: [{
      name: '最大晚点', type: 'bar', barMaxWidth: 48,
      data: affected.map((train) => Number((train.max_delay_sec / 60).toFixed(1))),
      itemStyle: { borderRadius: [6, 6, 0, 0] },
    }],
  }), [affected])
  return <EChart option={option} height={320} />
}

