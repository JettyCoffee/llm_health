import createCache from '@emotion/cache';

// 在客户端预先创建 emotion 缓存
// https://emotion.sh/docs/@emotion/cache
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}
