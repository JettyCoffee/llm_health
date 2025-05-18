# AI 健康分析应用 API 重构文档

## 重构背景

原有的 API 设计采用了两个独立的端点来处理不同阶段的 AI 分析：
1. `/api/analysis/route.ts` - 处理视频上传和第一轮 LLM 分析，将结果保存到数据库
2. `/api/report/route.ts` - 从数据库读取第一轮分析结果，进行第二轮 LLM 分析，再次保存到数据库

这种设计存在以下问题：
- 数据重复存储，两次分析都被保存到数据库
- 接口间依赖复杂，需要在两个 API 调用之间传递 ID
- 数据类型定义在多个文件中重复，缺乏一致性
- 在 Bug 或数据解析错误时debug困难

## 重构方案

我们创建了一个新的统一 API 端点 `/api/analyze-and-report/route.ts`，它整合了原有两个 API 的功能，但做了以下优化：

1. **优化数据流**：
   - 仅保存最终分析结果到数据库
   - 第一个 LLM 的分析结果直接传递给第二个 LLM，不经过数据库

2. **重构代码结构**：
   - 将功能分解为三个清晰的步骤：视频分析、报告生成、数据存储
   - 统一了数据类型定义

3. **优化前端交互**：
   - 简化了前端代码，减少了 API 调用次数
   - 提供更准确的状态和错误反馈

## 实现详情

新的 API 端点 `/api/analyze-and-report/route.ts` 实现了以下功能：

1. **视频接收和验证**：
   - 支持 MP4 视频文件上传
   - 限制最大文件大小（10MB）
   - 进行格式验证

2. **视频分析（analyzeVideo 函数）**：
   - 将视频转换为 base64 格式
   - 调用 DashScope API 进行视频分析
   - 解析和格式化返回结果

3. **心理报告生成（generatePsychologicalReport 函数）**：
   - 将第一步的视频分析结果传递给 Claude API
   - 生成详细的心理分析报告
   - 解析和格式化返回结果

4. **数据存储（saveReportToDatabase 函数）**：
   - 将视频分析和最终报告一起保存到数据库中
   - 使用时间戳作为唯一标识符

5. **统一返回结果**：
   - 返回报告 ID 和完整报告内容
   - 保持与原 API 返回格式兼容

## 前端修改

为了适配新的 API，前端代码进行了以下修改：

1. **分析工具函数（analyzeData.ts）**：
   - 更改 API 端点为新的 `/api/analyze-and-report`
   - 调整返回的数据结构处理

2. **分析页面（analysis/page.tsx）**：
   - 简化了视频分析流程
   - 移除了多步骤请求过程
   - 优化了错误处理和状态显示

## 优势

1. **性能优化**：
   - 减少了数据库操作次数
   - 减少了前端 API 调用次数
   - 减少了数据序列化/反序列化操作

2. **代码质量**：
   - 提高了代码可维护性
   - 统一了数据类型定义
   - 简化了错误处理逻辑

3. **用户体验**：
   - 减少了用户等待时间
   - 提供了更清晰的进度反馈
   - 减少了潜在的失败点

## 使用方法

新的 API 使用方式简单：

1. 构建一个包含视频文件的 FormData
2. 发送 POST 请求到 `/api/analyze-and-report`
3. 接收返回的报告 ID 和报告内容
4. 跳转到报告页面查看详细内容

```typescript
const formData = new FormData();
formData.append('video', videoFile);

const response = await fetch('/api/analyze-and-report', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// 使用 result.reportId 跳转到报告页面
```

## 注意事项

1. 旧的 API 端点（`/api/analysis` 和 `/api/report`）暂时保留以保证兼容性
2. 新版本输出的数据结构与旧版本保持兼容
3. 数据库结构没有变化，仍使用相同的表结构
