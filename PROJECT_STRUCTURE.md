# 📁 CẤU TRÚC DỰ ÁN HIỆN TẠI

## 🎯 **TỔNG QUAN**

**MIA Logistics Integration v3.0** - Hệ thống tích hợp Google Services với React

---

## 📂 **CẤU TRÚC THƯ MỤC CHÍNH**

```
mia-vn-google-integration/
├── 📁 src/                          # Source code chính
├── 📁 public/                       # Static files
├── 📁 build/                        # Production build
├── 📁 doc/                          # Documentation
├── 📁 docs/                         # Additional docs
├── 📁 scripts/                      # Build & deployment scripts
├── 📁 node_modules/                # Dependencies
├── 📄 package.json                  # Dependencies & scripts
├── 📄 vite.config.js                # Vite configuration
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 vercel.json                   # Vercel deployment config
├── 📄 docker-compose.yml            # Docker services
├── 📄 Dockerfile                    # Docker build
├── 📄 nginx.conf                    # Nginx config
└── 📄 README.md                     # Main documentation
```

---

## 📁 **CHI TIẾT CẤU TRÚC**

### **1. 📂 src/ - Source Code**

```
src/
├── 📄 index.jsx                     # Entry point
├── 📄 App.jsx                       # Main App component
├── 📄 App.css                       # App styles
├── 📄 global.css                    # Global styles
├── 📄 index.css                     # Base styles
├── 📄 logo.svg                      # Logo
├── 📄 reportWebVitals.js            # Performance monitoring
├── 📄 setupTests.js                 # Test setup
│
├── 📁 components/                   # React Components
│   ├── 📁 ai/                       # AI Analytics
│   │   ├── AIDashboard.jsx
│   │   └── AIDashboard.css
│   │
│   ├── 📁 automation/               # Automation System
│   │   ├── AutomationDashboard.jsx
│   │   ├── AutomationDashboard.css
│   │   └── 📁 one_automation_system/ # Python automation
│   │       ├── automation.py
│   │       ├── data_analytics.py
│   │       ├── web_interface.py
│   │       ├── config/
│   │       ├── docs/
│   │       ├── backups/
│   │       └── reports/
│   │
│   ├── 📁 Common/                   # Shared Components
│   │   ├── Loading.jsx
│   │   ├── Loading.css
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.js
│   │   └── Notification.js
│   │
│   ├── 📁 Dashboard/                # Dashboard Components
│   │   ├── LiveDashboard.jsx
│   │   ├── LiveDashboard.css
│   │   ├── DemoDashboard.js
│   │   └── TestDashboard.js
│   │
│   ├── 📁 google/                   # Google Integration
│   │   ├── GoogleSheetsIntegration.jsx
│   │   ├── GoogleSheetsIntegration.css
│   │   ├── GoogleDriveIntegration.jsx
│   │   ├── GoogleDriveIntegration.css
│   │   ├── GoogleAppsScriptIntegration.jsx
│   │   └── GoogleAppsScriptIntegration.css
│   │
│   ├── 📁 GoogleDrive/              # Legacy Drive Components
│   │   ├── DriveManager.js
│   │   ├── DriveTester.js
│   │   ├── DriveUploader.js
│   │   └── FileViewer.js
│   │
│   ├── 📁 GoogleSheet/              # Legacy Sheet Components
│   │   ├── SheetManager.js
│   │   ├── SheetReader.js
│   │   ├── SheetTester.js
│   │   └── SheetWriter.js
│   │
│   ├── 📁 layout/                    # Layout Components
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   ├── HamburgerMenu.jsx
│   │   ├── NavItem.jsx
│   │   ├── NavSection.jsx
│   │   ├── ActionButton.jsx
│   │   ├── ConnectionItem.jsx
│   │   ├── ConnectionSection.jsx
│   │   ├── layoutData.js
│   │   └── navigationData.js
│   │
│   └── 📁 telegram/                  # Telegram Integration
│       ├── TelegramIntegration.jsx
│       └── TelegramIntegration.css
│
├── 📁 services/                      # API Services
│   ├── googleAuth.js                 # Google Authentication
│   ├── googleSheets.js               # Google Sheets API
│   └── googleDrive.js                # Google Drive API
│
├── 📁 hooks/                         # Custom React Hooks
│   ├── useGoogleSheets.js
│   └── useGoogleDrive.js
│
├── 📁 store/                         # Redux Store
│   ├── store.js                      # Store configuration
│   ├── actionTypes.js                # Action type constants
│   └── 📁 reducers/                  # Redux Reducers
│       ├── authReducer.js
│       ├── sheetsReducer.js
│       ├── driveReducer.js
│       ├── dashboardReducer.js
│       └── alertsReducer.js
│
├── 📁 config/                        # Configuration
│   ├── googleConfig.js               # Google API config
│   └── README.md
│
├── 📁 constants/                     # Constants
│   └── apiConstants.js
│
└── 📁 utils/                         # Utility Functions
    ├── dateUtils.js
    ├── fileUtils.js
    ├── performanceMonitoring.js
    └── validators.js
```

