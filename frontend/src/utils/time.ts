export function formatTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  const day = Math.floor(seconds / 86400)
  const remainder = seconds % 86400
  const hour = Math.floor(remainder / 3600)
  const minute = Math.floor((remainder % 3600) / 60)
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return day ? `${value} (+${day}日)` : value
}

export function formatMinutes(seconds: number): string {
  const minutes = seconds / 60
  return Number.isInteger(minutes) ? `${minutes} 分钟` : `${minutes.toFixed(1)} 分钟`
}

