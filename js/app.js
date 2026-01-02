/**
 * Prompt Stocker - メインアプリケーション
 * フィルタリング・検索ロジック + 統合コード
 */

const App = {
    // 状態管理
    state: {
        currentCategory: 'all',
        currentTag: null,
        searchQuery: '',
        editingPromptId: null,
        currentDetailPrompt: null,
        imageUrls: new Map()
    },

    // DOM要素キャッシュ
    elements: {},

    // 現在選択中の画像Blob
    currentImageBlob: null,

    /**
     * モバイルメニューの開閉
     * @param {boolean} show 
     */
    toggleMobileMenu(show) {
        if (!this.elements.sidebar || !this.elements.sidebarOverlay) return;

        if (show) {
            this.elements.sidebar.classList.add('active');
            this.elements.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            this.elements.sidebar.classList.remove('active');
            this.elements.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * プロンプトをフィルタリング
     * @param {Array} prompts
     * @returns {Array}
     */
    filterPrompts(prompts) {
        let filtered = prompts;

        // カテゴリフィルター
        if (this.state.currentCategory === 'favorite') {
            filtered = filtered.filter(p => p.favorite);
        } else if (this.state.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.state.currentCategory);
        }

        // タグフィルター
        if (this.state.currentTag) {
            filtered = filtered.filter(p => p.tags && p.tags.includes(this.state.currentTag));
        }

        // 検索フィルター
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.text.toLowerCase().includes(query) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        return filtered;
    },

    /**
     * アプリ初期化
     */
    async init() {
        // DB初期化
        if (typeof DB !== 'undefined' && DB.init) {
            await DB.init();
        }

        // DOM要素をキャッシュ
        this.cacheElements();

        // イベントリスナー登録
        this.bindEvents();

        // 初期表示
        this.renderGallery();
        this.updateTagCloud();

        // Service Worker登録
        this.registerServiceWorker();

        console.log('Prompt Stocker initialized');
    },

    /**
     * DOM要素をキャッシュ
     */
    cacheElements() {
        this.elements = {
            gallery: document.getElementById('gallery'),
            searchInput: document.getElementById('searchInput'),
            categoryList: document.getElementById('categoryList'),
            tagCloud: document.getElementById('tagCloud'),
            addBtn: document.getElementById('addBtn'),
            editModal: document.getElementById('editModal'),
            detailModal: document.getElementById('detailModal'),
            promptForm: document.getElementById('promptForm'),
            promptId: document.getElementById('promptId'),
            promptTitle: document.getElementById('promptTitle'), // Added
            promptText: document.getElementById('promptText'),
            categorySelect: document.getElementById('categorySelect'),
            tagsInput: document.getElementById('tagsInput'),
            favoriteCheck: document.getElementById('favoriteCheck'),
            imageInput: document.getElementById('imageInput'),
            dropzone: document.getElementById('dropzone'),
            imagePreview: document.getElementById('imagePreview'),
            previewImg: document.getElementById('previewImg'),
            modalTitle: document.getElementById('modalTitle'),
            tagSuggestions: document.getElementById('tagSuggestions'),
            exportBtn: document.getElementById('exportBtn'),
            importBtn: document.getElementById('importBtn'),
            importFile: document.getElementById('importFile'),
            // Mobile Menu Elements
            menuBtn: document.getElementById('menuBtn'),
            closeMenuBtn: document.getElementById('closeMenuBtn'),
            mobileSearchBtn: document.getElementById('mobileSearchBtn'), // New
            searchBox: document.querySelector('.search-box'), // Make sure this targets the wrapper
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay')
        };
    },

    /**
     * イベントリスナーを登録
     */
    bindEvents() {
        // 新規登録ボタン
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.openEditModal());
        }

        // モーダル閉じるボタン（汎用）
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-close-modal]')) {
                UI.closeAllModals();
            }
        });

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => UI.closeModal('editModal'));

        // モーダル背景クリックで閉じる
        document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => UI.closeAllModals());
        });

        // フォーム送信
        if (this.elements.promptForm) {
            this.elements.promptForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // 検索
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // カテゴリ選択
        if (this.elements.categoryList) {
            this.elements.categoryList.addEventListener('click', (e) => {
                const item = e.target.closest('.category-list__item');
                if (item) this.handleCategorySelect(item.dataset.category);
            });
        }

        // タグ選択
        if (this.elements.tagCloud) {
            this.elements.tagCloud.addEventListener('click', (e) => {
                const tag = e.target.closest('.tag');
                if (tag) this.handleTagSelect(tag.dataset.tag);
            });
        }

        // ギャラリークリック（アクションボタン対応）
        if (this.elements.gallery) {
            this.elements.gallery.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('[data-action]');
                if (!actionBtn) return; // アクションボタン以外は無視

                e.stopPropagation();
                const card = actionBtn.closest('.prompt-card');
                if (!card) return;

                const promptId = card.dataset.id;
                const action = actionBtn.dataset.action;

                switch (action) {
                    case 'filter-tag':
                        const tag = actionBtn.dataset.tag;
                        if (tag && typeof App !== 'undefined') {
                            App.handleTagSelect(tag);
                        }
                        break;
                    case 'copy':
                        const prompts = typeof DB !== 'undefined' ? DB.getPrompts() : [];
                        const prompt = prompts.find(p => p.id === promptId);
                        if (prompt && typeof UI !== 'undefined') {
                            UI.copyToClipboard(prompt.text);
                            UI.showToast('📋 コピーしました！');
                        }
                        break;
                    case 'edit':
                        this.openEditModal(promptId);
                        break;
                    case 'delete':
                        this.deletePrompt(promptId);
                        break;
                    case 'favorite':
                        this.toggleFavorite(promptId);
                        break;
                }
            });
        }

        // 画像アップロード
        const selectImageBtn = document.getElementById('selectImageBtn');
        if (selectImageBtn) {
            selectImageBtn.addEventListener('click', () => this.elements.imageInput.click());
        }
        if (this.elements.imageInput) {
            this.elements.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        }
        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => this.removeImage());
        }

        // ドラッグ&ドロップ
        if (this.elements.dropzone) {
            this.elements.dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.currentTarget.classList.add('dragover');
            });
            this.elements.dropzone.addEventListener('dragleave', () => {
                this.elements.dropzone.classList.remove('dragover');
            });
            this.elements.dropzone.addEventListener('drop', (e) => this.handleImageDrop(e));
        }

        // Mobile Menu Toggle
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => {
                this.toggleMobileMenu(true);
            });
        }

        if (this.elements.closeMenuBtn) {
            this.elements.closeMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu(false);
            });
        }

        // Mobile Search Toggle
        if (this.elements.mobileSearchBtn && this.elements.searchBox) {
            this.elements.mobileSearchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.elements.searchBox.classList.toggle('active');
                if (this.elements.searchInput) {
                    setTimeout(() => this.elements.searchInput.focus(), 100);
                }
            });

            // Context Click check for search close
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 &&
                    this.elements.searchBox.classList.contains('active') &&
                    !this.elements.searchBox.contains(e.target) &&
                    !this.elements.mobileSearchBtn.contains(e.target)) {
                    this.elements.searchBox.classList.remove('active');
                }
            });
        }

        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => {
                this.toggleMobileMenu(false);
            });
        }

        // 詳細モーダルのアクション
        const copyPromptBtn = document.getElementById('copyPromptBtn');
        if (copyPromptBtn) {
            copyPromptBtn.addEventListener('click', () => {
                if (this.state.currentDetailPrompt) {
                    UI.copyToClipboard(this.state.currentDetailPrompt.text);
                }
            });
        }

        const editPromptBtn = document.getElementById('editPromptBtn');
        if (editPromptBtn) {
            editPromptBtn.addEventListener('click', () => {
                if (this.state.currentDetailPrompt) {
                    UI.closeModal('detailModal');
                    this.openEditModal(this.state.currentDetailPrompt.id);
                }
            });
        }

        const deletePromptBtn = document.getElementById('deletePromptBtn');
        if (deletePromptBtn) {
            deletePromptBtn.addEventListener('click', () => {
                if (this.state.currentDetailPrompt) {
                    this.deletePrompt(this.state.currentDetailPrompt.id);
                }
            });
        }

        // エクスポート/インポート
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportData());
        }
        if (this.elements.importBtn) {
            this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        }
        if (this.elements.importFile) {
            this.elements.importFile.addEventListener('change', (e) => this.importData(e));
        }

        // 高さ制限スライダー
        const heightSlider = document.getElementById('heightSlider');
        const unlimitedHeight = document.getElementById('unlimitedHeight');
        const heightValue = document.getElementById('heightValue');

        if (heightSlider && unlimitedHeight) {
            let rafId = null;
            const updateHeight = () => {
                if (unlimitedHeight.checked) {
                    heightSlider.disabled = true;
                    document.documentElement.style.setProperty('--card-max-height', 'none');
                    if (heightValue) heightValue.textContent = '全表示';
                } else {
                    heightSlider.disabled = false;
                    const val = heightSlider.value;
                    document.documentElement.style.setProperty('--card-max-height', val + 'px');
                    if (heightValue) heightValue.textContent = val + 'px';
                }

                // パフォーマンス最適化: requestAnimationFrame で描画に合わせて実行
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    this.checkTextTruncation();
                    rafId = null;
                });
            };

            heightSlider.addEventListener('input', updateHeight);
            unlimitedHeight.addEventListener('change', updateHeight);

            // 初期状態反映
            updateHeight();
        }

        // テーマ切替（ライト/ダークモード）
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // 保存済みテーマの復元
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggle.checked = true;
            }

            themeToggle.addEventListener('change', () => {
                if (themeToggle.checked) {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'dark');
                }
            });
        }

        // 設定モーダルを開く
        const openSettingsBtn = document.getElementById('openSettingsBtn');
        if (openSettingsBtn) {
            openSettingsBtn.addEventListener('click', () => {
                if (typeof UI !== 'undefined') UI.openModal('settingsModal');
            });
        }

        // 設定モーダル内のAPIキー保存
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKeyStatus = document.getElementById('apiKeyStatus');
        const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');

        if (saveApiKeyBtn && apiKeyInput) {
            const aiModelSelect = document.getElementById('aiModelSelect');

            // 保存済み設定があれば反映
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                apiKeyInput.placeholder = '●●●●●●●●（設定済み）';
            }
            if (aiModelSelect) {
                const savedModel = localStorage.getItem('gemini_ai_model');
                if (savedModel) {
                    aiModelSelect.value = savedModel;
                }
            }

            saveApiKeyBtn.addEventListener('click', () => {
                const key = apiKeyInput.value.trim();
                const model = aiModelSelect ? aiModelSelect.value : null;

                if (key) {
                    localStorage.setItem('gemini_api_key', key);
                    apiKeyInput.value = '';
                    apiKeyInput.placeholder = '●●●●●●●●（設定済み）';
                }

                if (model) {
                    localStorage.setItem('gemini_ai_model', model);
                }

                if (key || model) {
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = '✓ 保存しました';
                        apiKeyStatus.className = 'api-key-status saved';
                        setTimeout(() => { apiKeyStatus.textContent = ''; }, 3000);
                    }
                    if (typeof UI !== 'undefined') UI.showToast('⚙️ 設定を保存しました');
                }
            });
        }

        // APIキー削除
        if (clearApiKeyBtn) {
            clearApiKeyBtn.addEventListener('click', () => {
                localStorage.removeItem('gemini_api_key');
                if (apiKeyInput) apiKeyInput.placeholder = 'AIza...';
                if (apiKeyStatus) {
                    apiKeyStatus.textContent = '削除しました';
                    apiKeyStatus.className = 'api-key-status error';
                    setTimeout(() => { apiKeyStatus.textContent = ''; }, 3000);
                }
                if (typeof UI !== 'undefined') UI.showToast('APIキーを削除しました');
            });
        }

        // 画像生成ボタン
        const generateImageBtn = document.getElementById('generateImageBtn');
        if (generateImageBtn) {
            generateImageBtn.addEventListener('click', async () => {
                const promptText = this.elements.promptText?.value;

                if (!promptText || promptText.trim() === '') {
                    if (typeof UI !== 'undefined') UI.showToast('プロンプトを入力してください', 'error');
                    return;
                }

                if (!localStorage.getItem('gemini_api_key')) {
                    if (typeof UI !== 'undefined') UI.showToast('APIキーを設定してください', 'error');
                    return;
                }

                // UI状態切り替え
                const dropzone = document.getElementById('dropzone');
                const generating = document.getElementById('imageGenerating');
                if (dropzone) dropzone.hidden = true;
                if (generating) generating.hidden = false;

                try {
                    // 動的インポートで画像生成モジュールを読み込み
                    const { generateImage } = await import('./imageGen.js');
                    const blob = await generateImage(promptText);

                    // プレビューに表示
                    this.showImagePreview(blob);
                    if (typeof UI !== 'undefined') UI.showToast('🎨 画像を生成しました！');

                } catch (error) {
                    console.error('画像生成エラー:', error);
                    if (typeof UI !== 'undefined') UI.showToast(error.message || '画像生成に失敗しました', 'error');

                    // ドロップゾーンを戻す
                    if (dropzone) dropzone.hidden = false;
                } finally {
                    if (generating) generating.hidden = true;
                }
            });
        }
    },

    /**
     * ギャラリーを描画
     */
    async renderGallery() {
        if (!this.elements.gallery) return;

        let prompts = typeof DB !== 'undefined' ? DB.getPrompts() : [];
        prompts = this.filterPrompts(prompts);

        // 既存のObjectURLを解放
        this.state.imageUrls.forEach(url => URL.revokeObjectURL(url));
        this.state.imageUrls.clear();

        // ギャラリーをクリア（空状態以外）
        const cards = this.elements.gallery.querySelectorAll('.prompt-card');
        cards.forEach(card => card.remove());

        // 空状態の表示
        if (typeof UI !== 'undefined') {
            UI.toggleEmptyState(prompts.length === 0);
        }

        // カードを追加
        for (const prompt of prompts) {
            let imageUrl = null;
            if (prompt.hasImage && typeof DB !== 'undefined' && DB.getImage) {
                try {
                    const blob = await DB.getImage(prompt.id);
                    if (blob) {
                        imageUrl = URL.createObjectURL(blob);
                        this.state.imageUrls.set(prompt.id, imageUrl);
                    }
                } catch (e) {
                    console.warn('画像の読み込みに失敗:', prompt.id);
                }
            }

            if (typeof UI !== 'undefined') {
                const card = UI.createCard(prompt, imageUrl);
                this.elements.gallery.appendChild(card);
            }
        }

        // テキストがはみ出ているかチェックして「...」表示用クラスを追加
        this.checkTextTruncation();
    },

    /**
     * テキストのオーバーフローをチェックして .truncated クラスを付与
     */
    checkTextTruncation() {
        if (!this.elements.gallery) return;

        this.elements.gallery.querySelectorAll('.prompt-card__text').forEach(textEl => {
            // scrollHeight > clientHeight なら溢れている
            if (textEl.scrollHeight > textEl.clientHeight) {
                textEl.classList.add('truncated');
            } else {
                textEl.classList.remove('truncated');
            }
        });
    },

    /**
     * タグクラウドを更新
     */
    updateTagCloud() {
        if (typeof DB !== 'undefined' && typeof UI !== 'undefined') {
            const tags = DB.getAllTags();
            UI.updateTagCloud(tags, this.state.currentTag);
        }
    },

    /**
     * 検索処理
     */
    handleSearch(query) {
        this.state.searchQuery = query;
        this.renderGallery();
    },

    /**
     * カテゴリ選択処理
     */
    handleCategorySelect(category) {
        this.state.currentCategory = category;
        this.state.currentTag = null;

        if (this.elements.categoryList) {
            this.elements.categoryList.querySelectorAll('.category-list__item').forEach(item => {
                item.classList.toggle('active', item.dataset.category === category);
            });
        }

        this.updateTagCloud();
        this.renderGallery();
    },

    /**
     * タグ選択処理
     */
    handleTagSelect(tag) {
        this.state.currentTag = this.state.currentTag === tag ? null : tag;
        this.updateTagCloud();
        this.renderGallery();
    },

    /**
     * 新規登録モーダルを開く
     */
    openAddModal() {
        this.state.editingPromptId = null;
        if (this.elements.promptId) this.elements.promptId.value = '';
        if (this.elements.promptTitle) this.elements.promptTitle.value = '';
        if (this.elements.promptText) this.elements.promptText.value = '';
        if (this.elements.categorySelect) this.elements.categorySelect.value = 'image';
        if (this.elements.tagsInput) this.elements.tagsInput.value = '';
        if (this.elements.favoriteCheck) this.elements.favoriteCheck.checked = false;

        this.removeImage();
        this.updateTagSuggestions();

        if (typeof UI !== 'undefined') UI.openModal('editModal');
    },

    /**
     * 編集モーダルを開く
     */
    async openEditModal(id = null) {
        this.state.editingPromptId = id;

        // フォームをリセット
        if (this.elements.promptForm) this.elements.promptForm.reset();
        this.removeImage();

        if (id && typeof DB !== 'undefined') {
            const prompts = DB.getPrompts();
            const prompt = prompts.find(p => p.id === id);

            if (prompt) {
                if (this.elements.modalTitle) this.elements.modalTitle.textContent = 'プロンプト編集';
                if (this.elements.promptId) this.elements.promptId.value = prompt.id;
                if (this.elements.promptTitle) this.elements.promptTitle.value = prompt.title || ''; // Added
                if (this.elements.promptText) this.elements.promptText.value = prompt.text;
                if (this.elements.categorySelect) this.elements.categorySelect.value = prompt.category;
                if (this.elements.tagsInput) this.elements.tagsInput.value = prompt.tags ? prompt.tags.join(', ') : '';
                if (this.elements.favoriteCheck) this.elements.favoriteCheck.checked = prompt.favorite || false;

                if (prompt.hasImage && DB.getImage) {
                    const blob = await DB.getImage(prompt.id);
                    if (blob) this.showImagePreview(blob);
                }
            }
        } else {
            // 新規作成時の初期値設定
            if (this.elements.modalTitle) this.elements.modalTitle.textContent = 'プロンプト登録';
            if (this.elements.promptId) this.elements.promptId.value = '';

            // 現在のカテゴリフィルタを初期値に反映（all, favorite以外）
            if (this.state.currentCategory &&
                this.state.currentCategory !== 'all' &&
                this.state.currentCategory !== 'favorite') {
                if (this.elements.categorySelect) {
                    this.elements.categorySelect.value = this.state.currentCategory;
                }
            }
        }

        // タグの補完リストを更新
        this.updateTagSuggestions();

        if (typeof UI !== 'undefined') UI.openModal('editModal');
    },

    /**
     * 詳細モーダルを開く
     */
    async openDetailModal(id) {
        if (typeof DB === 'undefined') return;

        const prompts = DB.getPrompts();
        const prompt = prompts.find(p => p.id === id);

        if (!prompt) return;

        this.state.currentDetailPrompt = prompt;

        let imageUrl = this.state.imageUrls.get(id);
        if (!imageUrl && prompt.hasImage && DB.getImage) {
            const blob = await DB.getImage(id);
            if (blob) imageUrl = URL.createObjectURL(blob);
        }

        if (typeof UI !== 'undefined') UI.showDetail(prompt, imageUrl);
    },

    /**
     * フォーム送信処理
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        if (typeof DB === 'undefined') return;

        const id = this.elements.promptId.value || DB.generateId();
        const tagsStr = this.elements.tagsInput.value;
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

        const prompt = {
            id,
            title: this.elements.promptTitle ? this.elements.promptTitle.value : '',
            text: this.elements.promptText.value,
            category: this.elements.categorySelect.value,
            tags,
            favorite: this.elements.favoriteCheck.checked,
            hasImage: !!this.currentImageBlob,
            updatedAt: new Date().toISOString()
        };

        DB.upsertPrompt(prompt);

        if (this.currentImageBlob && DB.saveImage) {
            await DB.saveImage(id, this.currentImageBlob);
        }

        if (typeof UI !== 'undefined') UI.closeModal('editModal');
        this.currentImageBlob = null;
        this.renderGallery();
        this.updateTagCloud();

        if (typeof UI !== 'undefined') {
            UI.showToast(this.state.editingPromptId ? '✏️ 更新しました！' : '✅ 登録しました！');
        }
    },

    /**
     * 画像選択処理
     */
    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.showImagePreview(file);
        }
    },

    /**
     * 画像ドロップ処理
     */
    handleImageDrop(e) {
        e.preventDefault();
        if (this.elements.dropzone) this.elements.dropzone.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.showImagePreview(file);
        }
    },

    /**
     * 画像プレビューを表示
     */
    showImagePreview(blob) {
        this.currentImageBlob = blob;
        const url = URL.createObjectURL(blob);
        if (this.elements.previewImg) this.elements.previewImg.src = url;
        if (this.elements.dropzone) this.elements.dropzone.hidden = true;
        if (this.elements.imagePreview) this.elements.imagePreview.hidden = false;
    },

    /**
     * 画像を削除
     */
    removeImage() {
        this.currentImageBlob = null;
        if (this.elements.previewImg) this.elements.previewImg.src = '';
        if (this.elements.dropzone) this.elements.dropzone.hidden = false;
        if (this.elements.imagePreview) this.elements.imagePreview.hidden = true;
        if (this.elements.imageInput) this.elements.imageInput.value = '';
    },

    /**
     * お気に入りをトグル
     */
    toggleFavorite(id) {
        if (typeof DB === 'undefined') return;

        const prompts = DB.getPrompts();
        const prompt = prompts.find(p => p.id === id);

        if (prompt) {
            prompt.favorite = !prompt.favorite;
            DB.upsertPrompt(prompt);

            // DOMを直接更新（再描画による「ビビン」防止）
            const card = this.elements.gallery.querySelector(`.prompt-card[data-id="${id}"]`);
            if (card) {
                const btn = card.querySelector('[data-action="favorite"]');
                if (btn) {
                    btn.textContent = prompt.favorite ? '⭐' : '☆';
                    // 必要ならクラスもトグル
                    // btn.classList.toggle('active', prompt.favorite);
                }
            }

            // フィルタリング中などの場合のみ再描画が必要ならここに入れるが、
            // 現状は全表示またはカテゴリフィルタのみなので、お気に入りの変化でカードが消えることはない想定。
        }
    },

    /**
     * プロンプトを削除
     */
    async deletePrompt(id) {
        if (!confirm('このプロンプトを削除しますか？')) return;
        if (typeof DB === 'undefined') return;

        const prompt = DB.getPrompts().find(p => p.id === id);
        if (prompt && prompt.hasImage && DB.deleteImage) {
            await DB.deleteImage(id);
        }

        DB.deletePrompt(id);
        if (typeof UI !== 'undefined') UI.closeModal('detailModal');
        this.renderGallery();
        this.updateTagCloud();

        if (typeof UI !== 'undefined') UI.showToast('🗑️ 削除しました');
    },

    /**
     * データをエクスポート
     */
    async exportData() {
        if (typeof DB === 'undefined' || !DB.exportAll) return;

        try {
            const data = await DB.exportAll();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt-stocker-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();

            URL.revokeObjectURL(url);
            if (typeof UI !== 'undefined') UI.showToast('📤 エクスポート完了！');
        } catch (error) {
            console.error('Export error:', error);
            if (typeof UI !== 'undefined') UI.showToast('エクスポートに失敗しました', 'error');
        }
    },

    /**
     * データをインポート
     */
    async importData(e) {
        if (typeof DB === 'undefined' || !DB.importAll) return;

        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await DB.importAll(data);

            this.renderGallery();
            this.updateTagCloud();
            if (typeof UI !== 'undefined') UI.showToast('📥 インポート完了！');
        } catch (error) {
            console.error('Import error:', error);
            if (typeof UI !== 'undefined') UI.showToast('インポートに失敗しました', 'error');
        }

        e.target.value = '';
    },

    /**
     * タグ入力の補完リストを更新
     */
    updateTagSuggestions() {
        if (!this.elements.tagSuggestions || typeof DB === 'undefined') return;

        const tags = DB.getAllTags();
        this.elements.tagSuggestions.innerHTML = tags
            .map(tag => `<option value="${tag}">`)
            .join('');
    },

    /**
     * Service Workerを登録
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }
};

// CommonJS エクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

// ブラウザ起動
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => App.init());
}