---

### **2. 📂 public/ - Static Files**

```
public/
├── index.html                        # HTML template
├── favicon.ico                       # Favicon
├── logo192.png                       # Logo 192x192
├── logo512.png                       # Logo 512x512
├── manifest.json                     # PWA manifest
├── robots.txt                        # SEO robots
└── sw.js                             # Service Worker
```

---

### **3. 📂 doc/ - Documentation**

```
doc/
├── 📁 architecture/                  # System Architecture
│   └── SYSTEM_ARCHITECTURE.md
│
├── 📁 deployment/                     # Deployment Guides
│   └── DEPLOYMENT_GUIDE.md
│
├── 📁 user-guide/                     # User Guides
│   ├── 01-Google-Service-Account-Setup.md
│   ├── 02-Dependencies-Environment-Setup.md
│   ├── 03-Sample-Code-Testing.md
│   ├── 04-Development-Roadmap.md
│   └── 05-API-Reference-Best-Practices.md
│
├── INDEX.md
├── README.md
├── QUICK_SETUP.md
├── PROJECT_SUMMARY.md
└── FILE_LIST.md
```

---

### **4. 📂 scripts/ - Build & Deployment Scripts**

```
scripts/
├── setup.js                          # Project setup
├── deploy.js                         # Deployment script
├── health-check.js                   # Health check
├── testGoogleConnection.js            # Test Google APIs
├── build-optimize.js                 # Build optimization
├── create-env-from-json.js           # Environment setup
├── setup-github.sh                   # GitHub setup
├── upgrade-phase1.sh                 # Upgrade script
└── upgrade-phase1.ps1                # PowerShell upgrade
```

---

### **5. 📂 Root Files**

#### **Configuration Files:**

- `package.json` - Dependencies & npm scripts
- `vite.config.js` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `vercel.json` - Vercel deployment config
- `docker-compose.yml` - Docker services
- `Dockerfile` - Docker build
- `nginx.conf` - Nginx configuration
- `craco.config.js` - CRACO config (legacy)

#### **Environment Files:**

- `env.example` - Environment template
- `env.production` - Production environment

#### **Documentation Files:**

- `README.md` - Main documentation
- `PROJECT_FEATURES.md` - Features list
- `FLOW_ANALYSIS.md` - Flow analysis
- `PROJECT_STRUCTURE.md` - This file
- `DEPLOYMENT_GUIDE.md` - Deployment guide
- `SETUP_GUIDE.md` - Setup guide
- `UPGRADE_ROADMAP.md` - Upgrade roadmap
- `BUG_FIXES_SUMMARY.md` - Bug fixes
- `FEATURES_UPDATE_SUMMARY.md` - Features update
- `PHASE1_COMPLETION_REPORT.md` - Phase 1 report
- `CIRCULAR_DEPENDENCY_FIX.md` - Dependency fix
- `GITHUB_SETUP.md` - GitHub setup guide
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel guide

#### **Deployment Scripts:**

- `deploy-production.sh` - Production deployment
- `deploy-vercel.sh` - Vercel deployment
- `deploy-github-vercel.sh` - GitHub + Vercel
- `push-to-github.sh` - Push to GitHub
- `create-repo-and-push.sh` - Create repo script

---

## 🏗️ **KIẾN TRÚC COMPONENTS**

### **Component Hierarchy:**

```
App.jsx
├── Layout
│   ├── Sidebar Navigation
│   └── Main Content
│       ├── Home (/)
│       ├── LiveDashboard (/dashboard)
│       ├── AIDashboard (/ai-analytics)
│       ├── GoogleSheetsIntegration (/google-sheets)
│       ├── GoogleDriveIntegration (/google-drive)
│       ├── GoogleAppsScriptIntegration (/google-apps-script)
│       ├── TelegramIntegration (/telegram)
│       └── AutomationDashboard (/automation)
│
└── Common Components
    ├── Loading
    ├── ErrorBoundary
    └── Notification
```

---

## 🔧 **TECHNOLOGY STACK**

### **Frontend:**

- **React 18.2.0** - UI Framework
- **Vite 6.3.6** - Build tool
- **Redux 5.0.1** - State management
- **Redux Persist 6.0.0** - State persistence
- **Redux Thunk 3.1.0** - Async actions
- **React Router 6.28.0** - Routing
- **Ant Design 5.27.4** - UI components
- **Recharts 3.2.1** - Charts
- **Axios 1.12.2** - HTTP client

### **Google APIs:**

- **googleapis 160.0.0** - Google APIs client
- **google-auth-library 10.3.0** - Authentication

### **Backend (Optional):**

- **Express 5.1.0** - Web framework
- **Nodemailer 7.0.6** - Email service
- **Node-cron 4.2.1** - Task scheduling

### **Development:**

- **TypeScript 5.9.2** - Type checking
- **ESLint 9.36.0** - Linting
- **Prettier 3.6.2** - Code formatting
- **Vitest 1.6.1** - Testing
- **Vite Bundle Analyzer** - Bundle analysis

