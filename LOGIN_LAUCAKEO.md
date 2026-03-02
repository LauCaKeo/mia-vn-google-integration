# 🔐 Đăng Nhập GitHub với Tài Khoản Laucakeo

## ⚠️ Trạng Thái Hiện Tại

Bạn đang đăng nhập với tài khoản: **caovinhphuc**

Để push vào repo `Laucakeo/mia-vn-google-integration`, cần đăng nhập với tài khoản **Laucakeo**.

---

## ✅ Cách 1: Dùng GitHub CLI (Khuyến nghị)

### Bước 1: Đăng xuất tài khoản hiện tại

```bash
gh auth logout
```

### Bước 2: Đăng nhập với tài khoản Laucakeo

```bash
gh auth login
```

**Chọn các options:**

1. **What account do you want to log into?** → `GitHub.com`
2. **What is your preferred protocol for Git operations?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes`
4. **How would you like to authenticate GitHub CLI?** → Chọn một trong:
   - **Login with a web browser** (dễ nhất)
   - **Paste an authentication token** (nếu có token)

### Bước 3: Xác nhận

- Nếu chọn web browser: Copy code và paste vào browser
- Nếu chọn token: Paste Personal Access Token của Laucakeo

### Bước 4: Kiểm tra

```bash
gh auth status
```

Phải hiển thị: `Logged in to github.com account Laucakeo`

### Bước 5: Push

```bash
git push origin main
```

---

## ✅ Cách 2: Dùng Personal Access Token

### Bước 1: Tạo Token (với tài khoản Laucakeo)

1. **Đăng nhập GitHub với Laucakeo:**
   - Vào: <https://github.com/login>
   - Đăng nhập với username/password của Laucakeo

2. **Tạo Token:**
   - Vào: <https://github.com/settings/tokens>
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - Đặt tên: `mia-vn-push`
   - Chọn quyền: ✅ **`repo`**
   - Click **"Generate token"**
   - **Copy token** (chỉ hiện 1 lần!)

### Bước 2: Push với Token

```bash
# Push trực tiếp
git push https://<TOKEN>@github.com/Laucakeo/mia-vn-google-integration.git main

# Hoặc thêm vào remote
git remote set-url origin https://<TOKEN>@github.com/Laucakeo/mia-vn-google-integration.git
git push origin main
```

---

## ✅ Cách 3: Dùng Script Tự Động

```bash
# Chạy script
./QUICK_LOGIN.sh
```

Script sẽ hướng dẫn từng bước.

---

## 🔍 Kiểm Tra

```bash
# Xem tài khoản hiện tại
gh auth status

# Phải hiển thị: "Logged in to github.com account Laucakeo"
```

---

## ⚠️ Lưu Ý

1. **Nếu đã đăng nhập với caovinhphuc:**
   - Phải logout trước: `gh auth logout`
   - Sau đó login lại với Laucakeo

2. **Nếu dùng token:**
   - Token phải của tài khoản Laucakeo
   - Token phải có quyền `repo`

3. **Multiple accounts:**
   - GitHub CLI chỉ hỗ trợ 1 tài khoản tại một thời điểm
   - Nếu cần switch giữa nhiều tài khoản, dùng token thay vì CLI

---

## 🎯 Khuyến Nghị

**Nếu bạn có quyền truy cập tài khoản Laucakeo:**

- ✅ Dùng **Cách 1 (GitHub CLI)** - Tiện nhất

**Nếu bạn chỉ có token:**

- ✅ Dùng **Cách 2 (PAT)** - Đơn giản nhất

**Nếu bạn muốn tự động hóa:**

- ✅ Dùng **Cách 3 (Script)** - Dễ nhất
