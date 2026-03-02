# 🏗️ KIẾN TRÚC DỰ ÁN - FRONTEND, BACKEND & AUTOMATION

## 📊 **TỔNG QUAN CẤU TRÚC**

Dự án **MIA Logistics Integration v3.0** gồm **3 phần chính**:

1. **Frontend** - React Application
2. **Backend** - Node.js/Express Server (theo documentation, nhưng chưa có code)
3. **Automation** - Python Automation System

---

## 1. 🎨 **FRONTEND (React Application)**

### **Vị trí:** `src/`

### **Công nghệ:**

- React 18.2.0
- Redux 5.0.1 (State Management)
- React Router 6.28.0 (Routing)
- Ant Design 5.27.4 (UI Components)
- Recharts 3.2.1 (Charts)
- Vite 6.3.6 (Build Tool)

### **Cấu trúc:**

```
src/
├── components/          # React Components
│   ├── ai/             # AI Analytics Dashboard
│   ├── automation/     # Automation Dashboard (UI)
│   ├── Common/         # Shared Components
│   ├── Dashboard/      # Live Dashboard
│   ├── google/         # Google Integrations
│   ├── layout/         # Layout & Navigation
│   └── telegram/       # Telegram Integration
│
├── services/           # API Services
│   ├── googleAuth.js   # Google Authentication
│   ├── googleSheets.js # Google Sheets API
│   └── googleDrive.js # Google Drive API
│
├── store/              # Redux Store
│   ├── store.js        # Store configuration
│   ├── actionTypes.js  # Action constants
│   └── reducers/       # 5 Reducers
│
├── hooks/              # Custom Hooks
│   ├── useGoogleSheets.js
│   └── useGoogleDrive.js
│
├── config/             # Configuration
│   └── googleConfig.js
│
└── utils/              # Utilities
    ├── dateUtils.js
    ├── fileUtils.js
    └── validators.js
```

### **Tính năng:**

- ✅ 7 modules chính với UI đầy đủ
- ✅ Redux state management
- ✅ Google APIs integration
- ✅ Responsive design
- ✅ Vietnamese language support

### **Port:** 3000 (Development)

---

## 2. ⚙️ **BACKEND (Node.js/Express)**

### **Trạng thái:** ⚠️ **CHƯA ĐƯỢC IMPLEMENT**

### **Theo Documentation:**

- Express Server (Port 3001 hoặc 8000)
- Email Service (Nodemailer)
- Task Scheduling (Node-cron)
- REST API Endpoints

### **Files liên quan:**

- ✅ `backend-package.json` - Dependencies cho backend
- ❌ `server.js` - **KHÔNG TỒN TẠI** (chưa được tạo)
- ✅ `docker-compose.yml` - Có config cho backend service

### **Dependencies (theo backend-package.json):**

```json
{
  "express": "^4.18.2",
  "nodemailer": "^6.9.4",
  "node-cron": "^3.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### **API Endpoints (theo documentation):**

- `/api/email` - Email sending
- `/api/alerts` - Alert management
- `/api/reports` - Report generation

### **Kết luận:**

- ⚠️ Backend được **documented** nhưng **chưa được implement**
- ⚠️ Có thể cần tạo `server.js` nếu muốn có backend server

---

## 3. 🤖 **AUTOMATION (Python System)**

### **Vị trí:** `src/components/automation/one_automation_system/`

### **Công nghệ:**

- Python 3
- Selenium WebDriver
- Web Scraping
- Data Processing

### **Cấu trúc:**

```
src/components/automation/one_automation_system/
├── automation.py              # Main automation script
├── data_analytics.py          # Data analytics
├── web_interface.py           # Web interface
├── enterprise_web_interface.py
├── advanced_web_interface.py
├── debug_tga_orders.py        # Debug tools
├── inspect_tga_website.py     # Website inspection
├── quick_test.py              # Quick tests
├── utils.py                   # Utilities
├── health_check.py            # Health monitoring
│
├── config/                    # Configuration
│   ├── config.json
│   └── production.json
│
├── docs/                      # Documentation
│   ├── guides/
│   ├── archive/
│   └── summaries/
│
├── backups/                   # Backups
├── reports/                   # Generated reports
│
├── Dockerfile                 # Docker build
├── docker-compose.yml         # Docker services
├── requirements.txt           # Python dependencies
├── setup.sh / setup.bat       # Setup scripts
└── deploy.sh                  # Deployment scripts
```

### **Tính năng:**

- ✅ Tự động đăng nhập vào hệ thống ONE (TGA)
- ✅ Web scraping và data extraction
- ✅ Thu thập dữ liệu đơn hàng
- ✅ Xử lý và chuẩn hóa dữ liệu
- ✅ Xuất báo cáo (CSV, Excel, JSON)
- ✅ Email notifications
- ✅ Lập lịch chạy tự động
- ✅ Dashboard monitoring
- ✅ Error handling và retry logic

### **Dependencies (requirements.txt):**

- Selenium
- WebDriver
- Python-dotenv
- Logging
- Data processing libraries

### **Deployment:**

- ✅ Docker support
- ✅ Standalone Python scripts
- ✅ Web interface (Flask/FastAPI có thể)

---

## 📊 **SO SÁNH 3 PHẦN**

| Phần | Ngôn ngữ | Trạng thái | Vị trí | Port |
|------|----------|------------|--------|------|
| **Frontend** | JavaScript/React | ✅ Hoàn chỉnh | `src/` | 3000 |
| **Backend** | Node.js/Express | ⚠️ Chưa có code | N/A | 3001/8000 |
| **Automation** | Python | ✅ Hoàn chỉnh | `src/components/automation/` | N/A |

---

## 🔄 **LUỒNG TƯƠNG TÁC**

### **Hiện tại (Thực tế):**

```
Frontend (React)
    ↓
