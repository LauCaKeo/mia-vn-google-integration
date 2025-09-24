import React, { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import "./App.css";
import Loading from "./components/Common/Loading";
import Layout from "./components/layout/Layout";
import { store } from "./store/store";
// import PerformanceMonitor from "./utils/PerformanceMonitor";

// Enhanced lazy loading with preloading strategy and performance optimization
const LiveDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: "dashboard", webpackPreload: true */ "./components/Dashboard/LiveDashboard"
    )
);
const AIDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: "ai-dashboard", webpackPrefetch: true */ "./components/ai/AIDashboard"
    )
);
const GoogleSheetsIntegration = lazy(
  () =>
    import(
      /* webpackChunkName: "google-sheets", webpackPrefetch: true */ "./components/google/GoogleSheetsIntegration"
    )
);
const GoogleDriveIntegration = lazy(
  () =>
    import(
      /* webpackChunkName: "google-drive", webpackPrefetch: true */ "./components/google/GoogleDriveIntegration"
    )
);
const GoogleAppsScriptIntegration = lazy(
  () =>
    import(
      /* webpackChunkName: "google-apps-script", webpackPrefetch: true */ "./components/google/GoogleAppsScriptIntegration"
    )
);
const TelegramIntegration = lazy(
  () =>
    import(
      /* webpackChunkName: "telegram", webpackPrefetch: true */ "./components/telegram/TelegramIntegration"
    )
);
const AutomationDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: "automation", webpackPrefetch: true */ "./components/automation/AutomationDashboard"
    )
);
const AutomationPanel = lazy(
  () =>
    import(
      /* webpackChunkName: "automation-panel", webpackPrefetch: true */ "./components/automation/AutomationPanelWrapper"
    )
);
const ConfigPage = lazy(
  () =>
    import(
      /* webpackChunkName: "config", webpackPrefetch: true */ "./components/automation/ConfigPageWrapper"
    )
);

// Intelligent preloading based on user behavior
const preloadComponent = (componentLoader, priority = "low") => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        componentLoader();
      },
      { timeout: priority === "high" ? 2000 : 5000 }
    );
  } else {
    setTimeout(
      () => {
        componentLoader();
      },
      priority === "high" ? 100 : 2000
    );
  }
};

// Progressive preloading strategy
if (typeof window !== "undefined") {
  // Immediate preload for critical routes
  preloadComponent(
    () => import("./components/Dashboard/LiveDashboard"),
    "high"
  );

  // Preload frequently used components after initial load
  setTimeout(() => {
    preloadComponent(() => import("./components/ai/AIDashboard"), "medium");
    preloadComponent(
      () => import("./components/google/GoogleSheetsIntegration"),
      "medium"
    );
  }, 3000);

  // Preload remaining components when browser is idle
  setTimeout(() => {
    preloadComponent(
      () => import("./components/google/GoogleDriveIntegration")
    );
    preloadComponent(
      () => import("./components/automation/AutomationDashboard")
    );
  }, 5000);
}

// Home component
const Home = () => (
  <div className="home-container">
    <div className="hero-section">
      <h1>🚀 MIA Logistics Integration v3.0</h1>
      <p>Hệ thống quản lý logistics thông minh với AI và Google Integration</p>
    </div>

    <div className="features-grid">
      <div className="feature-card primary">
        <h3>📊 Live Dashboard</h3>
        <p>
          Theo dõi thời gian thực, giám sát hiệu suất và phân tích hệ thống với
          WebSocket integration.
        </p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat">
            <span className="stat-value">2.3s</span>
            <span className="stat-label">Response Time</span>
          </div>
        </div>
      </div>

      <div className="feature-card secondary">
        <h3>🧠 AI Analytics</h3>
        <p>
          Phân tích thông minh, dự đoán xu hướng và khuyến nghị tối ưu hóa cho
          hệ thống logistics.
        </p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">92%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">15%</span>
            <span className="stat-label">Cost Reduction</span>
          </div>
        </div>
      </div>

      <div className="feature-card tertiary">
        <h3>📋 Google Sheets</h3>
        <p>
          Tích hợp Google Sheets để quản lý dữ liệu, báo cáo và tự động hóa quy
          trình làm việc.
        </p>
        <div className="feature-stats">
          <div className="stat">
            <span className="stat-value">1,250</span>
            <span className="stat-label">Records</span>
          </div>
          <div className="stat">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Sync</span>
          </div>
        </div>
      </div>
    </div>

    <div className="features-grid">
      <div className="feature-card">
        <h3>📈 Trạng thái hệ thống</h3>
        <div className="status-list">
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Frontend</span>
              <span className="status-desc">Tối ưu hóa & Triển khai</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Backend</span>
              <span className="status-desc">WebSocket Ready</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-icon">✅</span>
            <div className="status-content">
              <span className="status-title">Automation</span>
              <span className="status-desc">Hoạt động</span>
            </div>
          </div>
        </div>
        <div className="system-health">
          <span className="health-label">Tình trạng hệ thống:</span>
          <span className="health-status healthy">Khỏe mạnh</span>
        </div>
      </div>

      <div className="feature-card">
        <h3>🎯 Tính năng mới v3.0</h3>
        <div className="feature-tags">
          {[
            "📡 Tích hợp WebSocket thời gian thực",
            "📊 Dashboard hiệu suất trực tiếp",
            "⚡ Cải thiện hiệu suất 50%",
            "🎨 Thiết kế UI/UX hiện đại",
            "📱 Hỗ trợ di động responsive",
            "🔒 Tính năng bảo mật nâng cao",
          ].map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Main App component with Router và Performance Monitoring
function App() {
  // Initialize Performance Monitor (tạm thời disabled để test build)
  React.useEffect(() => {
    // const monitor = new PerformanceMonitor();
    // monitor.startMonitoring();

    // Cleanup khi component unmount
    return () => {
      // monitor.stopMonitoring();
    };
  }, []);

  return (
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#3b82f6",
            borderRadius: 8,
          },
        }}
      >
        <Router>
          <div className="App">
            <Layout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<LiveDashboard />} />
                  <Route path="/ai-analytics" element={<AIDashboard />} />
                  <Route
                    path="/google-sheets"
                    element={<GoogleSheetsIntegration />}
                  />
                  <Route
                    path="/google-drive"
                    element={<GoogleDriveIntegration />}
                  />
                  <Route
                    path="/google-apps-script"
                    element={<GoogleAppsScriptIntegration />}
                  />
                  <Route path="/telegram" element={<TelegramIntegration />} />
                  <Route path="/automation" element={<AutomationDashboard />} />
                  <Route
                    path="/automation/control"
                    element={<AutomationPanel />}
                  />
                  <Route path="/automation/config" element={<ConfigPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
