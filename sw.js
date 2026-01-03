const CACHE_NAME = 'prompt-stocker-v1.1.9-11-ga35a859';
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

// キャッシュ優先 (Cache First) 戦略
// キャッシュがあれば即座に返し、バックグラウンドで更新
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // キャッシュがあれば即座に返す
            if (cachedResponse) {
                // バックグラウンドでキャッシュを更新（Stale While Revalidate）
                event.waitUntil(
                    fetch(event.request).then((response) => {
                        if (response && response.status === 200 && event.request.url.startsWith('http')) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, response);
                            });
                        }
                    }).catch(() => { })
                );
                return cachedResponse;
            }

            // キャッシュがなければネットワークから取得してキャッシュに保存
            return fetch(event.request).then((response) => {
                if (response && response.status === 200 && event.request.url.startsWith('http')) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});
