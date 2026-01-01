/**
 * Prompt Stocker - UIモジュール
 * カード生成・表示・トースト通知など
 */

const UI = {
    // カテゴリ表示名マッピング
    CATEGORY_LABELS: {
        image: '🖼️ 画像',
        video: '🎬 動画',
        chat: '💬 チャット',
        code: '💻 コーディング'
    },

    /**
     * カテゴリの絵文字を取得
     * @param {string} category
     * @returns {string}
     */
    getCategoryEmoji(category) {
        const emojis = { image: '🖼️', video: '🎬', chat: '💬', code: '💻' };
        return emojis[category] || '📝';
    },

    /**
     * HTMLエスケープ
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * プロンプトカードを生成
     * @param {Object} prompt
     * @param {string|null} imageUrl - Object URL
     * @returns {HTMLElement}
     */
    createCard(prompt, imageUrl) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.id = prompt.id;

        const imageHtml = imageUrl
            ? `<img class="prompt-card__image" src="${imageUrl}" alt="生成画像" loading="lazy">`
            : `<div class="prompt-card__image prompt-card__image--placeholder">${this.getCategoryEmoji(prompt.category)}</div>`;

        const tagsHtml = prompt.tags && prompt.tags.length
            ? prompt.tags.slice(0, 3).map(tag => `<span class="prompt-card__tag">#${tag}</span>`).join('')
            : '';

        card.innerHTML = `
      <span class="prompt-card__category">${UI.CATEGORY_LABELS[prompt.category]}</span>
      <div class="prompt-scroll-container">
        ${imageHtml}
        <p class="prompt-card__text">${this.escapeHtml(prompt.text)}</p>
      </div>
      <div class="prompt-card__actions">
        <button class="action-btn" data-action="copy" title="コピー">📋</button>
        <button class="action-btn" data-action="edit" title="編集">✏️</button>
        <button class="action-btn" data-action="delete" title="削除">🗑️</button>
        <button class="action-btn favorite-btn ${prompt.favorite ? 'active' : ''}" data-action="favorite" title="お気に入り">
          ${prompt.favorite ? '⭐' : '☆'}
        </button>
      </div>
    `;

        return card;
    },

    /**
     * モーダルを開く
     * @param {string} modalId
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * モーダルを閉じる
     * @param {string} modalId
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * 全モーダルを閉じる
     */
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    /**
     * 空状態の表示/非表示
     * @param {boolean} show
     */
    toggleEmptyState(show) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * タグクラウドを更新
     * @param {Array<string>} tags
     * @param {string|null} activeTag
     */
    updateTagCloud(tags, activeTag = null) {
        const container = document.getElementById('tagCloud');
        if (container) {
            container.innerHTML = tags.map(tag => `
        <span class="tag ${activeTag === tag ? 'active' : ''}" data-tag="${tag}">#${tag}</span>
      `).join('');
        }
    },

    /**
     * トースト通知を表示
     * @param {string} message
     * @param {string} type - 'success' | 'error'
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast show ${type}`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    },

    /**
     * クリップボードにコピー
     * @param {string} text
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('📋 コピーしました！');
            return true;
        } catch (error) {
            // フォールバック
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('📋 コピーしました！');
            return true;
        }
    },

    /**
     * 詳細モーダルにデータを表示
     * @param {Object} prompt
     * @param {string|null} imageUrl
     */
    showDetail(prompt, imageUrl) {
        const imageContainer = document.getElementById('detailImage');
        const categoryEl = document.getElementById('detailCategory');
        const promptEl = document.getElementById('detailPrompt');
        const tagsEl = document.getElementById('detailTags');

        if (imageContainer) {
            if (imageUrl) {
                imageContainer.innerHTML = `<img src="${imageUrl}" alt="生成画像">`;
            } else {
                imageContainer.innerHTML = `<div class="detail-view__image--placeholder">${this.getCategoryEmoji(prompt.category)}</div>`;
            }
        }

        // カテゴリ表示除去
        if (categoryEl) {
            categoryEl.style.display = 'none';
        }

        if (promptEl) {
            promptEl.textContent = prompt.text;
        }

        if (tagsEl) {
            tagsEl.innerHTML = prompt.tags && prompt.tags.length
                ? prompt.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')
                : '<span class="tag">タグなし</span>';
        }

        this.openModal('detailModal');
    }
};

// CommonJS エクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
