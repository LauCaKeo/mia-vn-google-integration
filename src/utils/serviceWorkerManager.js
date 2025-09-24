/**
 * Service Worker Registration and Management Utility
 * Handles registration, updates, and communication with service worker
 */

class ServiceWorkerManager {
  constructor() {
    this.swRegistration = null;
    this.isUpdateAvailable = false;
    this.updateCallbacks = [];
  }

  /**
   * Initialize and register service worker
   * @returns {Promise<boolean>} - Registration success
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Manager] Service Worker not supported');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      console.log('[SW Manager] Service Worker registered successfully');

      // Set up update detection
      this.setupUpdateDetection();

      // Set up message listener
      this.setupMessageListener();

      // Set up background sync
      this.setupBackgroundSync();

      return true;
    } catch (error) {
      console.error('[SW Manager] Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Set up service worker update detection
   */
  setupUpdateDetection() {
    if (!this.swRegistration) return;

    // Check for updates
    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration.installing;

      if (newWorker) {
        console.log('[SW Manager] New service worker installing');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW Manager] New service worker installed, update available');
            this.isUpdateAvailable = true;
            this.notifyUpdateCallbacks();
          }
        });
      }
    });

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Manager] New service worker took control, reloading page');
      window.location.reload();
    });

    // Check for updates periodically
    setInterval(() => {
      if (this.swRegistration) {
        this.swRegistration.update();
      }
    }, 60000); // Check every minute
  }

  /**
   * Set up message listener for service worker communication
   */
  setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, ...data } = event.data;

      switch (type) {
        case 'CACHE_SIZE':
          console.log('[SW Manager] Cache size:', this.formatBytes(data.size));
          break;

        case 'CACHE_UPDATED':
          console.log('[SW Manager] Cache updated for:', data.url);
          break;

        case 'OFFLINE_STATUS':
          this.handleOfflineStatus(data.offline);
          break;
      }
    });
  }

  /**
   * Set up background sync registration
   */
  async setupBackgroundSync() {
    if (!this.swRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('[SW Manager] Background sync not supported');
      return;
    }

    try {
      await this.swRegistration.sync.register('background-sync');
      console.log('[SW Manager] Background sync registered');
    } catch (error) {
      console.error('[SW Manager] Background sync registration failed:', error);
    }
  }

  /**
   * Apply pending service worker update
   */
  applyUpdate() {
    if (!this.swRegistration || !this.isUpdateAvailable) {
      return;
    }

    const waitingWorker = this.swRegistration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      this.isUpdateAvailable = false;
    }
  }

  /**
   * Register callback for update notifications
   * @param {Function} callback - Callback function
   */
  onUpdateAvailable(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * Notify all update callbacks
   */
  notifyUpdateCallbacks() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.isUpdateAvailable);
      } catch (error) {
        console.error('[SW Manager] Update callback error:', error);
      }
    });
  }

  /**
   * Cache specific URLs
   * @param {Array<string>} urls - URLs to cache
   */
  async cacheUrls(urls) {
    if (!navigator.serviceWorker.controller) {
      console.warn('[SW Manager] No active service worker');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      payload: { urls }
    });
  }

  /**
   * Clear cache
   * @param {string} cacheName - Optional cache name to clear
   */
  async clearCache(cacheName = null) {
    if (!navigator.serviceWorker.controller) {
      console.warn('[SW Manager] No active service worker');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
      payload: { cacheName }
    });
  }

  /**
   * Get cache size
   * @returns {Promise<number>} - Cache size in bytes
   */
  async getCacheSize() {
    if (!navigator.serviceWorker.controller) {
      console.warn('[SW Manager] No active service worker');
      return 0;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        const { type, size } = event.data;
        if (type === 'CACHE_SIZE') {
          resolve(size || 0);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => resolve(0), 5000);
    });
  }

  /**
   * Handle offline status changes
   * @param {boolean} isOffline - Offline status
   */
  handleOfflineStatus(isOffline) {
    if (isOffline) {
      this.showOfflineNotification();
    } else {
      this.hideOfflineNotification();
    }
  }

  /**
   * Show offline notification
   */
  showOfflineNotification() {
    // Remove existing notification
    this.hideOfflineNotification();

    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.className = 'offline-notification';
    notification.innerHTML = `
      <div class="offline-notification-content">
        <span class="offline-icon">⚠️</span>
        <span class="offline-message">You're offline. Some features may be limited.</span>
        <button class="offline-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    notification.innerHTML += `
      <style>
        .offline-notification {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          padding: 12px;
          text-align: center;
          z-index: 10000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        .offline-notification-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .offline-icon {
          font-size: 16px;
        }

        .offline-message {
          font-size: 14px;
          font-weight: 500;
        }

        .offline-dismiss {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: auto;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .offline-dismiss:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (prefers-color-scheme: dark) {
          .offline-notification {
            background: #d97706;
          }
        }
      </style>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideOfflineNotification();
    }, 10000);
  }

  /**
   * Hide offline notification
   */
  hideOfflineNotification() {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      notification.remove();
    }
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} - Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get service worker registration status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.swRegistration,
      updateAvailable: this.isUpdateAvailable,
      controller: !!navigator.serviceWorker.controller
    };
  }

  /**
   * Unregister service worker (for development/testing)
   */
  async unregister() {
    if (!this.swRegistration) return;

    try {
      const result = await this.swRegistration.unregister();
      console.log('[SW Manager] Service worker unregistered:', result);
      this.swRegistration = null;
      return result;
    } catch (error) {
      console.error('[SW Manager] Service worker unregistration failed:', error);
      return false;
    }
  }
}

// Create global instance
const swManager = new ServiceWorkerManager();

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    swManager.init();
  });
} else {
  swManager.init();
}

// Export for use in other modules
export default swManager;
