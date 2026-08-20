import axios from 'axios'

export interface HealthResponse {
  status: string
  version: string
}

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10_000,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
)

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health')
  return response.data
}

export default api
