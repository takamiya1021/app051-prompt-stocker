#!/bin/bash
# Gitタグまたは環境変数からバージョンを取得してindex.htmlに埋め込む

# バージョンを取得（優先順位: Gitタグ → Vercel環境変数 → dev）
# git describe --tags: タグがあればタグ名を返す（例: v1.1.6）
# Vercelはshallow cloneのためタグが取れないことが多い
if VERSION=$(git describe --tags 2>/dev/null) && [ -n "$VERSION" ]; then
    echo "Using git tag: $VERSION"
elif [ -n "$VERCEL_GIT_COMMIT_SHA" ]; then
    # Vercel環境: コミットSHAの先頭7文字を使用
    VERSION="${VERCEL_GIT_COMMIT_SHA:0:7}"
    echo "Using Vercel commit SHA: $VERSION"
elif VERSION=$(git rev-parse --short HEAD 2>/dev/null) && [ -n "$VERSION" ]; then
    # ローカル環境でタグがない場合: コミットSHA
    echo "Using git commit SHA: $VERSION"
else
    VERSION="dev"
    echo "Using fallback: $VERSION"
fi

# Changelog（第1引数、または環境変数から取得）
CHANGELOG=${1:-${CHANGELOG:-"OSの安定性向上と細かな修正"}}

# バージョン表記を更新（プレースホルダーまたは既存のバージョンを置換）
# __VERSION__ または v[0-9].* または v[SHA] を置換
# index.html の <div class="sidebar__version">v...</div> 部分を置換
sed -i "s/__VERSION__/${VERSION}/g" index.html
sed -i "s/sidebar__version\">v[^\<]*/sidebar__version\">v${VERSION}/g" index.html

# Changelogを更新（プレースホルダーまたは既存の文言を置換）
sed -i "s/__CHANGELOG__/${CHANGELOG}/g" index.html
# 二回目以降の置換（__CHANGELOG__が消えている場合）に対応
sed -i "s/update-banner__changelog\">: [^\<]*/update-banner__changelog\">: ${CHANGELOG}/g" index.html

# sw.js の const CACHE_NAME = 'prompt-stocker-...'; 部分を置換
sed -i "s/__VERSION__/${VERSION}/g" sw.js
sed -i "s/prompt-stocker-[^\']*/prompt-stocker-${VERSION}/g" sw.js

echo "Version updated successfully to ${VERSION} with changelog: ${CHANGELOG}"
