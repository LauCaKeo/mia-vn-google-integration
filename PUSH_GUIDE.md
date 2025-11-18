# 🚀 Hướng Dẫn Push Lên GitHub

## ⚡ Cách Nhanh Nhất

### Option 1: Dùng Script `quick-push.sh` (Khuyến nghị)

```bash
./quick-push.sh
```

Script sẽ:

- Tự động thử push trực tiếp
- Nếu thất bại, hỏi bạn muốn dùng Personal Access Token hay đổi remote

---

### Option 2: Push Với Personal Access Token

1. **Tạo Token:**
   - Vào: <https://github.com/settings/tokens>
   - Click "Generate new token (classic)"
   - Chọn quyền: `repo` (full control)
   - Copy token

2. **Push với token:**

```bash
git push https://<YOUR_TOKEN>@github.com/LauCaKeo/mia-vn-google-integration.git main
```

Hoặc thêm token vào URL:

```bash
git remote set-url origin https://<YOUR_TOKEN>@github.com/LauCaKeo/mia-vn-google-integration.git
git push origin main
```

---

### Option 3: Đổi Remote Sang Repo Của Bạn

Nếu bạn muốn push vào repo của chính mình:

```bash
# Đổi remote
git remote set-url origin https://github.com/caovinhphuc/mia-vn-google-integration.git

# Push
git push -u origin main
```

---

### Option 4: Dùng SSH Key

Nếu bạn đã setup SSH key:

```bash
# Đổi remote sang SSH
git remote set-url origin git@github.com:LauCaKeo/mia-vn-google-integration.git

# Push
git push origin main
```

**Lưu ý:** Cần có SSH key được thêm vào GitHub account.

---

## 🔍 Kiểm Tra Trạng Thái

```bash
# Xem remote hiện tại
git remote -v

# Xem commits chưa push
git log origin/main..HEAD

# Xem thay đổi
git status
```

---

## ⚠️ Troubleshooting

### Lỗi: Permission denied

- **Giải pháp:** Dùng Personal Access Token (Option 2)

### Lỗi: Repository not found

- **Giải pháp:** Kiểm tra tên repo và quyền truy cập

### Lỗi: Authentication failed

- **Giải pháp:** Tạo token mới hoặc kiểm tra credentials

---

## 📝 Lưu Ý

- ⚠️ **KHÔNG** commit file `.env` hoặc credentials
- ✅ Đảm bảo `.gitignore` đã có `.env`
- ✅ Test build trước khi push: `npm run build`

---

## 🎯 Sau Khi Push Thành Công

1. ✅ Kiểm tra trên GitHub: <https://github.com/LauCaKeo/mia-vn-google-integration>
2. ✅ Deploy lên Vercel: `vercel --prod`
3. ✅ Kiểm tra health: `npm run health-check`
