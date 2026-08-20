# RailOps Analyzer

铁路车站行车组织与晚点传播分析平台。使用人工构造的单站案例展示运行图、股道占用、资源冲突检测和晚点传播评估。

[在线演示](https://121388815.github.io/rail-ops-analyzer/) · [GitHub 源码](https://github.com/121388815/rail-ops-analyzer)

> 本项目不连接铁路生产网络，不使用真实内部数据。分析结论和启发式建议仅用于算法验证与求职展示，不构成调度指令。

## 已实现功能

- 10 列车、3 车站、4 条到发线的可重建示例数据
- 时间—里程运行图与股道占用图，支持缩放和悬停
- 股道占用重叠、追踪间隔、最小停站和最小运行时分检查
- 自定义规则参数、严重度统计及可解释调整建议
- 初始晚点注入，按运行/停站/股道/追踪约束传播
- 冲突报告页面及 JSON、CSV 导出
- FastAPI OpenAPI、统一错误格式、请求编号
- Vite 开发代理、FastAPI 生产 SPA 托管、Docker/Render 配置

## 技术栈

- React 19、TypeScript、Vite、React Router、Ant Design、Apache ECharts、Axios
- FastAPI、Pydantic、pandas、SQLAlchemy（已准备，持久化后续接入）、pytest
- Docker 单容器部署

## 本地启动

仓库当前已经安装好 `.venv` 和 `frontend/node_modules`，可直接运行：

```powershell
.\scripts\dev.ps1
```

打开 <http://127.0.0.1:5173>。按 `Ctrl+C` 可同时结束本次开发服务。

也可以使用两个终端分别启动：

```powershell
# 终端 1：后端
.\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

```powershell
# 终端 2：前端
cd frontend
npm run dev
```

主要地址：

- 前端：<http://127.0.0.1:5173>
- 健康检查：<http://127.0.0.1:8000/api/v1/health>
- Swagger：<http://127.0.0.1:8000/docs>

首次在其他电脑安装依赖：

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt
cd frontend
npm install
```

## 测试与构建

```powershell
.\.venv\Scripts\python -m pytest -q
cd frontend
npm run test
npm run lint
npm run build
```

生产模式可由 FastAPI 直接托管已经构建的前端：

```powershell
cd frontend
npm run build
cd ..
.\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --port 8000
```

访问 <http://127.0.0.1:8000>，刷新任意深层路由也会回退到 SPA 首页文件。

## 在线演示说明

GitHub Pages 在线地址使用预生成的默认示例结果，支持首页、数据集、运行图、股道占用、冲突报告、8 分钟晚点传播和文件下载。由于 GitHub Pages 不运行 Python 服务，在线版的规则参数与晚点表单展示默认场景；本地启动版本会调用 FastAPI 实时计算。

## 核心规则

- 服务日时间统一存为整数秒，允许超过 24:00。
- 占用区间使用半开区间 `[start, end)`，相邻作业不误报。
- 股道重叠扫描按资源分组排序，总体复杂度为 `O(n log n + k)`。
- 晚点仿真保持计划顺序，迭代满足最小运行、停站、出清和追踪约束。

## 项目结构

- `backend/app/domain/`：与 HTTP 和数据库解耦的纯算法
- `backend/app/api/v1/`：REST API
- `backend/app/services/`：数据集、分析与报告用例
- `backend/tests/`：时间、冲突、晚点和 API 黄金路径测试
- `frontend/src/pages/`：PDF 约定的业务页面
- `frontend/src/components/charts/`：ECharts 图表
- `frontend/src/services/`：API 请求封装
- `Dockerfile`、`render.yaml`：单容器部署
