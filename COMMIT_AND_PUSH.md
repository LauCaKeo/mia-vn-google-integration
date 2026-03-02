# 🚀 Hướng Dẫn Commit và Push Lên GitHub

## 📋 Các Bước

### 1. Kiểm tra thay đổi

```bash
git status
```

### 2. Thêm files vào staging

```bash
# Thêm tất cả files
git add .

# Hoặc thêm từng file
git add file1.md file2.sh
```

### 3. Commit

```bash
git commit -m "Mô tả thay đổi"
```

**Ví dụ:**

```bash
git commit -m "docs: Thêm hướng dẫn đăng nhập GitHub"
```

### 4. Push lên GitHub

```bash
git push origin main
```

---

## ⚡ Quick Commands

### Commit và Push một lần

```bash
# Thêm tất cả, commit và push
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

### Nếu có nhiều commits chưa push

```bash
# Xem commits chưa push
git log origin/main..HEAD --oneline

# Push tất cả
git push origin main
```

---

## 🔐 Nếu cần đăng nhập

### Với GitHub CLI

```bash
# Đăng nhập
gh auth login

# Sau đó push
git push origin main
```

### Với Personal Access Token

```bash
# Push với token
git push https://<TOKEN>@github.com/Laucakeo/mia-vn-google-integration.git main
```

---

## 📝 Commit Message Best Practices

### Format chuẩn

```
<type>: <subject>

<body>
```

### Types

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Tài liệu
- `style`: Format code
- `refactor`: Refactor code
- `test`: Test
- `chore`: Maintenance

### Ví dụ

```bash
git commit -m "docs: Thêm hướng dẫn đăng nhập GitHub

- Thêm LOGIN_LAUCAKEO.md
- Thêm GITHUB_LOGIN_GUIDE.md
- Thêm QUICK_LOGIN.sh script"
```

---

## ⚠️ Lưu Ý

1. **KHÔNG commit file nhạy cảm:**
   - `.env`
   - `*.key`
   - `*.pem`
   - Credentials

2. **Kiểm tra .gitignore:**

   ```bash
   cat .gitignore
   ```

3. **Xem thay đổi trước khi commit:**

   ```bash
   git diff
   ```

---

## 🆘 Troubleshooting

### Lỗi: "nothing to commit"

- Không có thay đổi nào
- Hoặc đã commit hết

### Lỗi: "Permission denied"

- Cần đăng nhập GitHub
- Xem: `LOGIN_LAUCAKEO.md`

### Lỗi: "remote rejected"

- Có thể cần pull trước:

  ```bash
  git pull origin main
  git push origin main
  ```
