import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'

import { router } from './app/router'
import './App.css'

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#087f8c', borderRadius: 10,
          colorText: '#183b50', fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
        },
        components: { Layout: { siderBg: '#102f44', headerBg: '#ffffff' } },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App

