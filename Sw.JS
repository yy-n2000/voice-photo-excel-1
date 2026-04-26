// Service Worker - 语音拍照记录表
const CACHE_NAME = 'voice-excel-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

// 安装：预缓存所有静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('部分资源缓存失败（可忽略）:', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活：清理旧版缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，失败降级到网络
self.addEventListener('fetch', event => {
  // 讯飞 WebSocket 和 API 请求不走缓存
  const url = event.request.url;
  if (url.includes('xfyun.cn') || url.startsWith('wss://')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 只缓存成功的 GET 请求
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 离线且无缓存时，返回主页
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
