import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 以下配置用于支持 ffmpeg.wasm 的运行
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
    };
    
    return config;
  },
  // 配置正确的响应头，以允许跨域加载 wasm 文件
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
