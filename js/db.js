/**
 * Prompt Stocker - データベースモジュール
 * IndexedDB（画像用）とLocalStorage（メタデータ用）のラッパー
 */

const DB = {
    // IndexedDB設定
    DB_NAME: 'PromptStockerDB',
    DB_VERSION: 1,
    STORE_NAME: 'images',

    // LocalStorageキー
    LS_PROMPTS: 'promptstocker_prompts',

    db: null,

    /**
     * IndexedDBを初期化
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    },

    /**
     * UUIDを生成
     * @returns {string}
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 全プロンプトを取得
     * @returns {Array}
     */
    getPrompts() {
        const data = localStorage.getItem(this.LS_PROMPTS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * プロンプトを保存
     * @param {Array} prompts
     */
    savePrompts(prompts) {
        localStorage.setItem(this.LS_PROMPTS, JSON.stringify(prompts));
    },

    /**
     * 単一プロンプトを追加/更新
     * @param {Object} prompt
     * @returns {Object}
     */
    upsertPrompt(prompt) {
        const prompts = this.getPrompts();
        const index = prompts.findIndex(p => p.id === prompt.id);

        if (index >= 0) {
            prompts[index] = prompt;
        } else {
            prompts.unshift(prompt);
        }

        this.savePrompts(prompts);
        return prompt;
    },

    /**
     * プロンプトを削除
     * @param {string} id
     */
    deletePrompt(id) {
        const prompts = this.getPrompts().filter(p => p.id !== id);
        this.savePrompts(prompts);
    },

    /**
     * 全タグを取得（重複なし・ソート済み）
     * @returns {Array<string>}
     */
    getAllTags() {
        const prompts = this.getPrompts();
        const tagSet = new Set();
        prompts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    },

    /**
     * 画像をIndexedDBに保存
     * @param {string} id - プロンプトID
     * @param {Blob} imageBlob - 画像データ
     */
    async saveImage(id, imageBlob) {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put({ id, blob: imageBlob });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * IndexedDBから画像を取得
     * @param {string} id - プロンプトID
     * @returns {Blob|null}
     */
    async getImage(id) {
        if (!this.db) return null;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result ? request.result.blob : null);
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * IndexedDBから画像を削除
     * @param {string} id - プロンプトID
     */
    async deleteImage(id) {
        if (!this.db) return;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 全データをエクスポート用に取得
     * @returns {Object}
     */
    async exportAll() {
        const prompts = this.getPrompts();
        const exportData = [];

        for (const prompt of prompts) {
            const item = { ...prompt };
            if (prompt.hasImage) {
                const blob = await this.getImage(prompt.id);
                if (blob) {
                    item.imageBase64 = await this.blobToBase64(blob);
                }
            }
            exportData.push(item);
        }

        return { version: 1, prompts: exportData };
    },

    /**
     * データをインポート
     * @param {Object} data
     */
    async importAll(data) {
        if (!data.prompts) return;

        for (const item of data.prompts) {
            const { imageBase64, ...prompt } = item;
            this.upsertPrompt(prompt);

            if (imageBase64) {
                const blob = await this.base64ToBlob(imageBase64);
                await this.saveImage(prompt.id, blob);
            }
        }
    },

    /**
     * BlobをBase64に変換
     * @param {Blob} blob
     * @returns {string}
     */
    blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Base64をBlobに変換
     * @param {string} base64
     * @returns {Blob}
     */
    async base64ToBlob(base64) {
        const response = await fetch(base64);
        return response.blob();
    }
};

// CommonJS エクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DB;
}
