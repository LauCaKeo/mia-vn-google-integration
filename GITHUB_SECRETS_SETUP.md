# 🔐 Hướng dẫn Setup GitHub Secrets cho CI/CD

## 📋 Danh sách Secrets cần thiết

Để CI/CD pipeline hoạt động hoàn chỉnh, bạn cần setup các GitHub Secrets sau:

### 1. **Vercel Deployment Secrets**

#### `VERCEL_TOKEN`

- **Mô tả**: Token để deploy lên Vercel
- **Cách lấy**:
  1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
  2. Vào **Settings** → **Tokens**
  3. Tạo token mới với scope **Full Account**
  4. Copy token và lưu vào GitHub Secrets

#### `ORG_ID`

- **Mô tả**: Vercel Organization ID
- **Cách lấy**:
  1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
  2. Vào **Settings** → **General**
  3. Copy **Team ID** (đây chính là ORG_ID)

#### `PROJECT_ID`

- **Mô tả**: Vercel Project ID
- **Cách lấy**:
  1. Vào project trên Vercel Dashboard
  2. Vào **Settings** → **General**
  3. Copy **Project ID**

### 2. **Lighthouse CI Secrets**

#### `LHCI_GITHUB_APP_TOKEN`

- **Mô tả**: Token để upload Lighthouse CI results
- **Cách lấy**:
  1. Vào [Lighthouse CI](https://github.com/apps/lighthouse-ci)
  2. Install app vào repository
  3. Tạo token từ GitHub App settings
  4. Hoặc sử dụng `LHCI_GITHUB_APP_ID` và `LHCI_GITHUB_APP_INSTALLATION_ID`

#### `LHCI_GITHUB_APP_ID` (Optional)

- **Mô tả**: GitHub App ID cho Lighthouse CI
- **Cách lấy**: Từ GitHub App settings

#### `LHCI_GITHUB_APP_INSTALLATION_ID` (Optional)

- **Mô tả**: GitHub App Installation ID
- **Cách lấy**: Từ GitHub App settings

### 3. **Slack Notification Secrets**

#### `SLACK_WEBHOOK`

- **Mô tả**: Webhook URL để gửi thông báo deployment
- **Cách lấy**:
  1. Vào [Slack API](https://api.slack.com/apps)
  2. Tạo app mới hoặc chọn app hiện có
  3. Vào **Incoming Webhooks** → **Add New Webhook**
  4. Chọn channel để nhận thông báo
  5. Copy Webhook URL

## 🚀 Cách setup GitHub Secrets

### Bước 1: Vào Repository Settings

1. Vào repository trên GitHub
2. Click **Settings** tab
3. Vào **Secrets and variables** → **Actions**

### Bước 2: Thêm từng Secret

1. Click **New repository secret**
2. Nhập **Name** (tên secret)
3. Nhập **Secret** (giá trị secret)
4. Click **Add secret**

### Bước 3: Kiểm tra Secrets

Sau khi thêm tất cả secrets, danh sách sẽ như sau:

```
VERCEL_TOKEN: vc_xxxxxxxxxxxxxxxxxxxx
ORG_ID: team_xxxxxxxxxxxxxxxxxxxx
PROJECT_ID: prj_xxxxxxxxxxxxxxxxxxxx
SLACK_WEBHOOK: https://hooks.slack.com/services/...
LHCI_GITHUB_APP_TOKEN: ghp_xxxxxxxxxxxxxxxxxxxx
```

## 🔧 Cấu hình Environment Variables

### Staging Environment

- **Branch**: `develop`
- **Vercel Environment**: `preview`
- **URL**: `https://mia-vn-google-integration-git-develop.vercel.app`

### Production Environment

- **Branch**: `main`
- **Vercel Environment**: `production`
- **URL**: `https://mia-vn-google-integration.vercel.app`

## 🧪 Test CI/CD Pipeline

### 1. Test Quality & Security

```bash
npm run lint:check
npm run type-check
npm run security:audit
npm run format:check
```

### 2. Test Build & Performance

```bash
npm run build:prod
npm run analyze:size
npm run lighthouse
```

### 3. Test Deployment

- Push code lên branch `develop` để test staging
- Push code lên branch `main` để deploy production

## 🚨 Troubleshooting

### Lỗi thường gặp

#### 1. **Vercel Deployment Failed**

- Kiểm tra `VERCEL_TOKEN` có đúng không
- Kiểm tra `ORG_ID` và `PROJECT_ID` có đúng không
- Kiểm tra project có tồn tại trên Vercel không

#### 2. **Lighthouse CI Failed**

- Kiểm tra `LHCI_GITHUB_APP_TOKEN` có đúng không
- Kiểm tra app có được install vào repository không
- Kiểm tra build có thành công không trước khi chạy Lighthouse

#### 3. **Slack Notification Failed**

- Kiểm tra `SLACK_WEBHOOK` URL có đúng không
- Kiểm tra webhook có được enable không
- Kiểm tra channel có tồn tại không

## 📊 Monitoring & Alerts

### GitHub Actions Status

- Vào **Actions** tab để xem trạng thái các workflow
- Click vào từng job để xem chi tiết logs

### Vercel Dashboard

- Vào [Vercel Dashboard](https://vercel.com/dashboard) để xem deployment status
- Xem logs và performance metrics

### Slack Notifications

- Nhận thông báo real-time khi có deployment
- Thông báo khi có lỗi trong quá trình deploy

## 🔒 Security Best Practices

1. **Không commit secrets vào code**
2. **Sử dụng GitHub Secrets cho tất cả sensitive data**
3. **Rotate tokens định kỳ**
4. **Giới hạn quyền của tokens**
5. **Monitor usage của tokens**

## 📞 Support

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs trong GitHub Actions
2. Kiểm tra Vercel deployment logs
3. Kiểm tra Slack webhook configuration
4. Liên hệ team để được hỗ trợ
