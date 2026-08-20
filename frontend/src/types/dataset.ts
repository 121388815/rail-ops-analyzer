export interface Station {
  id: string
  code: string
  name: string
  sequence: number
  mileage_km: number
}

export interface Track {
  id: string
  station_id: string
  code: string
  direction: 'UP' | 'DOWN' | 'BOTH'
}

export interface StopPlan {
  station_id: string
  arr_sec: number | null
  dep_sec: number | null
  track_id: string | null
  stop_type: string
}

export interface Train {
  id: string
  train_no: string
  category: string
  direction: 'UP' | 'DOWN'
  priority: number
  stops: StopPlan[]
}

export interface Dataset {
  id: string
  name: string
  service_date: string
  status: string
  created_at: string
  disclaimer: string
  stations: Station[]
  tracks: Track[]
  trains: Train[]
}

export interface DatasetSummary {
  id: string
  name: string
  service_date: string
  status: string
  train_count: number
  station_count: number
  created_at: string
}

export interface Occupancy {
  resource_id: string
  resource_code: string
  train_id: string
  train_no: string
  start_sec: number
  end_sec: number
  planned_arr_sec: number
  planned_dep_sec: number
}

export interface DiagramPoint {
  station_id: string
  station_name: string
  mileage_km: number
  arr_sec: number | null
  dep_sec: number | null
}

export interface DiagramTrain {
  train_id: string
  train_no: string
  direction: string
  category: string
  points: DiagramPoint[]
}

export interface DiagramData {
  dataset_id: string
  stations: Station[]
  trains: DiagramTrain[]
  occupancies: Occupancy[]
}

