import type { AnalysisRules, Metrics } from './analysis'

export interface SimulatedStop {
  station_id: string
  station_name: string
  planned_arr_sec: number | null
  actual_arr_sec: number | null
  planned_dep_sec: number | null
  actual_dep_sec: number | null
  delay_sec: number
}

export interface SimulatedTrain {
  train_id: string
  train_no: string
  direction: string
  max_delay_sec: number
  stops: SimulatedStop[]
}

export interface DelaySimulation {
  run_id: string
  dataset_id: string
  injected_train_id: string
  injected_delay_sec: number
  status: string
  metrics: Metrics
  trains: SimulatedTrain[]
  disclaimer: string
}

export interface DelaySimulationPayload {
  dataset_id: string
  train_id: string
  delay_sec: number
  rules?: AnalysisRules
}

