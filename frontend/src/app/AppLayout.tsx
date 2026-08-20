import {
  BarChartOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FundOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Space, Tag, Typography } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Content, Header, Sider } = Layout

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const datasetId = 'demo-central-01'
  const menuItems = [
    { key: '/dashboard', icon: <BarChartOutlined />, label: '总览' },
    { key: '/datasets', icon: <DatabaseOutlined />, label: '数据集' },
    { key: `/diagram/${datasetId}`, icon: <FundOutlined />, label: '运行图' },
    { key: `/analysis/conflicts/${datasetId}`, icon: <ExperimentOutlined />, label: '冲突检测' },
    { key: '/methodology', icon: <ReadOutlined />, label: '方法说明' },
  ]

  const selectedKey = menuItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '/dashboard'

  return (
    <Layout className="workspace-shell">
      <Sider collapsible collapsed={collapsed} trigger={null} width={224} className="app-sider">
        <button className="logo-button" type="button" onClick={() => navigate('/')}>
          <span className="logo-mark">R</span>
          {!collapsed && <span>RailOps Analyzer</span>}
        </button>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header className="workspace-header">
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <Space>
            <Typography.Text className="dataset-name">Demo Central Station</Typography.Text>
            <Tag color="gold">模拟数据</Tag>
          </Space>
        </Header>
        <Content className="workspace-content"><Outlet /></Content>
      </Layout>
    </Layout>
  )
}

