/**
 * Prompt Stocker - 画像生成モジュール
 * Gemini SDK を使用した画像生成
 */

// CDN から SDK を動的インポート
let GoogleGenerativeAI = null;

async function initSDK() {
    if (!GoogleGenerativeAI) {
        const module = await import('https://esm.sh/@google/generative-ai@latest');
        GoogleGenerativeAI = module.GoogleGenerativeAI;
    }
    return GoogleGenerativeAI;
}

/**
 * 画像を生成する
 * @param {string} prompt - 画像生成用プロンプト
 * @returns {Promise<Blob>} - 生成された画像のBlob
 */
export async function generateImage(prompt) {
    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
        throw new Error('APIキーが設定されていません。サイドバーの「API設定」からキーを入力してください。');
    }

    if (!prompt || prompt.trim() === '') {
        throw new Error('プロンプトが空です。画像生成用のプロンプトを入力してください。');
    }

    try {
        const GenAI = await initSDK();
        const genAI = new GenAI(apiKey);

        // LocalStorage から選択されたモデルを取得（デフォルトは Flash）
        const selectedModel = localStorage.getItem('gemini_ai_model') || 'gemini-2.5-flash-image';

        // モデルに応じた設定を準備（GEMINI.md の指針に準拠）
        const modelOptions = {
            model: selectedModel
        };

        // 画像生成モデルの場合は画像生成を強制するために responseModalities を指定
        if (selectedModel === 'gemini-2.5-flash-image' || selectedModel === 'gemini-3-pro-image-preview') {
            modelOptions.generationConfig = {
                responseModalities: ['IMAGE']
            };
        }

        const model = genAI.getGenerativeModel(modelOptions);

        // タイムアウト設定（30秒）
        // SDK のバージョンによっては requestOptions が使えるが、安全のために AbortController 的なタイムアウトを考慮
        // ここでは SDK 標準の requestOptions を試みる
        const result = await model.generateContent(prompt, { timeout: 45000 });
        const response = result.response;

        // レスポンスから画像データを取得
        const parts = response.candidates?.[0]?.content?.parts;

        if (!parts || parts.length === 0) {
            throw new Error('画像の生成に失敗しました。別のプロンプトを試してください。');
        }

        // 画像パートを探す
        const imagePart = parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            // テキストレスポンスが返ってきた場合
            const textPart = parts.find(part => part.text);
            if (textPart) {
                throw new Error(`画像生成できませんでした: ${textPart.text}`);
            }
            throw new Error('画像データが見つかりません。');
        }

        // Base64 から Blob に変換
        const { mimeType, data } = imagePart.inlineData;
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Blob([bytes], { type: mimeType || 'image/png' });

    } catch (error) {
        console.error('画像生成エラー:', error);

        // エラーメッセージを整形
        if (error.message.includes('API key')) {
            throw new Error('APIキーが無効です。正しいキーを入力してください。');
        }
        if (error.message.includes('403')) {
            throw new Error('このモデルへのアクセス権がありません。Allowlist制限の可能性があります。');
        }
        if (error.message.includes('429')) {
            throw new Error('レート制限に達しました。しばらく待ってから再試行してください。');
        }
        if (error.message.includes('timeout') || error.message.includes('Deadline') || error.message.includes('operation was aborted')) {
            throw new Error('生成がタイムアウトしました。プロンプトが複雑すぎるか、プロモデル（Gemini 3 Pro）が指示の処理に苦戦している可能性があります。ゲームの仕様などではなく、描きたい「絵」の見た目の特徴を中心に短くまとめてみてください。');
        }
        if (error.message.includes('finishReason')) {
            throw new Error('画像の生成に失敗しました（安全フィルターや規約による制限の可能性があります）。別の表現を試してください。');
        }

        throw error;
    }
}

/**
 * APIキーを保存する
 * @param {string} apiKey 
 */
export function saveApiKey(apiKey) {
    if (apiKey && apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        return true;
    }
    return false;
}

/**
 * APIキーが設定されているか確認
 * @returns {boolean}
 */
export function hasApiKey() {
    return !!localStorage.getItem('gemini_api_key');
}

/**
 * APIキーを削除する
 */
export function clearApiKey() {
    localStorage.removeItem('gemini_api_key');
}
