const CACHE_NAME = 'prompt-stocker-__VERSION__';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './js/db.js',
    './js/ui.js',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 古いキャッシュを削除 + 即座にクライアントを制御
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => {
            // 新しいSWが即座に既存のページを制御下に置く
            return self.clients.claim();
        })
    );
});

// メッセージ受信: skipWaiting要求を処理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting requested, activating immediately...');
        self.skipWaiting();
    }
});

// ネットワーク優先 (Network First) 戦略
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then((response) => {
            // 成功したレスポンスをキャッシュに保存
            // ただしブラウザ拡張機能などの chrome-extension スキームは無視
            if (event.request.url.startsWith('http')) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // オフライン時はキャッシュから返す
            return caches.match(event.request);
        })
    );
});
