import { Alert, Button, Empty, Skeleton } from 'antd'

export function LoadingState() {
  return <Skeleton active paragraph={{ rows: 6 }} />
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <Alert type="error" showIcon message={message} action={onRetry ? <Button onClick={onRetry}>重试</Button> : undefined} />
}

export function EmptyState({ description = '暂无数据' }: { description?: string }) {
  return <Empty description={description} />
}

