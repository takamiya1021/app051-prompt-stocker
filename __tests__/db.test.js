/**
 * db.js のユニットテスト
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

// DB モジュールを読み込み
const DB = require('../js/db.js');

describe('DB モジュール', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('generateId', () => {
        test('UUID v4 形式の文字列を返す', () => {
            const id = DB.generateId();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
            expect(id).toMatch(uuidRegex);
        });

        test('呼び出すたびに異なるIDを生成する', () => {
            const id1 = DB.generateId();
            const id2 = DB.generateId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('LocalStorage CRUD', () => {
        test('getPrompts: 空の場合は空配列を返す', () => {
            const prompts = DB.getPrompts();
            expect(prompts).toEqual([]);
        });

        test('savePrompts / getPrompts: 保存したデータを取得できる', () => {
            const testData = [{ id: '1', text: 'test prompt' }];
            DB.savePrompts(testData);
            const result = DB.getPrompts();
            expect(result).toEqual(testData);
        });

        test('upsertPrompt: 新規追加ができる', () => {
            const prompt = { id: 'new-1', text: 'new prompt', category: 'image' };
            DB.upsertPrompt(prompt);
            const prompts = DB.getPrompts();
            expect(prompts).toHaveLength(1);
            expect(prompts[0].id).toBe('new-1');
        });

        test('upsertPrompt: 既存の更新ができる', () => {
            const prompt1 = { id: 'update-1', text: 'original' };
            const prompt2 = { id: 'update-1', text: 'updated' };
            DB.upsertPrompt(prompt1);
            DB.upsertPrompt(prompt2);
            const prompts = DB.getPrompts();
            expect(prompts).toHaveLength(1);
            expect(prompts[0].text).toBe('updated');
        });

        test('deletePrompt: 削除ができる', () => {
            DB.savePrompts([{ id: 'del-1' }, { id: 'del-2' }]);
            DB.deletePrompt('del-1');
            const prompts = DB.getPrompts();
            expect(prompts).toHaveLength(1);
            expect(prompts[0].id).toBe('del-2');
        });

        test('getAllTags: 重複なしでタグを取得できる', () => {
            DB.savePrompts([
                { id: '1', tags: ['anime', 'portrait'] },
                { id: '2', tags: ['anime', 'landscape'] }
            ]);
            const tags = DB.getAllTags();
            expect(tags).toEqual(['anime', 'landscape', 'portrait']);
        });
    });
});
