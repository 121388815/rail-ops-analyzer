import api from './api'
import type { DelaySimulation, DelaySimulationPayload } from '../types/simulation'
import { isStaticDemo, staticDemoUrl } from '../utils/runtime'

export async function runDelaySimulation(
  payload: DelaySimulationPayload,
): Promise<DelaySimulation> {
  if (isStaticDemo) {
    const response = await fetch(staticDemoUrl('simulation.json'))
    if (!response.ok) throw new Error('静态仿真结果加载失败')
    return response.json() as Promise<DelaySimulation>
  }
  const response = await api.post<DelaySimulation>('/simulations/delay', payload)
  return response.data
}

export async function getSimulation(runId: string): Promise<DelaySimulation> {
  if (isStaticDemo) {
    const response = await fetch(staticDemoUrl('simulation.json'))
    if (!response.ok) throw new Error('静态仿真结果加载失败')
    return response.json() as Promise<DelaySimulation>
  }
  const response = await api.get<DelaySimulation>(`/simulations/${runId}`)
  return response.data
}
