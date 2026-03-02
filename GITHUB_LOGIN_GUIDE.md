# 🔐 Hướng Dẫn Đăng Nhập GitHub với Tài Khoản Laucakeo

## 🎯 Mục Đích

Để push code vào repo `Laucakeo/mia-vn-google-integration`, bạn cần đăng nhập với tài khoản Laucakeo.

---

## ✅ Cách 1: Dùng Personal Access Token (PAT) - ⭐ Khuyến nghị

### Bước 1: Tạo Token trên GitHub (với tài khoản Laucakeo)

1. **Đăng nhập GitHub với tài khoản Laucakeo:**
   - Vào: <https://github.com/login>
   - Đăng nhập với username/password của Laucakeo

2. **Tạo Personal Access Token:**
   - Vào: <https://github.com/settings/tokens>
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Đặt tên: `mia-vn-google-integration-push`
   - Chọn quyền: ✅ **`repo`** (full control of private repositories)
   - Click **"Generate token"**
   - **Copy token ngay** (chỉ hiện 1 lần!)

### Bước 2: Dùng Token để Push

**Cách A: Push trực tiếp với token**

```bash
git push https://<TOKEN>@github.com/Laucakeo/mia-vn-google-integration.git main
```

**Cách B: Thêm token vào remote URL**

```bash
# Thêm token vào remote
git remote set-url origin https://<TOKEN>@github.com/Laucakeo/mia-vn-google-integration.git

# Push bình thường
git push origin main
```

**Cách C: Lưu token vào git credential (không cần nhập lại)**

```bash
# Lưu credential
git config --global credential.helper store

# Push lần đầu (sẽ hỏi username và password)
# Username: Laucakeo
# Password: <TOKEN> (dán token vào đây)
git push origin main
```

---

## ✅ Cách 2: Dùng GitHub CLI (gh)

### Bước 1: Cài GitHub CLI

```bash
# macOS
brew install gh

# Hoặc download từ: https://cli.github.com/
```

### Bước 2: Đăng nhập

```bash
# Đăng nhập với tài khoản Laucakeo
gh auth login

# Chọn:
# - GitHub.com
# - HTTPS
# - Authenticate Git with your GitHub credentials? Yes
# - Login với browser hoặc token
```

### Bước 3: Push

```bash
# Sau khi đăng nhập, push bình thường
git push origin main
```

---

## ✅ Cách 3: Đổi Git Credentials

### Bước 1: Xóa credentials cũ

```bash
# Xóa credentials đã lưu
git config --global --unset credential.helper
rm ~/.git-credentials 2>/dev/null || true

# Hoặc trên macOS Keychain
git credential-osxkeychain erase
host=github.com
protocol=https
```

### Bước 2: Push và nhập credentials mới

```bash
# Khi push, Git sẽ hỏi:
git push origin main

# Username: Laucakeo
# Password: <TOKEN> (dùng Personal Access Token, không phải password!)
```

---

## ✅ Cách 4: Dùng SSH Key

### Bước 1: Tạo SSH Key (nếu chưa có)

```bash
# Tạo SSH key mới
ssh-keygen -t ed25519 -C "laucakeo@github.com" -f ~/.ssh/id_ed25519_laucakeo

# Copy public key
cat ~/.ssh/id_ed25519_laucakeo.pub
```

### Bước 2: Thêm SSH Key vào GitHub

1. Copy public key (từ bước trên)
2. Vào: <https://github.com/settings/keys> (với tài khoản Laucakeo)
3. Click **"New SSH key"**
4. Paste key và save

### Bước 3: Cấu hình SSH

```bash
# Thêm vào ~/.ssh/config
cat >> ~/.ssh/config << EOF
Host github.com-laucakeo
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laucakeo
EOF
```

### Bước 4: Đổi remote sang SSH

```bash
# Đổi remote
git remote set-url origin git@github.com-laucakeo:Laucakeo/mia-vn-google-integration.git

# Push
git push origin main
```

---

## 🔍 Kiểm Tra Đăng Nhập

```bash
# Kiểm tra GitHub CLI
gh auth status

# Kiểm tra git remote
git remote -v

# Test push (dry run)
git push --dry-run origin main
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Personal Access Token ≠ Password:**
   - Không dùng password GitHub
   - Phải dùng Personal Access Token

2. **Bảo mật Token:**
   - ⚠️ **KHÔNG** commit token vào code
   - ⚠️ **KHÔNG** chia sẻ token
   - Token chỉ dùng trong command line

3. **Token Expiry:**
   - Token có thể có thời hạn
   - Nếu hết hạn, tạo token mới

4. **Multiple Accounts:**
   - Nếu có nhiều tài khoản GitHub, dùng SSH config hoặc credential helper

---

## 🎯 Khuyến Nghị

**Cho người mới:**

- ✅ Dùng **Cách 1 (PAT)** - Đơn giản nhất

**Cho người dùng thường xuyên:**

- ✅ Dùng **Cách 2 (GitHub CLI)** - Tiện lợi nhất

**Cho người dùng nâng cao:**

- ✅ Dùng **Cách 4 (SSH)** - Bảo mật nhất

---

## 🆘 Troubleshooting

### Lỗi: "Authentication failed"

- Kiểm tra token còn hạn không
- Tạo token mới

### Lỗi: "Permission denied"

- Kiểm tra token có quyền `repo` không
- Kiểm tra tài khoản Laucakeo có quyền push vào repo không

### Lỗi: "Repository not found"

- Kiểm tra tên repo đúng chưa: `Laucakeo/mia-vn-google-integration`
- Kiểm tra tài khoản có quyền truy cập repo không
