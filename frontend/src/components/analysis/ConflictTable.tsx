import { Table, Tag } from 'antd'

import type { Conflict } from '../../types/analysis'
import { formatTime } from '../../utils/time'

const labels: Record<Conflict['type'], string> = {
  TRACK_OVERLAP: '股道占用重叠',
  HEADWAY_SHORT: '追踪间隔不足',
  DWELL_TOO_SHORT: '停站时间不足',
  RUN_TOO_SHORT: '运行时分不足',
}

export function ConflictTable({ conflicts }: { conflicts: Conflict[] }) {
  return (
    <Table
      rowKey="id"
      dataSource={conflicts}
      pagination={{ pageSize: 8, showSizeChanger: false }}
      scroll={{ x: 980 }}
      columns={[
        { title: '类型', dataIndex: 'type', width: 150, render: (value: Conflict['type']) => labels[value] },
        { title: '资源', dataIndex: 'resource_name', width: 180 },
        { title: '车次', dataIndex: 'train_nos', width: 130, render: (value: string[]) => value.join(' / ') },
        { title: '时间', width: 140, render: (_: unknown, item: Conflict) => `${formatTime(item.start_sec)} - ${formatTime(item.end_sec)}` },
        { title: '严重度', dataIndex: 'severity', width: 90, render: (value: string) => <Tag color={value === 'HIGH' ? 'red' : 'orange'}>{value === 'HIGH' ? '高' : '中'}</Tag> },
        { title: '建议', dataIndex: 'suggestion', width: 360 },
      ]}
    />
  )
}

