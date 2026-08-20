import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'

import type { Conflict } from '../../types/analysis'
import type { Occupancy } from '../../types/dataset'
import { formatTime } from '../../utils/time'
import { EChart } from './EChart'

interface Props {
  occupancies: Occupancy[]
  conflicts?: Conflict[]
}

export function TrackOccupancyChart({ occupancies, conflicts = [] }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const tracks = [...new Set(occupancies.map((item) => item.resource_code))]
    const conflictedTrains = new Set(
      conflicts.filter((item) => item.type === 'TRACK_OVERLAP').flatMap((item) => item.train_ids),
    )
    return {
      tooltip: {
        formatter: (params: unknown) => {
          const item = params as { data: { value: [number, number, number]; trainNo: string; conflict: boolean } }
          return `${item.data.trainNo}${item.data.conflict ? ' · 存在冲突' : ''}<br/>${formatTime(item.data.value[1])} - ${formatTime(item.data.value[2])}`
        },
      },
      grid: { left: 72, right: 28, top: 24, bottom: 54 },
      xAxis: {
        type: 'value', min: 'dataMin', max: 'dataMax',
        axisLabel: { formatter: (value: number) => formatTime(value) },
      },
      yAxis: { type: 'category', data: tracks },
      dataZoom: [{ type: 'inside', xAxisIndex: 0 }, { type: 'slider', xAxisIndex: 0, bottom: 16 }],
      series: [{
        type: 'custom',
        renderItem: (_params: unknown, api: any) => {
          const categoryIndex = api.value(0)
          const start = api.coord([api.value(1), categoryIndex])
          const end = api.coord([api.value(2), categoryIndex])
          const height = api.size([0, 1])[1] * 0.55
          return {
            type: 'rect',
            shape: { x: start[0], y: start[1] - height / 2, width: Math.max(2, end[0] - start[0]), height },
            style: api.style(),
          }
        },
        encode: { x: [1, 2], y: 0 },
        data: occupancies.map((item) => ({
          value: [tracks.indexOf(item.resource_code), item.start_sec, item.end_sec],
          trainNo: item.train_no,
          conflict: conflictedTrains.has(item.train_id),
          itemStyle: { color: conflictedTrains.has(item.train_id) ? '#d4380d' : '#087f8c', borderRadius: 4 },
        })),
      }],
    }
  }, [conflicts, occupancies])

  return <EChart option={option} height={320} />
}

