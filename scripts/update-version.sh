#!/bin/bash
# Gitタグまたは環境変数からバージョンを取得してindex.htmlに埋め込む

# バージョンを取得（優先順位: Gitタグ → Vercel環境変数 → dev）
if VERSION=$(git describe --tags --always 2>/dev/null) && [ -n "$VERSION" ]; then
    echo "Using git tag: $VERSION"
elif [ -n "$VERCEL_GIT_COMMIT_SHA" ]; then
    # Vercel環境: コミットSHAの先頭7文字を使用
    VERSION="build-${VERCEL_GIT_COMMIT_SHA:0:7}"
    echo "Using Vercel commit SHA: $VERSION"
else
    VERSION="dev"
    echo "Using fallback: $VERSION"
fi

echo "Updating version to: $VERSION"

# index.htmlのバージョン表記を更新
sed -i "s/v[0-9]\+\.[0-9]\+\.[0-9]\+\(-[a-zA-Z0-9.-]*\)\?/${VERSION}/g" index.html
sed -i "s/build-[a-f0-9]\{7\}/${VERSION}/g" index.html
sed -i "s/dev/${VERSION}/g" index.html

echo "Version updated successfully!"
