import { ArrowRightOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Paragraph, Text, Title } = Typography

export function LandingPage() {
  const navigate = useNavigate()
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Text strong className="landing-brand">RailOps Analyzer</Text>
        <Space><Tag color="cyan">MVP</Tag><Button type="link" href="https://github.com/121388815/rail-ops-analyzer" target="_blank">GitHub</Button><Button type="link" onClick={() => navigate('/methodology')}>方法说明</Button></Space>
      </nav>
      <section className="landing-hero">
        <div>
          <Text className="eyebrow">铁路运输组织 · 可解释分析</Text>
          <Title>让运行图中的冲突<br />和晚点传播一目了然</Title>
          <Paragraph className="lead">
            载入人工构造的车站计划，查看运行图与股道占用，扫描资源冲突，并模拟初始晚点如何影响后续列车。
          </Paragraph>
          <Space size="middle" wrap>
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/dashboard')}>立即体验示例</Button>
            <Button size="large" onClick={() => navigate('/methodology')}>查看规则与限制</Button>
          </Space>
          <Paragraph className="landing-note"><SafetyCertificateOutlined /> 不连接生产网络，不使用真实铁路内部数据。</Paragraph>
        </div>
        <Card className="hero-panel" bordered={false}>
          <div className="mini-diagram" aria-hidden="true">
            <span className="rail-line line-a" /><span className="rail-line line-b" />
            <span className="station-dot dot-a" /><span className="station-dot dot-b" /><span className="station-dot dot-c" />
          </div>
          <Title level={3}>60 秒演示路径</Title>
          {['载入 10 列模拟计划', '查看时间-里程运行图', '发现股道与追踪冲突', '注入 8 分钟晚点', '导出分析结果'].map((item) => (
            <p className="check-item" key={item}><CheckCircleOutlined /> {item}</p>
          ))}
        </Card>
      </section>
      <section className="feature-section">
        <Row gutter={[20, 20]}>
          {[
            ['运行图可视化', '按服务日秒数绘制列车路径，支持缩放与悬停。'],
            ['资源冲突检测', '识别股道占用重叠、追踪间隔和时分不足。'],
            ['晚点传播评估', '展示初始晚点沿股道和区间约束向后传播。'],
          ].map(([title, description]) => <Col xs={24} md={8} key={title}><Card title={title}>{description}</Card></Col>)}
        </Row>
      </section>
    </main>
  )
}
