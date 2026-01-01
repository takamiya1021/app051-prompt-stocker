/**
 * app.js のユニットテスト
 * フィルタリング・検索ロジックのテスト
 */

// モック: LocalStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = String(value); }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// App モジュールを読み込み
const App = require('../js/app.js');

describe('App モジュール', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        // 状態をリセット
        App.state.currentCategory = 'all';
        App.state.currentTag = null;
        App.state.searchQuery = '';
    });

    describe('filterPrompts', () => {
        const testPrompts = [
            { id: '1', text: 'sunset landscape', category: 'image', tags: ['sunset', 'nature'], favorite: true },
            { id: '2', text: 'anime character', category: 'image', tags: ['anime', 'portrait'], favorite: false },
            { id: '3', text: 'code review', category: 'code', tags: ['review'], favorite: false },
            { id: '4', text: 'chat prompt', category: 'chat', tags: ['chat'], favorite: true }
        ];

        test('allカテゴリは全件を返す', () => {
            App.state.currentCategory = 'all';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(4);
        });

        test('imageカテゴリはimageのみ返す', () => {
            App.state.currentCategory = 'image';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(2);
            expect(result.every(p => p.category === 'image')).toBe(true);
        });

        test('favoriteカテゴリはお気に入りのみ返す', () => {
            App.state.currentCategory = 'favorite';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(2);
            expect(result.every(p => p.favorite)).toBe(true);
        });

        test('タグフィルターが適用される', () => {
            App.state.currentTag = 'anime';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        test('検索クエリが適用される（テキスト）', () => {
            App.state.searchQuery = 'sunset';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        test('検索クエリが適用される（タグ）', () => {
            App.state.searchQuery = 'portrait';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('2');
        });

        test('カテゴリとタグの複合フィルター', () => {
            App.state.currentCategory = 'image';
            App.state.currentTag = 'nature';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });

        test('検索クエリは大文字小文字を区別しない', () => {
            App.state.searchQuery = 'SUNSET';
            const result = App.filterPrompts(testPrompts);
            expect(result).toHaveLength(1);
        });
    });
});
