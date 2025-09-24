import React, { useState, useEffect } from 'react';
import './PWAInstall.css';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }

      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }

      if (document.referrer.startsWith('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] beforeinstallprompt fired');

      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();

      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);

      // Send analytics event
      if (window.gtag) {
        window.gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available');
      return;
    }

    console.log('[PWA] Showing install prompt');

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    console.log('[PWA] User choice:', choiceResult.outcome);

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');

      // Send analytics event
      if (window.gtag) {
        window.gtag('event', 'pwa_install_accepted', {
          event_category: 'engagement',
          event_label: 'PWA Installation Accepted'
        });
      }
    } else {
      console.log('[PWA] User dismissed the install prompt');

      // Send analytics event
      if (window.gtag) {
        window.gtag('event', 'pwa_install_dismissed', {
          event_category: 'engagement',
          event_label: 'PWA Installation Dismissed'
        });
      }
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);

    // Remember user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());

    // Send analytics event
    if (window.gtag) {
      window.gtag('event', 'pwa_install_banner_dismissed', {
        event_category: 'engagement',
        event_label: 'PWA Installation Banner Dismissed'
      });
    }
  };

  // Don't show if installed or recently dismissed
  if (isInstalled || !showInstallButton) {
    return null;
  }

  // Check if user recently dismissed the prompt
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) { // Don't show again for 7 days
      return null;
    }
  }

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <img src="/logo192.png" alt="MIA VN" />
        </div>

        <div className="pwa-install-text">
          <h3>Install MIA VN Google Integration</h3>
          <p>
            Get quick access to Google Drive, Sheets, and AI features.
            Works offline and loads instantly!
          </p>
        </div>

        <div className="pwa-install-actions">
          <button
            className="pwa-install-btn primary"
            onClick={handleInstallClick}
            aria-label="Install PWA"
          >
            Install App
          </button>

          <button
            className="pwa-install-btn secondary"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for PWA installation status
export const usePWAInstall = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check installation status
    const checkInstallStatus = () => {
      const installed =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.startsWith('android-app://');

      setIsInstalled(installed);
    };

    // Check if install prompt is available
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    checkInstallStatus();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isInstalled,
    canInstall,
    isPWA: isInstalled
  };
};

// Component to show PWA features for installed users
export const PWAStatus = () => {
  const { isInstalled, isPWA } = usePWAInstall();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isPWA) return null;

  return (
    <div className="pwa-status">
      <div className={`pwa-status-indicator ${isOnline ? 'online' : 'offline'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {isOnline ? 'Online' : 'Offline Mode'}
        </span>
      </div>

      {!isOnline && (
        <div className="offline-message">
          <p>You're offline. Some features may be limited.</p>
        </div>
      )}
    </div>
  );
};

export default PWAInstall;
