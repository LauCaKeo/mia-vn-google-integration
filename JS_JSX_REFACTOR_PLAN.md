# 🔄 KẾ HOẠCH ĐỒNG NHẤT FILE .JS VÀ .JSX

## 📊 **PHÂN TÍCH HIỆN TRẠNG**

### **File .jsx (16 files) - ✅ Đúng chuẩn**

- Tất cả React components chính đều dùng .jsx
- Components trong `google/`, `ai/`, `automation/`, `layout/`, `telegram/`, `Dashboard/`

### **File .js (15 files) - ⚠️ Cần xử lý**

#### **1. React Components (Nên đổi sang .jsx):**

- ✅ `Common/ErrorBoundary.js` - **TRÙNG LẶP** với `ErrorBoundary.jsx`
- ✅ `Common/LoadingSpinner.js` - React component
- ✅ `Common/Notification.js` - React component
- ✅ `Dashboard/DemoDashboard.js` - React component
- ✅ `Dashboard/TestDashboard.js` - React component
- ✅ `GoogleDrive/DriveManager.js` - React component
- ✅ `GoogleDrive/DriveTester.js` - React component
- ✅ `GoogleDrive/DriveUploader.js` - React component
- ✅ `GoogleDrive/FileViewer.js` - React component
- ✅ `GoogleSheet/SheetManager.js` - React component
- ✅ `GoogleSheet/SheetReader.js` - React component
- ✅ `GoogleSheet/SheetTester.js` - React component
- ✅ `GoogleSheet/SheetWriter.js` - React component

#### **2. Data/Config Files (Giữ .js - OK):**

- ✅ `layout/navigationData.js` - Data file, không phải component
- ✅ `layout/layoutData.js` - Data file, không phải component

---

## 🎯 **KẾ HOẠCH XỬ LÝ**

### **Bước 1: Xóa file trùng lặp**

- ❌ Xóa `Common/ErrorBoundary.js` (giữ `ErrorBoundary.jsx` - version mới hơn với Ant Design)

### **Bước 2: Đổi tên React Components từ .js → .jsx**

- Đổi tên 13 React components từ .js sang .jsx
- Cập nhật tất cả imports trong các file khác

### **Bước 3: Giữ nguyên Data/Config files**

- Giữ `navigationData.js` và `layoutData.js` (không phải components)

---

## 📋 **DANH SÁCH FILE CẦN XỬ LÝ**

### **1. Xóa (Trùng lặp):**

```
❌ src/components/Common/ErrorBoundary.js
```

### **2. Đổi tên (.js → .jsx):**

```
✅ src/components/Common/LoadingSpinner.js → LoadingSpinner.jsx
✅ src/components/Common/Notification.js → Notification.jsx
✅ src/components/Dashboard/DemoDashboard.js → DemoDashboard.jsx
✅ src/components/Dashboard/TestDashboard.js → TestDashboard.jsx
✅ src/components/GoogleDrive/DriveManager.js → DriveManager.jsx
✅ src/components/GoogleDrive/DriveTester.js → DriveTester.jsx
✅ src/components/GoogleDrive/DriveUploader.js → DriveUploader.jsx
✅ src/components/GoogleDrive/FileViewer.js → FileViewer.jsx
✅ src/components/GoogleSheet/SheetManager.js → SheetManager.jsx
✅ src/components/GoogleSheet/SheetReader.js → SheetReader.jsx
✅ src/components/GoogleSheet/SheetTester.js → SheetTester.jsx
✅ src/components/GoogleSheet/SheetWriter.js → SheetWriter.jsx
```

### **3. Giữ nguyên (Data files):**

```
✅ src/components/layout/navigationData.js
✅ src/components/layout/layoutData.js
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **1. Legacy Components:**

- `GoogleDrive/` và `GoogleSheet/` có vẻ là legacy/test components
- Có thể không được sử dụng trong app chính
- Nên kiểm tra xem có được import ở đâu không

### **2. Imports cần cập nhật:**

- Tất cả imports của các file này cần được cập nhật
- Kiểm tra trong `App.jsx`, `Layout.jsx`, và các components khác

### **3. Backup:**

- Nên tạo backup trước khi đổi tên
- Hoặc commit code hiện tại trước khi refactor

---

## 🔍 **KIỂM TRA IMPORTS**

Cần kiểm tra các file sau có import các components .js không:

- `src/App.jsx`
- `src/components/layout/Layout.jsx`
- `src/components/Dashboard/LiveDashboard.jsx`
- Các components khác

---

## ✅ **KẾT QUẢ SAU KHI XỬ LÝ**

### **Trước:**

- 16 files .jsx (React components)
- 15 files .js (13 React components + 2 data files)
- 1 file trùng lặp

### **Sau:**

- 29 files .jsx (Tất cả React components)
- 2 files .js (Chỉ data/config files)
- 0 file trùng lặp

---

## 🚀 **THỰC HIỆN**

Bạn có muốn tôi thực hiện refactor này không?

**Các bước sẽ thực hiện:**

1. ✅ Xóa `ErrorBoundary.js` (trùng lặp)
2. ✅ Đổi tên 13 React components từ .js → .jsx
3. ✅ Cập nhật tất cả imports
4. ✅ Kiểm tra không có lỗi

**Lưu ý:** Cần commit code hiện tại trước khi thực hiện để có thể rollback nếu cần.
