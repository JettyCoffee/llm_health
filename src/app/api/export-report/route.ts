import { NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/supabase-client';

// 这个API端点用于导出PDF报告
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { error: '缺少报告ID' },
        { status: 400 }
      );    }
    
    // 从数据库获取报告数据
    const reportData = await getAnalysisById(parseInt(reportId, 10));
    
    if (!reportData || !reportData.result) {
      return NextResponse.json(
        { error: '找不到报告数据' },
        { status: 404 }
      );
    }
    
    // 解析报告数据
    let resultData;
    try {
      resultData = JSON.parse(reportData.result);
    } catch (error) {
      return NextResponse.json(
        { error: '报告数据格式错误' },
        { status: 500 }
      );
    }
    
    // 生成PDF文件名
    const fileName = `心理分析报告_${reportId}.json`;
    
    // 返回报告数据作为JSON文件下载
    // 注意：这里简化为JSON下载，在实际生产环境中可以使用库如jsPDF或html-pdf-node来生成真正的PDF
    return new NextResponse(JSON.stringify(resultData.report, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
    
  } catch (error) {
    console.error('导出报告错误:', error);
    return NextResponse.json(
      { error: '导出报告失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
