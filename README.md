# 多模态健康分析系统

基于Next.js开发的健康分析平台，使用GLM-4V多模态大模型分析面部、声音和心率数据，提供专业的健康评估和建议。

## 主要功能

- **多模态数据采集**: 支持面部图像捕获、声音特征和心率数据输入
- **双阶段LLM分析**:
  - 第一阶段: 专业评分与分析（面部、声音、心率及整体健康评分）
  - 第二阶段: 基于分析结果和历史数据生成个性化健康建议
- **历史数据可视化**: 展示历史健康评分趋势和详细分析记录
- **数据库存储**: 所有分析记录存储在PostgreSQL数据库中

## 技术栈

- **前端**:
  - Next.js 13 (App Router)
  - React 18
  - Material UI (Google Material Design)
  - Chart.js (数据可视化)
  - Webcam (摄像头采集)

- **后端**:
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL

- **AI服务**:
  - 智谱 GLM-4V 多模态大模型API

## 项目结构

```
app/
  ├── api/             # API路由
  │   ├── llm/         # LLM处理API
  │   └── history/     # 历史数据API
  ├── components/      # 组件
  │   ├── DataInputForm.tsx    # 数据输入表单
  │   ├── AnalysisResults.tsx  # 分析结果展示
  │   └── HistoryView.tsx      # 历史记录查看
  ├── lib/             # 库函数
  │   └── prisma.ts    # Prisma客户端
  └── utils/           # 工具函数
prisma/
  └── schema.prisma    # 数据库模型
```

## 部署

项目设计为部署在Vercel平台上，并使用Vercel Postgres或其他兼容的PostgreSQL数据库服务。

### 环境变量

部署前需配置以下环境变量:

```
DATABASE_URL=          # PostgreSQL数据库连接URL
GLM_API_KEY=           # 智谱GLM-4V API密钥
GLM_API_URL=           # 智谱GLM-4V API端点
```

## 本地开发

1. 克隆项目
2. 安装依赖: `npm install`
3. 复制`.env.example`为`.env.local`并填写必要的环境变量
4. 初始化数据库: `npx prisma db push`
5. 运行开发服务器: `npm run dev`

## 许可证

MIT 