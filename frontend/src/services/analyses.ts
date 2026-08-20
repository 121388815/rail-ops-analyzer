import api from './api'
import type { AnalysisRules, ConflictAnalysis } from '../types/analysis'
import { isStaticDemo, staticDemoUrl } from '../utils/runtime'

export const defaultRules: AnalysisRules = {
  min_headway_sec: 300,
  track_approach_sec: 120,
  track_clearance_sec: 120,
  min_dwell_sec: 120,
}

export async function runConflictAnalysis(
  datasetId: string,
  rules: AnalysisRules = defaultRules,
): Promise<ConflictAnalysis> {
  if (isStaticDemo) {
    const response = await fetch(staticDemoUrl('analysis.json'))
    if (!response.ok) throw new Error('静态冲突结果加载失败')
    return response.json() as Promise<ConflictAnalysis>
  }
  const response = await api.post<ConflictAnalysis>('/analyses/conflicts', {
    dataset_id: datasetId,
    rules,
  })
  return response.data
}

export async function getAnalysis(runId: string): Promise<ConflictAnalysis> {
  if (isStaticDemo) {
    const response = await fetch(staticDemoUrl('analysis.json'))
    if (!response.ok) throw new Error('静态冲突结果加载失败')
    return response.json() as Promise<ConflictAnalysis>
  }
  const response = await api.get<ConflictAnalysis>(`/analyses/${runId}`)
  return response.data
}
