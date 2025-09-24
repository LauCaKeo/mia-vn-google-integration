import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializePerformanceMonitoring } from "./utils/performanceMonitoring";
import swManager from "./utils/serviceWorkerManager";
import { initializeRUM } from "./utils/rumMonitor";
import cdnManager from "./utils/cdnManager";
import AppConfig from "./config/environmentConfig";

// Initialize environment configuration
const config = AppConfig.getCurrentConfig();
console.log(`[App] Starting in ${config.environment} environment`);

// Validate environment
if (!AppConfig.validateEnvironment(config)) {
  console.error(
    "[App] Environment validation failed - check required variables"
  );
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize RUM monitoring with environment-specific config
const rum = initializeRUM({
  sampleRate: config.environment === "production" ? 0.1 : 1.0,
  debug: config.debug,
  customDimensions: {
    version: process.env.REACT_APP_VERSION || "1.0.0",
    environment: config.environment,
    buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString(),
    gitCommit: process.env.REACT_APP_GIT_COMMIT || "unknown",
  },
});

// PWA Service Worker Registration
const registerServiceWorker = () => {
  if ("serviceWorker" in navigator && config.enableServiceWorker) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log(
            "[PWA] Service Worker registered successfully:",
            registration.scope
          );

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                showUpdateNotification();
              }
            });
          });

          // Track successful registration
          if (rum) {
            rum.recordCustomMetric("pwa-sw-registered", 1, {
              scope: registration.scope,
              timestamp: Date.now(),
            });
          }
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);

          // Track registration failure
          if (rum) {
            rum.recordCustomMetric("pwa-sw-registration-failed", 1, {
              error: error.message,
              timestamp: Date.now(),
            });
          }
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[PWA] Message from Service Worker:", event.data);

        if (event.data.type === "BACKGROUND_SYNC_COMPLETE") {
          // Handle background sync completion
          console.log("[PWA] Background sync completed");
        }

        if (event.data.type === "NOTIFICATION_CLICKED") {
          // Handle notification clicks
          console.log("[PWA] Notification clicked:", event.data.action);
        }
      });
    });
  }
};

// Show PWA update notification
const showUpdateNotification = () => {
  const updateNotification = document.createElement("div");
  updateNotification.id = "pwa-update-notification";
  updateNotification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      animation: slideIn 0.4s ease-out;
      backdrop-filter: blur(10px);
    ">
      <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        🚀 App Updated!
      </div>
      <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
        New features and improvements are ready. Restart to apply updates.
      </div>
      <div style="display: flex; gap: 8px;">
        <button
          onclick="window.location.reload(); this.parentElement.parentElement.parentElement.remove();"
          style="
            background: white;
            color: #667eea;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          Restart App
        </button>
        <button
          onclick="this.parentElement.parentElement.parentElement.remove();"
          style="
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='rgba(255,255,255,0.2)'"
          onmouseout="this.style.background='rgba(255,255,255,0.1)'"
        >
          Later
        </button>
      </div>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%) scale(0.8); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(updateNotification);

  // Auto-remove after 15 seconds
  setTimeout(() => {
    const notification = document.getElementById("pwa-update-notification");
    if (notification) {
      notification.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => notification.remove(), 300);
    }
  }, 15000);

  // Track update notification shown
  if (rum) {
    rum.recordCustomMetric("pwa-update-notification-shown", 1, {
      timestamp: Date.now(),
    });
  }
};

// Register service worker
registerServiceWorker();

// Preload critical CDN assets
const criticalAssets = [
  { type: "font", name: "roboto" },
  { type: "style", name: "normalize" },
];

cdnManager
  .preloadCriticalAssets(criticalAssets)
  .then(() => {
    if (rum) {
      rum.recordCustomMetric("cdn-preload-success", 1, {
        assetsCount: criticalAssets.length,
        timestamp: Date.now(),
      });
    }
  })
  .catch((error) => {
    console.warn("CDN preload failed:", error);
    if (rum) {
      rum.recordCustomMetric("cdn-preload-failure", 1, {
        error: error.message,
        timestamp: Date.now(),
      });
    }
  });

// Track app initialization timing
if (rum) {
  rum.startTiming("app-initialization");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Complete app initialization timing
if (rum) {
  setTimeout(() => {
    rum.endTiming("app-initialization");
  }, 0);
}

// Enhanced Web Vitals reporting with environment-specific handling
reportWebVitals((metric) => {
  // Log to console in development
  if (config.debug) {
    console.log("📊 Web Vitals:", metric);
  }

  // Send to RUM if available
  if (rum) {
    rum.recordCustomMetric("web-vital", metric.value, {
      name: metric.name,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      environment: config.environment,
    });
  }

  // Send to analytics in production/staging
  if (config.enableAnalytics && window.gtag) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      non_interaction: true,
    });
  }

  // Performance budgets enforcement
  const budgets = {
    CLS: 0.1,
    FID: 100,
    FCP: 1800,
    LCP: 2500,
    TTFB: 800,
  };

  if (budgets[metric.name] && metric.value > budgets[metric.name]) {
    console.warn(
      `⚠️ Performance Budget Exceeded: ${metric.name} (${metric.value}) > ${budgets[metric.name]}`
    );

    if (rum) {
      rum.recordCustomMetric("performance-budget-exceeded", 1, {
        metric: metric.name,
        value: metric.value,
        budget: budgets[metric.name],
        timestamp: Date.now(),
      });
    }
  }
});

// Performance observer for additional metrics
if ("PerformanceObserver" in window) {
  try {
    // Long Tasks Observer
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`🐌 Long Task Detected: ${entry.duration}ms`);

          if (rum) {
            rum.recordCustomMetric("long-task", entry.duration, {
              name: entry.name,
              startTime: entry.startTime,
              timestamp: Date.now(),
            });
          }
        }
      }
    });

    longTaskObserver.observe({ entryTypes: ["longtask"] });

    // Layout Shift Observer
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          console.log(`📐 Layout Shift: ${entry.value}`);

          if (rum) {
            rum.recordCustomMetric("layout-shift", entry.value, {
              sources: entry.sources?.length || 0,
              timestamp: Date.now(),
            });
          }
        }
      }
    });

    layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
  } catch (error) {
    console.warn("[Performance] Observer initialization failed:", error);
  }
}

// PWA Install Detection
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("[PWA] Install prompt available");

  if (rum) {
    rum.recordCustomMetric("pwa-install-prompt-available", 1, {
      timestamp: Date.now(),
    });
  }
});

window.addEventListener("appinstalled", () => {
  console.log("[PWA] App installed successfully");

  if (rum) {
    rum.recordCustomMetric("pwa-app-installed", 1, {
      timestamp: Date.now(),
    });
  }

  // Track in analytics
  if (config.enableAnalytics && window.gtag) {
    window.gtag("event", "pwa_install", {
      event_category: "engagement",
      event_label: "PWA Installation Completed",
    });
  }
});

// Network status monitoring
window.addEventListener("online", () => {
  console.log("[PWA] Back online");

  if (rum) {
    rum.recordCustomMetric("network-online", 1, {
      timestamp: Date.now(),
    });
  }
});

window.addEventListener("offline", () => {
  console.log("[PWA] Gone offline");

  if (rum) {
    rum.recordCustomMetric("network-offline", 1, {
      timestamp: Date.now(),
    });
  }
});

// Log environment info
console.log("[App] Environment Info:", AppConfig.getEnvironmentInfo());
console.log("[App] Feature Flags:", AppConfig.getFeatureFlags());
