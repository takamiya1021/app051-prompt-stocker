# プロンプトストッカー開発タスク（TDD準拠版）

## Phase 0: テスト環境構築 [x]
- [x] Jest + jsdom セットアップ
- [x] テスト実行確認

## Phase 1: データベースモジュール（TDD） [x]
- [x] generateId（Red→Green→Refactor）
- [x] LocalStorage CRUD（Red→Green→Refactor）
- [x] IndexedDB 画像保存（Red→Green→Refactor）

## Phase 2: UIモジュール（TDD） [x]
- [x] カード生成（Red→Green→Refactor）
- [x] モーダル制御（Red→Green→Refactor）

## Phase 3: アプリロジック（TDD） [x]
- [x] フィルタリング（Red→Green→Refactor）
- [x] 検索（Red→Green→Refactor）

## Phase 4: E2E動作確認 [x]
- [x] 手動・Playwright でユーザー操作確認

## Phase 5: UI改善・不具合修正 [x]
- [x] 画像アップロードUIの改善（プレビュー表示位置）
- [x] ラベル修正（「画像生成」→「画像」）
- [x] タグ入力時の自動補完（datalist）
- [x] PWAの完全実装
    - [x] icons/ ディレクトリ作成
    - [x] アイコン画像生成（Android 192/512, iOS Touch Icon）
    - [x] manifest.json 作成
    - [x] sw.js 作成（オフラインキャッシュ対応）
    - [x] index.html メタタグ修正（iOS対応含む）
    - [x] js/app.js SW登録パス修正

## Derivative: v1.0.0-kai (Based on v1.0.0)
- [x] 派生版の開発開始
    - [x] ブランチ作成 (v1.0.0-kai)
    - [x] カードレイアウト変更（画像50%、タイトル追加）
    - [x] フッターにカテゴリ・アクションボタン配置
    - [x] 高さ調整スライダー追加
    - [x] ライトモード切替追加（修正済み）
    - [x] 画像生成API連携（gemini-3-pro-image-preview）
    - [x] 設定専用モーダルの実装（API設定を移動）
    - [x] タグクラウドのスクロール対応（省スペース化）
## Phase 6: UI改善（カードデザイン刷新） [x]
- [x] プロンプトカード機能強化
    - [x] 詳細モーダルの廃止（カード上で完結）
    - [x] アクションボタン（コピー、編集、削除、お気に入り）の追加
    - [x] テキストの高さ制限解除・調整機能（スライダー）の実装
    - [x] 画像へのテキスト回り込みレイアウトの実装（BFC構造変更）
    - [x] カテゴリバッジの復活と配置調整
    - [x] ホバー・クリックアニメーションの最適化
53: 
54: ## Phase 7: 不具合修正（テーマ切り替え） [x]
55: - [x] CSS変数の整理と統合（style.css）
56: - [x] ダークモード（デフォルト）の配色復元
57: - [x] ライトモードの配色定義の修正
58: - [x] 全コンポーネントの変数参照を更新
59: - [x] 動作確認（Playwright）

## Phase 9: 不具合調査（WSL クロームでのスライダー動作） [x]
- [x] 現像の再現（Playwright）
- [x] 原因調査（DOMの重なり、CSS、イベントハンドラ）
- [x] 修正と検証

## Phase 8: UI改善（サイドバーボタン） [x]
- [x] インポート/エクスポートボタンの横並び・コンパクト化
- [x] 動作確認（Playwright）

## Phase 10: 不具合修正（設定モーダル・AI画像ボタン） [x]
- [x] API設定モーダルの「X」ボタンの動作修正
- [x] プロンプト編集モーダルへの「AI画像生成」ボタンの復旧
- [x] 動作確認（Playwright）

## Phase 11: 言語ルールの刷新（日本語化の徹底） [x]
- [x] GEMINI.md の言語設定セクションを刷新（二段階翻訳プロセスの導入）
- [x] 動作確認（お嬢による目視確認）
