import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializePerformanceMonitoring } from "./utils/performanceMonitoring";
import swManager from "./utils/serviceWorkerManager";

// Initialize performance monitoring
initializePerformanceMonitoring();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker Update Notification
swManager.onUpdateAvailable((isUpdateAvailable) => {
  if (isUpdateAvailable) {
    const updateNotification = document.createElement("div");
    updateNotification.id = "sw-update-notification";
    updateNotification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 320px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">
          🚀 Update Available!
        </div>
        <div style="font-size: 14px; margin-bottom: 12px;">
          A new version of the app is ready to install.
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            onclick="swManager.applyUpdate(); this.parentElement.parentElement.parentElement.remove();"
            style="
              background: white;
              color: #4CAF50;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: 600;
              cursor: pointer;
              font-size: 12px;
            "
          >
            Update Now
          </button>
          <button
            onclick="this.parentElement.parentElement.parentElement.remove();"
            style="
              background: transparent;
              color: white;
              border: 1px solid white;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            "
          >
            Later
          </button>
        </div>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(updateNotification);

    // Auto-remove after 10 seconds if not acted upon
    setTimeout(() => {
      const notification = document.getElementById("sw-update-notification");
      if (notification) {
        notification.remove();
      }
    }, 10000);
  }
});

// Enhanced Web Vitals reporting with performance monitoring
reportWebVitals((metric) => {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("📊 Web Vitals:", metric);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // You can send to Google Analytics, DataDog, or your analytics service
    // Example: gtag('event', metric.name, { value: metric.value });
  }
});
