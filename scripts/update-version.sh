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

echo "Updating version to: $VERSION"

# バージョン表記を更新（プレースホルダー方式）
# __VERSION__ を実際のバージョンに置換
sed -i "s/__VERSION__/${VERSION}/g" index.html
sed -i "s/__VERSION__/${VERSION}/g" sw.js

echo "Version updated successfully!"
