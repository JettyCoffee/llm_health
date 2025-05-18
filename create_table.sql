-- 创建分析结果表
create table if not exists analysis_results (
  id bigint generated always as identity primary key,
  user_id text not null,
  time bigint not null,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 添加索引以优化查询性能
create index if not exists analysis_results_user_id_idx on analysis_results(user_id);
create index if not exists analysis_results_time_idx on analysis_results(time desc);

-- 启用行级安全性（RLS）
alter table analysis_results enable row level security;

-- 添加安全策略
create policy "任何人都可以插入数据"
  on analysis_results for insert
  with check (true);

create policy "用户可以查看任何数据"
  on analysis_results for select
  using (true);

-- 赋予访问权限
grant usage on schema public to anon, authenticated;
grant all privileges on analysis_results to anon, authenticated;
grant usage on sequence analysis_results_id_seq to anon, authenticated;
