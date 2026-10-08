// 🌟 이름을 v2로 올려서 사파리에게 "이전 기억은 다 지우고 새 코드를 받아라!" 라고 강제 명령
const CACHE_NAME = 'fire-board-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 대기하지 않고 새 마법사 즉시 투입
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // 구버전(v1) 찌꺼기 완벽하게 청소해서 파이어베이스 충돌 원인 제거
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // 파이어베이스 등 외부 데이터는 마법사가 아예 쳐다보지도 않고 무조건 통과!
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 🌟 핵심 (네트워크 우선): 일단 인터넷(GitHub)에서 최신 데이터를 가져와 보고, 실패하면(오프라인이면) 임시저장본 띄우기
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
