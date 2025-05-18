import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function saveAnalysisResult(userId: string, result: any) {
  try {
    const time = Math.floor(Date.now() / 1000);
    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        time: time,
        result: result // Supabase 会自动处理 JSON 序列化
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return { data: { ...data, time: time } };
  } catch (error) {
    console.error('Save analysis error:', error);
    throw error;
  }
}

export async function getLatestAnalysis(userId: string) {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function getAnalysisById(id: number) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('time', id)
      .single();

    if (error) {
      console.error('获取分析结果错误:', error);
      // 如果是找不到记录的错误，返回null而不是抛出异常
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    // 确保 result 字段是对象而不是字符串
    if (data && data.result) {
      try {
        if (typeof data.result === 'string') {
          data.result = JSON.parse(data.result);
        }
      } catch (e) {
        console.error('解析数据库 result 字段失败:', e);
        // 如果解析失败，保持原样
      }
    }
    
    return data;
  } catch (error) {
    console.error('获取分析ID为', id, '的结果时发生错误:', error);
    throw error;
  }
}
