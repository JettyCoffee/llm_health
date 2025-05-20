-- 创建分析任务表
CREATE TABLE IF NOT EXISTS analysis_tasks (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_task_id ON analysis_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_status ON analysis_tasks(status);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_created_at ON analysis_tasks(created_at);
