import api from './api'
import type { Dataset, DatasetSummary, DiagramData, Train } from '../types/dataset'
import { isStaticDemo, staticDemoUrl } from '../utils/runtime'

async function staticJson<T>(fileName: string): Promise<T> {
  const response = await fetch(staticDemoUrl(fileName))
  if (!response.ok) throw new Error('静态演示数据加载失败')
  return response.json() as Promise<T>
}

export async function listDatasets(): Promise<DatasetSummary[]> {
  if (isStaticDemo) return staticJson<DatasetSummary[]>('datasets.json')
  const response = await api.get<DatasetSummary[]>('/datasets')
  return response.data
}

export async function createSample(): Promise<Dataset> {
  if (isStaticDemo) return staticJson<Dataset>('dataset.json')
  const response = await api.post<Dataset>('/datasets/sample', { sample_key: 'demo-central-01' })
  return response.data
}

export async function getDataset(id: string): Promise<Dataset> {
  if (isStaticDemo) return staticJson<Dataset>('dataset.json')
  const response = await api.get<Dataset>(`/datasets/${id}`)
  return response.data
}

export async function getTrains(id: string): Promise<Train[]> {
  if (isStaticDemo) return (await staticJson<Dataset>('dataset.json')).trains
  const response = await api.get<Train[]>(`/datasets/${id}/trains`)
  return response.data
}

export async function getDiagram(id: string): Promise<DiagramData> {
  if (isStaticDemo) return staticJson<DiagramData>('diagram.json')
  const response = await api.get<DiagramData>(`/datasets/${id}/diagram`)
  return response.data
}
