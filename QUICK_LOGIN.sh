#!/bin/bash

# =============================================================================
# Quick Login Script - Đăng nhập GitHub với tài khoản Laucakeo
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Đăng Nhập GitHub với Tài Khoản Laucakeo${NC}"
echo ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI chưa cài. Đang cài...${NC}"
    brew install gh
fi

# Check current login status
echo -e "${BLUE}📋 Kiểm tra trạng thái đăng nhập...${NC}"
if gh auth status &>/dev/null; then
    echo -e "${GREEN}✅ Đã đăng nhập:${NC}"
    gh auth status
    echo ""
    read -p "Bạn có muốn đăng nhập lại với tài khoản khác? (y/N): " RE_LOGIN
    if [[ "$RE_LOGIN" != "y" && "$RE_LOGIN" != "Y" ]]; then
        echo -e "${GREEN}✅ Giữ nguyên tài khoản hiện tại${NC}"
        exit 0
    fi
    gh auth logout
fi

# Login
echo -e "${BLUE}🔑 Đăng nhập GitHub...${NC}"
echo ""
echo -e "${YELLOW}Hướng dẫn:${NC}"
echo "1. Chọn: GitHub.com"
echo "2. Chọn: HTTPS"
echo "3. Chọn: Login with a web browser"
echo "4. Copy code và paste vào terminal"
echo "5. Hoặc chọn: Paste an authentication token"
echo ""

gh auth login

# Verify
echo ""
echo -e "${BLUE}✅ Kiểm tra đăng nhập...${NC}"
gh auth status

echo ""
echo -e "${GREEN}🎉 Đăng nhập thành công!${NC}"
echo ""
echo -e "${BLUE}📋 Bây giờ bạn có thể push:${NC}"
echo "   git push origin main"

