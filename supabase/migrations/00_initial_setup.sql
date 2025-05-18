-- Create the analysis_results table
create table if not exists public.analysis_results (
    id bigint primary key generated always as identity,
    user_id text not null,
    time bigint not null,
    result jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.analysis_results enable row level security;

-- Create a policy that allows all authenticated users to select their own records
create policy "Users can view their own analysis results"
  on public.analysis_results
  for select
  using (auth.uid()::text = user_id);

-- Create a policy that allows all authenticated users to insert their own records
create policy "Users can insert their own analysis results"
  on public.analysis_results
  for insert
  with check (auth.uid()::text = user_id);

-- Create function to get the latest analysis result for a user
create or replace function get_latest_analysis(p_user_id text)
returns json
language plpgsql
security definer
as $$
begin
  return (
    select 
      json_build_object(
        'id', id,
        'time', time,
        'result', result::json,
        'created_at', created_at
      )
    from analysis_results
    where user_id = p_user_id
    order by created_at desc
    limit 1
  );
end;
$$;
