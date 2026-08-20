export const isStaticDemo = import.meta.env.VITE_STATIC_DEMO === 'true'

export function staticDemoUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}demo/${fileName}`
}

export function reportDownloadUrl(runId: string, format: 'json' | 'csv'): string {
  if (isStaticDemo) {
    return staticDemoUrl(format === 'json' ? 'analysis.json' : 'conflicts.csv')
  }
  return `/api/v1/reports/${runId}.${format}`
}

