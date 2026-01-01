const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    // 保存先ディレクトリの準備
    const videoDir = path.join(__dirname, '../videos');
    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
    }

    console.log('🚀 デモ録画を開始するでぇ...');

    // ブラウザ起動
    const browser = await chromium.launch({
        headless: true // WSL環境なのでheadless推奨
    });

    // コンテキスト作成（ここで動画保存を設定）
    const context = await browser.newContext({
        recordVideo: {
            dir: videoDir,
            size: { width: 1280, height: 720 }
        },
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    try {
        // 1. アプリにアクセス
        console.log('🔗 アプリを開いとるわ...');
        await page.goto('http://localhost:3051');
        await page.waitForTimeout(2000);

        // 2. 新規登録モーダルを開く
        console.log('➕ 新規登録ボタンをクリック！');
        await page.click('#addBtn');
        await page.waitForTimeout(1000);

        // 3. プロンプトを入力
        console.log('✍️ プロンプトを入力中...');
        await page.fill('#promptText', 'A wonderful sunset over the ocean, highly detailed, 8k');
        await page.selectOption('#categorySelect', 'image');
        await page.fill('#tagsInput', 'sunset, landscape, nature');
        await page.waitForTimeout(1000);

        // 4. サンプル画像をアップロード（アイコンを流用）
        console.log('🖼️ 画像を選択中...');
        const filePath = path.join(__dirname, '../icons/icon-512.png');
        if (fs.existsSync(filePath)) {
            const [fileChooser] = await Promise.all([
                page.waitForEvent('filechooser'),
                page.click('#selectImageBtn')
            ]);
            await fileChooser.setFiles(filePath);
        }
        await page.waitForTimeout(2000);

        // 5. 保存
        console.log('💾 保存ボタンをクリック！');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        // 6. 検索ボックスで絞り込み
        console.log('🔍 検索を試しとるでぇ...');
        await page.fill('#searchInput', 'sunset');
        await page.waitForTimeout(2000);
        await page.fill('#searchInput', '');
        await page.waitForTimeout(1000);

        // 7. カテゴリでフィルタリング
        console.log('📁 カテゴリ「画像」を選択！');
        await page.click('.category-list__item[data-category="image"]');
        await page.waitForTimeout(2000);

        // 8. カードの詳細を開く
        console.log('🔎 詳細を表示するわ...');
        await page.click('.prompt-card');
        await page.waitForTimeout(3000);

        // 9. 詳細を閉じる
        console.log('❌ 詳細を閉じるでぇ');
        await page.click('#closeDetailModal');
        await page.waitForTimeout(1000);

        console.log('✅ デモ操作完了！');

    } catch (error) {
        console.error('❌ エラー発生：', error);
    } finally {
        // コンテキストを閉じると動画が保存される
        await context.close();

        // 動画ファイルのパスを表示（Playwrightが自動で名前をつける）
        const video = await page.video();
        if (video) {
            const videoPath = await video.path();
            console.log(`\n🎉 動画が保存されたでぇ！\n場所: ${videoPath}`);
        }

        await browser.close();
    }
})();
