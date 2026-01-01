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

        // gemini-3-pro-image-preview モデルを使用
        // GEMINI.md によると responseModalities の指定は不要（デフォルトで画像生成優先）
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview'
        });

        const result = await model.generateContent(prompt);
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