Services (Google APIs)
    ↓
Google Services (Sheets, Drive)
```

### **Theo Documentation (Lý tưởng):**

```
Frontend (React) ←→ Backend (Express) ←→ External APIs
    ↓
Automation (Python) ←→ ONE System (TGA)
```

---

## 🎯 **KIẾN TRÚC HIỆN TẠI**

### **1. Frontend-First Architecture:**

- Frontend gọi trực tiếp Google APIs
- Không có backend server trung gian
- Services chạy trong browser

### **2. Standalone Automation:**

- Python automation chạy độc lập
- Không tích hợp trực tiếp với Frontend
- Có thể chạy qua Docker hoặc standalone

### **3. Docker Support:**

- `docker-compose.yml` có config cho:
  - Frontend service
  - Backend service (theo config)
  - Automation service
  - Monitoring service
  - Redis cache

---

## ⚠️ **VẤN ĐỀ PHÁT HIỆN**

### **1. Backend Server:**

- ❌ **Không có `server.js`** trong root
- ⚠️ Documentation đề cập nhưng code chưa có
- ✅ Có `backend-package.json` với dependencies
- ✅ Có config trong `docker-compose.yml`

### **2. Integration:**

- ⚠️ Frontend và Automation chạy **độc lập**
- ⚠️ Chưa có API để kết nối giữa chúng
- ⚠️ Automation có web interface riêng

---

## 📋 **KHUYẾN NGHỊ**

### **1. Nếu cần Backend Server:**

- Tạo `server.js` trong root
- Implement Express endpoints
- Kết nối với Frontend qua API
- Xử lý email, scheduling, alerts

### **2. Nếu không cần Backend:**

- Giữ nguyên Frontend-First architecture
- Services chạy trong browser
- Đơn giản hóa deployment

### **3. Tích hợp Automation:**

- Tạo API endpoints để Frontend gọi Automation
- Hoặc tích hợp Automation vào Backend
- Hoặc giữ độc lập như hiện tại

---

## 🎯 **TÓM TẮT**

### **✅ Có:**

1. **Frontend** - React app hoàn chỉnh
2. **Automation** - Python automation system hoàn chỉnh
3. **Services** - Google APIs integration
4. **Docker** - Containerization support

### **⚠️ Chưa có:**

1. **Backend Server** - Chỉ có documentation, chưa có code
2. **Integration** - Frontend và Automation chạy độc lập

### **📊 Cấu trúc thực tế:**

```
mia-vn-google-integration/
├── Frontend (React) ✅
│   └── src/
│
├── Backend (Node.js) ⚠️ Chưa có code
│   └── backend-package.json (chỉ có dependencies)
│
└── Automation (Python) ✅
    └── src/components/automation/one_automation_system/
```

---

**Ngày phân tích:** $(date)
**Phiên bản:** 3.0
