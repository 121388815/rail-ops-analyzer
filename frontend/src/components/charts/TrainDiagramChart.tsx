import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'

import type { DiagramData } from '../../types/dataset'
import { formatTime } from '../../utils/time'
import { EChart } from './EChart'

export function TrainDiagramChart({ data }: { data: DiagramData }) {
  const option = useMemo<EChartsOption>(() => ({
    animationDuration: 500,
    color: ['#087f8c', '#e76f51', '#315b7d', '#e9a23b', '#5f6caf'],
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const item = params as { seriesName: string; value: [number, number] }
        return `${item.seriesName}<br/>${formatTime(item.value[0])} · ${item.value[1]} km`
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: 64, right: 28, top: 36, bottom: 62 },
    xAxis: {
      type: 'value', name: '服务日时间', min: 'dataMin', max: 'dataMax',
      axisLabel: { formatter: (value: number) => formatTime(value) },
    },
    yAxis: { type: 'value', name: '里程 km', min: 0, max: 100 },
    dataZoom: [{ type: 'inside', xAxisIndex: 0 }, { type: 'slider', xAxisIndex: 0, bottom: 28 }],
    series: data.trains.map((train) => ({
      name: train.train_no,
      type: 'line',
      symbolSize: 7,
      data: train.points.map((point) => [point.dep_sec ?? point.arr_sec, point.mileage_km]),
      lineStyle: { type: train.direction === 'UP' ? 'solid' : 'dashed', width: 2 },
      emphasis: { focus: 'series' },
    })),
  }), [data])

  return <EChart option={option} height={470} />
}

