import type { Occupancy } from './dataset'

export interface AnalysisRules {
  min_headway_sec: number
  track_approach_sec: number
  track_clearance_sec: number
  min_dwell_sec: number
}

export interface Metrics {
  train_count: number
  conflict_count: number
  high_severity_count: number
  on_time_rate: number
  average_delay_sec: number
  affected_train_count: number
}

export interface Conflict {
  id: string
  type: 'TRACK_OVERLAP' | 'HEADWAY_SHORT' | 'DWELL_TOO_SHORT' | 'RUN_TOO_SHORT'
  resource_id: string
  resource_name: string
  start_sec: number
  end_sec: number
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  train_ids: string[]
  train_nos: string[]
  gap_sec: number | null
  suggestion: string
}

export interface ConflictAnalysis {
  run_id: string
  dataset_id: string
  status: string
  rules: AnalysisRules
  metrics: Metrics
  occupancies: Occupancy[]
  conflicts: Conflict[]
  disclaimer: string
}

