# 项目结构与代码组织

## 目录结构

```
src/
├── app/                   # App Router 页面和 API 路由
│   ├── api/               # API 端点（使用 App Router）
│   ├── analysis/          # 分析页面
│   ├── final_report/      # 报告显示页面
│   ├── layout.tsx         # 全局布局
│   └── page.tsx           # 首页
├── components/            # 组件按功能分类
│   ├── analysis/          # 分析相关组件
│   ├── layout/            # 布局相关组件
│   └── ui/                # UI和通用组件
├── lib/                   # 共享库和工具函数
│   ├── api/               # API 相关功能
│   │   ├── services/      # 按功能分类的服务
│   │   ├── types.ts       # 共享类型定义
│   │   └── utils.ts       # API 工具函数
│   ├── routing.ts         # 路由工具和类型
│   ├── supabase.ts        # 数据库连接
│   └── createEmotionCache.ts # MUI 样式缓存配置
├── pages/                 # 遗留 Pages Router 页面（计划迁移）
│   └── _app.tsx           # 全局应用配置
├── theme/                 # 主题配置
└── types/                 # 全局类型定义
```

## 代码组织原则

1. **按功能分类**：组件和代码按照其功能和用途进行分组。

2. **类型共享**：在 `lib/api/types.ts` 中定义共享的数据类型，确保前端和 API 使用相同的类型定义。

3. **服务模块化**：API 相关功能被拆分为独立的服务模块，位于 `lib/api/services` 目录中。

4. **统一响应格式**：所有 API 端点返回统一的响应格式：
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: string;
   }
   ```

5. **路由兼容性**：使用 `lib/routing.ts` 中的工具来保持路由的类型安全和兼容性。

## API 设计

当前的 API 结构按照 `API-REDESIGN.md` 文档进行了优化，主要处理以下功能：

1. **视频分析与报告生成**：`/api/analyze-and-report` 端点
2. **数据检索**：`/api/analysis/latest` 和 `/api/export-report` 端点

所有 API 端点都使用统一的错误处理和响应格式，以提供一致的客户端体验。

## 未来改进

1. **完全迁移到 App Router**：参考 `ROUTER-MIGRATION.md` 中的迁移计划，逐步淘汰 Pages Router。

2. **组件库扩展**：为常见 UI 模式创建更多可重用组件，特别是在 `components/ui` 目录中。

3. **服务层测试**：为 API 服务添加单元测试，确保功能正确性和代码质量。

4. **性能优化**：实现以下性能改进：
   - 服务器组件的合理使用
   - 数据缓存策略
   - 按需加载组件和资源

5. **文档增强**：为主要组件和服务添加更详细的文档和使用示例。
