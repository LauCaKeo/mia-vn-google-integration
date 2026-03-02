# 🔧 Sửa Lỗi Push: Permission Denied (403)

## ❌ Lỗi Hiện Tại

```
remote: Permission to Laucakeo/mia-vn-google-integration.git denied to caovinhphuc.
fatal: unable to access 'https://github.com/Laucakeo/mia-vn-google-integration.git/':
The requested URL returned error: 403
```

**Nguyên nhân:** Tài khoản `caovinhphuc` không có quyền push vào repo của `Laucakeo`.

---

## ✅ Giải Pháp

### **Option 1: Dùng Personal Access Token (PAT) của Laucakeo** ⭐ (Khuyến nghị)

1. **Lấy token từ Laucakeo:**
   - Laucakeo cần tạo token tại: <https://github.com/settings/tokens>
   - Chọn quyền: `repo` (full control)
   - Copy token

2. **Push với token:**

```bash
git push https://<TOKEN_CUA_LAUCAKEO>@github.com/Laucakeo/mia-vn-google-integration.git main
```

Hoặc thêm vào remote:

```bash
git remote set-url origin https://<TOKEN_CUA_LAUCAKEO>@github.com/Laucakeo/mia-vn-google-integration.git
git push origin main
```

---

### **Option 2: Được thêm vào repo với quyền Write**

1. Laucakeo cần:
   - Vào repo: <https://github.com/Laucakeo/mia-vn-google-integration>
   - Settings → Collaborators
   - Thêm `caovinhphuc` với quyền **Write**

2. Sau đó push bình thường:

```bash
git push origin main
```

---

### **Option 3: Push vào repo của bạn** 🎯 (Dễ nhất)

Nếu bạn muốn push vào repo của chính mình:

```bash
# Đổi remote
git remote set-url origin https://github.com/caovinhphuc/mia-vn-google-integration.git

# Push
git push -u origin main
```

**Lưu ý:** Cần tạo repo `mia-vn-google-integration` trên GitHub account `caovinhphuc` trước.

---

### **Option 4: Fork và Push vào Fork**

1. Fork repo: <https://github.com/Laucakeo/mia-vn-google-integration>
2. Đổi remote:

```bash
git remote set-url origin https://github.com/caovinhphuc/mia-vn-google-integration.git
git push -u origin main
```

---

## 🔍 Kiểm Tra

```bash
# Xem remote hiện tại
git remote -v

# Xem commits chưa push
git log origin/main..HEAD --oneline
```

---

## 💡 Khuyến Nghị

**Nếu bạn là collaborator:**

- Dùng Option 1 (PAT) hoặc Option 2 (được thêm vào repo)

**Nếu bạn muốn có repo riêng:**

- Dùng Option 3 (push vào repo của bạn)

**Nếu bạn muốn contribute:**

- Dùng Option 4 (fork và tạo Pull Request)

---

## ⚠️ Lưu Ý

- **KHÔNG** commit token vào code
- Token chỉ dùng trong command line hoặc git credential helper
- Nếu dùng token, có thể lưu vào git credential:

```bash
git config --global credential.helper store
```
