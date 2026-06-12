#!/bin/zsh
set -e

REPO="tasogare-kikurin-podcast"
OWNER="kikurin-tasogare"
REMOTE="https://github.com/${OWNER}/${REPO}.git"
DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$DIR"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init -b main
fi

if ! git rev-parse HEAD >/dev/null 2>&1; then
  git add .
  git commit -m "$(cat <<'EOF'
黄昏きくりんサイトをGitHub Pages公開用に初期化。

ブランドサイト・曼荼羅DB・組織曼荼羅を含む。
EOF
)"
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "origin は既に設定済み: $(git remote get-url origin)"
else
  git remote add origin "$REMOTE"
fi

echo ""
echo "次のステップ:"
echo "1. GitHub で空のリポジトリを作成: https://github.com/new"
echo "   - Owner: ${OWNER}"
echo "   - Repository name: ${REPO}"
echo "   - Public / README なし で作成"
echo ""
echo "2. このスクリプトを再実行するか、以下を実行:"
echo "   git push -u origin main"
echo ""
echo "3. GitHub → Settings → Pages → Source: GitHub Actions"
echo "   （workflow が自動デプロイします）"
echo ""
echo "公開URL:"
echo "https://${OWNER}.github.io/${REPO}/"
