import { createHashRouter } from 'react-router-dom'

import { AppLayout } from './AppLayout'
import { LandingPage } from '../pages/Landing'

export const router = createHashRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', lazy: async () => ({ Component: (await import('../pages/Dashboard')).DashboardPage }) },
      { path: '/datasets', lazy: async () => ({ Component: (await import('../pages/Datasets')).DatasetListPage }) },
      { path: '/datasets/new', lazy: async () => ({ Component: (await import('../pages/Datasets/ImportPage')).DatasetImportPage }) },
      { path: '/datasets/:id', lazy: async () => ({ Component: (await import('../pages/DatasetDetail')).DatasetDetailPage }) },
      { path: '/diagram/:id', lazy: async () => ({ Component: (await import('../pages/Diagram')).DiagramPage }) },
      { path: '/analysis/conflicts/:id', lazy: async () => ({ Component: (await import('../pages/ConflictAnalysis')).ConflictAnalysisPage }) },
      { path: '/analysis/delay/:id', lazy: async () => ({ Component: (await import('../pages/DelaySimulation')).DelaySimulationPage }) },
      { path: '/reports/:runId', lazy: async () => ({ Component: (await import('../pages/Report')).ReportPage }) },
      { path: '/methodology', lazy: async () => ({ Component: (await import('../pages/Methodology')).MethodologyPage }) },
    ],
  },
])
