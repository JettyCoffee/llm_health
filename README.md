# LLM Health（多模态心理健康分析平台）

LLM Health是一个基于大型语言模型（LLM）和多模态分析的心理健康评估平台，通过视频采集、语音转文字、情感分析和多维度心理评估，为用户提供全面的心理健康状况报告。

## 项目特点

- **多模态分析**：整合视频、音频和文本多维度数据，提供全面的心理健康评估
- **异步处理架构**：采用后台任务处理模式，突破Vercel的60秒执行限制
- **多AI模型集成**：集成OpenAI、Google AI、智谱AI等多种大型语言模型
- **FFmpeg视频处理**：在浏览器端实现视频处理与转换
- **渐进式分析反馈**：实时展示分析进度，提供透明的处理流程
- **私密数据处理**：确保用户敏感信息安全与隐私保护

## 技术栈

- **前端框架**：Next.js 15 + React 19 + Material UI
- **后端服务**：Next.js API Routes + Supabase
- **数据库**：PostgreSQL (Supabase)
- **AI服务**：
  - OpenAI API (GPT-4, Whisper)
  - Google AI (Gemini)
  - 智谱AI (GLM大模型)
- **视频处理**：FFmpeg-WASM (浏览器端视频处理)
- **部署平台**：Vercel

## 安装与运行

### 前提条件

- Node.js 18+
- npm 或 yarn
- Supabase账户（用于数据库服务）
- 各AI服务平台的API密钥

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/your-username/llm-health.git
cd llm-health
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 环境变量配置

创建`.env.local`文件，填入以下配置：

```
# 基础配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Google AI配置
GOOGLE_AI_API_KEY=your_google_ai_api_key

# 智谱AI配置
ZHIPU_API_KEY=your_zhipu_api_key
```

4. 初始化数据库

在Supabase项目中执行`supabase/migrations`目录下的SQL文件。

5. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js应用路由和页面
│   ├── analysis/          # 分析流程页面
│   ├── api/               # API路由端点
│   │   ├── analysis/      # 分析相关API
│   │   ├── async-analysis/ # 异步分析API
│   │   └── ...
│   ├── final_report/      # 分析报告页面
│   └── ...
├── components/            # React组件
│   ├── analysis/          # 分析流程组件
│   ├── layout/           # 布局组件
│   └── ui/               # 通用UI组件
├── lib/                   # 工具库和服务
│   ├── api/              # API工具和服务
│   │   ├── services/     # 业务服务实现
│   │   ├── types.ts      # 类型定义
│   │   └── ...
│   └── ...
├── public/                # 静态资源
│   ├── ffmpeg-core.js     # FFmpeg WASM核心文件
│   ├── ffmpeg-core.wasm   # FFmpeg WASM二进制文件
│   └── ...
├── supabase/              # Supabase配置和迁移
│   ├── migrations/        # 数据库迁移文件
│   └── ...
└── ...
```

## API参考

### 主要API端点

- `/api/analysis` - 一次性分析处理
- `/api/async-analysis` - 异步分析处理
- `/api/analyze-and-report` - 分析并生成报告
- `/api/export-report` - 导出分析报告

### 异步分析流程

1. 前端提交分析请求到`/api/async-analysis`
2. 后端创建任务并返回任务ID
3. 前端通过任务ID轮询任务状态
4. 任务完成后获取分析结果

## 主要功能流程

1. **用户同意与视频录制**：获取用户许可，使用浏览器API录制视频
2. **视频处理**：使用FFmpeg-WASM在浏览器端处理视频
3. **语音转文字**：通过OpenAI Whisper API转换语音为文字
4. **情感分析**：分析语音和视频中的情感表达
5. **多维心理评估**：使用多个LLM模型进行心理状态评估
6. **生成综合报告**：整合各维度分析结果，生成全面的心理健康报告

## 技术亮点

### 异步任务处理

通过实现异步处理流程，解决了Vercel函数60秒执行限制的问题：

```typescript
// 创建异步任务
async function createAsyncTask(taskData) {
  const { data, error } = await supabase
    .from('analysis_tasks')
    .insert({
      status: 'pending',
      data: taskData,
    })
    .select();
  
  return data[0];
}

// 更新任务状态
async function updateTaskStatus(taskId, status, results = null) {
  await supabase
    .from('analysis_tasks')
    .update({
      status,
      results,
      updated_at: new Date(),
    })
    .eq('id', taskId);
}
```

### 浏览器端视频处理

使用FFmpeg-WASM在浏览器端实现视频处理，避免服务器负载：

```typescript
async function processVideo(videoBlob) {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  
  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(videoBlob));
  await ffmpeg.run('-i', 'input.webm', '-vn', '-acodec', 'libmp3lame', 'output.mp3');
  
  const audioData = ffmpeg.FS('readFile', 'output.mp3');
  return new Blob([audioData.buffer], { type: 'audio/mp3' });
}
```

## 未来计划

- 增加更多AI模型的支持
- 实现更精细的情绪识别
- 添加历史记录与趋势分析功能
- 开发移动应用版本
- 实现多语言支持

## 团队成员

- [团队成员1]
- [团队成员2]
- [团队成员3]
- ...

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