### **Automation:**

- **Python** - Automation scripts
- **Selenium** - Web automation

---

## 📊 **REDUX STORE STRUCTURE**

```
store/
├── store.js                          # Store config
├── actionTypes.js                    # Action constants
└── reducers/
    ├── authReducer.js                # Authentication state
    ├── sheetsReducer.js              # Google Sheets state
    ├── driveReducer.js               # Google Drive state
    ├── dashboardReducer.js           # Dashboard state
    └── alertsReducer.js             # Alerts state
```

**State Shape:**

```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: object,
    loading: boolean,
    error: string,
    serviceAccount: {
      email: string,
      projectId: string,
      isConfigured: boolean
    }
  },
  sheets: {
    sheets: array,
    currentSheet: object,
    sheetData: array,
    loading: boolean,
    error: string,
    lastUpdated: string
  },
  drive: {
    files: array,
    folders: array,
    currentFolder: object,
    loading: boolean,
    error: string,
    uploadProgress: number,
    lastUpdated: string
  },
  dashboard: {
    activeTab: string,
    data: object,
    loading: boolean,
    error: string,
    lastUpdated: string
  },
  alerts: {
    alerts: array,
    notifications: array,
    unreadCount: number
  }
}
```

---

## 🔄 **DATA FLOW**

### **Current Flow:**

```
Component → useSelector → Redux State → Display
```

### **Ideal Flow (Cần implement):**

```
User Action → dispatch Thunk → Service/API →
dispatch Action → Reducer → State Update → Component Re-render
```

---

## 📦 **BUILD OUTPUT**

```
build/
├── assets/                           # Compiled assets
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── index.html
├── favicon.ico
├── manifest.json
├── robots.txt
└── sw.js
```

---

## 🚀 **DEPLOYMENT STRUCTURE**

### **Docker:**

- `Dockerfile` - Container build
- `docker-compose.yml` - Multi-container setup
- `nginx.conf` - Web server config

### **Vercel:**

- `vercel.json` - Deployment config
- Environment variables in Vercel dashboard

### **GitHub:**

- `.github/workflows/` - CI/CD workflows
- GitHub Actions for automation

---

## 📝 **FILE COUNT SUMMARY**

### **Components:**

- **React Components:** ~30 files (.jsx)
- **CSS Files:** ~15 files (.css)
- **Legacy Components:** ~8 files (.js)

### **Services & Hooks:**

- **Services:** 3 files
- **Hooks:** 2 files

### **Redux:**

- **Store:** 1 file
- **Reducers:** 5 files
- **Action Types:** 1 file

### **Utils & Config:**

- **Utils:** 4 files
- **Config:** 1 file
- **Constants:** 1 file

### **Documentation:**

- **Markdown Files:** ~40+ files
- **Guides:** 10+ files

### **Scripts:**

- **JavaScript:** 5+ files
- **Shell Scripts:** 5+ files

---

## 🎯 **KEY DIRECTORIES**

### **📁 src/components/**

Chứa tất cả React components, được tổ chức theo feature:

- `ai/` - AI Analytics
- `automation/` - Automation system
- `Common/` - Shared components
- `Dashboard/` - Dashboard components
- `google/` - Google integrations
- `layout/` - Layout components
- `telegram/` - Telegram integration

### **📁 src/services/**

Chứa các service classes để tương tác với APIs:

- `googleAuth.js` - Authentication
- `googleSheets.js` - Sheets operations
- `googleDrive.js` - Drive operations

### **📁 src/store/**

Redux store configuration và reducers:

- `store.js` - Store setup
- `actionTypes.js` - Action constants
- `reducers/` - State reducers

### **📁 src/hooks/**

Custom React hooks:

- `useGoogleSheets.js` - Sheets operations hook
- `useGoogleDrive.js` - Drive operations hook

### **📁 src/utils/**

Utility functions:

- `dateUtils.js` - Date formatting
- `fileUtils.js` - File operations
- `performanceMonitoring.js` - Performance tracking
- `validators.js` - Data validation

---

## 🔍 **NOTABLE FILES**

### **Entry Points:**

- `src/index.jsx` - Application entry
- `src/App.jsx` - Main App component
- `public/index.html` - HTML template

### **Configuration:**

- `package.json` - Dependencies & scripts
- `vite.config.js` - Build configuration
- `vercel.json` - Deployment config

### **Documentation:**

- `README.md` - Main documentation
- `PROJECT_FEATURES.md` - Features list
- `FLOW_ANALYSIS.md` - Flow analysis

---

## 📈 **PROJECT STATISTICS**

- **Total Components:** ~30 React components
- **Total Services:** 3 API services
- **Total Reducers:** 5 Redux reducers
- **Total Routes:** 8 routes
- **Total Documentation:** 40+ markdown files
- **Build Tool:** Vite 6.3.6
- **Package Manager:** npm
- **Node Version:** >=16.0.0

---

**Ngày cập nhật:** $(date)
**Phiên bản:** 3.0
