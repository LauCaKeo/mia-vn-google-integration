#!/bin/bash

# =============================================================================
# Quick Push Script - Push với Personal Access Token hoặc SSH
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Push to GitHub${NC}"
echo ""

# Check git status
if [ -z "$(git status --porcelain)" ] && [ "$(git rev-list HEAD...origin/main 2>/dev/null | wc -l)" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Không có thay đổi để push${NC}"
    exit 0
fi

# Get current remote
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

echo -e "${BLUE}📋 Current remote:${NC} $CURRENT_REMOTE"
echo ""

# Option 1: Try push directly (nếu đã có credentials)
echo -e "${GREEN}🔄 Thử push trực tiếp...${NC}"
if git push origin main 2>&1; then
    echo -e "${GREEN}✅ Push thành công!${NC}"
    exit 0
fi

# Option 2: Use Personal Access Token``
echo ""
echo -e "${YELLOW}💡 Cần authentication. Bạn có thể:${NC}"
echo "1. Dùng Personal Access Token (PAT)"
echo "2. Đổi remote sang repo của bạn"
echo ""
read -p "Chọn (1/2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo -e "${BLUE}📝 Nhập Personal Access Token:${NC}"
    echo "Tạo tại: https://github.com/settings/tokens"
    echo ""
    read -sp "Token: " GITHUB_TOKEN
    echo ""

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ Token không được để trống${NC}"
        exit 1
    fi

    # Extract repo from current remote
    REPO_PATH=$(echo "$CURRENT_REMOTE" | sed 's|.*github.com[:/]||' | sed 's|\.git$||')

    # Push with token
    echo -e "${GREEN}🔄 Pushing với token...${NC}"
    git push https://${GITHUB_TOKEN}@github.com/${REPO_PATH}.git main

elif [ "$choice" == "2" ]; then
    echo ""
    echo -e "${BLUE}📝 Nhập GitHub username của bạn:${NC}"
    read -p "Username: " GITHUB_USER

    if [ -z "$GITHUB_USER" ]; then
        echo -e "${RED}❌ Username không được để trống${NC}"
        exit 1
    fi

    # Extract repo name
    REPO_NAME=$(echo "$CURRENT_REMOTE" | sed 's|.*/||' | sed 's|\.git$||')

    # Set new remote
    NEW_REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    echo -e "${GREEN}🔄 Đổi remote sang:${NC} $NEW_REMOTE"
    git remote set-url origin "$NEW_REMOTE"

    # Push
    echo -e "${GREEN}🔄 Pushing...${NC}"
    git push -u origin main
else
    echo -e "${RED}❌ Lựa chọn không hợp lệ${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Hoàn thành!${NC}"

