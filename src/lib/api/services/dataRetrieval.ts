/**
 * 数据检索服务
 */
import { supabase } from '@/lib/supabase';
import { ReportData } from '../types';
import { errorResponse } from '../utils';

// 获取最新分析结果
export async function getLatestAnalysis(): Promise<ReportData | null> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    return data as ReportData;
  } catch (error) {
    console.error('获取最新分析错误:', error);
    return null;
  }
}

// 根据 ID 获取报告
export async function getReportById(reportId: string): Promise<ReportData | null> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('reportId', reportId)
      .single();

    if (error) {
      throw error;
    }

    return data as ReportData;
  } catch (error) {
    console.error(`获取报告 ${reportId} 错误:`, error);
    return null;
  }
}

// 导出报告为 PDF (仅生成数据，具体导出实现在路由处理)
export async function prepareReportExport(reportId: string): Promise<ReportData | null> {
  return await getReportById(reportId);
}
