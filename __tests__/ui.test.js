/**
 * ui.js のユニットテスト
 */

// DOM環境のセットアップ
document.body.innerHTML = `
  <div id="gallery"></div>
  <div id="emptyState" style="display: flex;"></div>
  <div id="tagCloud"></div>
  <div id="toast"></div>
  <div class="modal" id="editModal"></div>
  <div class="modal" id="detailModal"></div>
  <div id="detailImage"></div>
  <div id="detailCategory"></div>
  <div id="detailPrompt"></div>
  <div id="detailTags"></div>
`;

// UI モジュールを読み込み
const UI = require('../js/ui.js');

describe('UI モジュール', () => {
    beforeEach(() => {
        document.body.style.overflow = '';
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });

    describe('escapeHtml', () => {
        test('HTMLタグをエスケープする', () => {
            const result = UI.escapeHtml('<script>alert("xss")</script>');
            expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        });

        test('通常のテキストはそのまま返す', () => {
            const result = UI.escapeHtml('Hello World');
            expect(result).toBe('Hello World');
        });
    });

    describe('getCategoryEmoji', () => {
        test('画像カテゴリは🖼️を返す', () => {
            expect(UI.getCategoryEmoji('image')).toBe('🖼️');
        });

        test('動画カテゴリは🎬を返す', () => {
            expect(UI.getCategoryEmoji('video')).toBe('🎬');
        });

        test('未知のカテゴリは📝を返す', () => {
            expect(UI.getCategoryEmoji('unknown')).toBe('📝');
        });
    });

    describe('createCard', () => {
        test('プロンプトカードのHTML要素を生成する', () => {
            const prompt = {
                id: 'test-1',
                text: 'A beautiful sunset',
                category: 'image',
                tags: ['sunset', 'nature'],
                favorite: false
            };
            const card = UI.createCard(prompt, null);

            expect(card.className).toBe('prompt-card');
            expect(card.dataset.id).toBe('test-1');
            expect(card.innerHTML).toContain('A beautiful sunset');
            expect(card.innerHTML).toContain('#sunset');
        });

        test('画像URLがある場合はimg要素を含む', () => {
            const prompt = { id: 'test-2', text: 'test', category: 'image' };
            const card = UI.createCard(prompt, 'http://example.com/image.jpg');

            expect(card.innerHTML).toContain('src="http://example.com/image.jpg"');
        });

        test('お気に入りの場合は⭐が表示される', () => {
            const prompt = { id: 'test-3', text: 'test', category: 'image', favorite: true };
            const card = UI.createCard(prompt, null);

            expect(card.innerHTML).toContain('⭐');
        });
    });

    describe('openModal / closeModal', () => {
        test('モーダルを開くとactiveクラスが付与される', () => {
            UI.openModal('editModal');
            const modal = document.getElementById('editModal');
            expect(modal.classList.contains('active')).toBe(true);
        });

        test('モーダルを開くとbodyのoverflowがhiddenになる', () => {
            UI.openModal('editModal');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('モーダルを閉じるとactiveクラスが削除される', () => {
            UI.openModal('editModal');
            UI.closeModal('editModal');
            const modal = document.getElementById('editModal');
            expect(modal.classList.contains('active')).toBe(false);
        });
    });

    describe('toggleEmptyState', () => {
        test('showがtrueの場合はflexで表示', () => {
            UI.toggleEmptyState(true);
            const emptyState = document.getElementById('emptyState');
            expect(emptyState.style.display).toBe('flex');
        });

        test('showがfalseの場合は非表示', () => {
            UI.toggleEmptyState(false);
            const emptyState = document.getElementById('emptyState');
            expect(emptyState.style.display).toBe('none');
        });
    });

    describe('updateTagCloud', () => {
        test('タグをHTML要素として生成する', () => {
            UI.updateTagCloud(['anime', 'portrait']);
            const tagCloud = document.getElementById('tagCloud');
            expect(tagCloud.innerHTML).toContain('#anime');
            expect(tagCloud.innerHTML).toContain('#portrait');
        });

        test('アクティブタグにはactiveクラスが付与される', () => {
            UI.updateTagCloud(['anime', 'portrait'], 'anime');
            const tagCloud = document.getElementById('tagCloud');
            expect(tagCloud.innerHTML).toContain('class="tag active"');
        });
    });
});
