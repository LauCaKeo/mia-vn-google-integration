/**
 * Real User Monitoring (RUM) System - Phase 3C Advanced Optimization
 * Comprehensive performance monitoring and analytics
 */

class RUMMonitor {
  constructor(options = {}) {
    this.config = {
      // API endpoint for metrics
      endpoint: options.endpoint || '/api/rum/metrics',

      // Batch size for sending metrics
      batchSize: options.batchSize || 10,

      // Flush interval (milliseconds)
      flushInterval: options.flushInterval || 30000,

      // Sample rate (0-1)
      sampleRate: options.sampleRate || 1.0,

      // Enable different metric types
      enableWebVitals: options.enableWebVitals !== false,
      enableUserTiming: options.enableUserTiming !== false,
      enableResourceTiming: options.enableResourceTiming !== false,
      enableNavigationTiming: options.enableNavigationTiming !== false,
      enableErrorTracking: options.enableErrorTracking !== false,
      enableUserInteractions: options.enableUserInteractions !== false,

      // Custom dimensions
      customDimensions: options.customDimensions || {},

      // Debug mode
      debug: options.debug || false,

      ...options
    };

    // Metric buffer
    this.metrics = [];

    // Session info
    this.sessionId = this._generateSessionId();
    this.startTime = Date.now();

    // User info
    this.userId = options.userId || this._generateUserId();

    // Page info
    this.pageInfo = this._getPageInfo();

    // Performance observer
    this.observers = new Map();

    // Initialize monitoring
    this._initialize();
  }

  _initialize() {
    // Should we sample this session?
    if (Math.random() > this.config.sampleRate) {
      console.log('📊 RUM: Session not sampled');
      return;
    }

    console.log('📊 RUM: Initializing monitoring', this.sessionId);

    // Initialize Web Vitals monitoring
    if (this.config.enableWebVitals) {
      this._initWebVitals();
    }

    // Initialize Performance Observer
    if (this.config.enableUserTiming ||
        this.config.enableResourceTiming ||
        this.config.enableNavigationTiming) {
      this._initPerformanceObserver();
    }

    // Initialize error tracking
    if (this.config.enableErrorTracking) {
      this._initErrorTracking();
    }

    // Initialize user interaction tracking
    if (this.config.enableUserInteractions) {
      this._initUserInteractionTracking();
    }

    // Setup periodic flush
    this._setupPeriodicFlush();

    // Setup page lifecycle events
    this._setupPageLifecycle();

    // Setup unload handler
    this._setupUnloadHandler();
  }

  _initWebVitals() {
    // Dynamic import of web-vitals library
    const initWebVitals = async () => {
      try {
        // Check if web-vitals is available
        if (typeof window !== 'undefined' && window.webVitals) {
          const { getCLS, getFID, getFCP, getLCP, getTTFB } = window.webVitals;

          getCLS(this._onWebVital.bind(this));
          getFID(this._onWebVital.bind(this));
          getFCP(this._onWebVital.bind(this));
          getLCP(this._onWebVital.bind(this));
          getTTFB(this._onWebVital.bind(this));
        } else {
          // Fallback to manual Web Vitals collection
          this._collectWebVitalsManually();
        }
      } catch (error) {
        console.warn('📊 RUM: Failed to initialize Web Vitals:', error);
        this._collectWebVitalsManually();
      }
    };

    initWebVitals();
  }

  _collectWebVitalsManually() {
    // Manual CLS collection
    let cumulativeLayoutShift = 0;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });

      // Send CLS after page is loaded
      setTimeout(() => {
        this._recordMetric('CLS', cumulativeLayoutShift);
        observer.disconnect();
      }, 5000);
    } catch (error) {
      console.warn('📊 RUM: CLS observation failed:', error);
    }

    // Manual LCP collection
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this._recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('📊 RUM: LCP observation failed:', error);
    }

    // Manual FCP collection
    const fcpObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this._recordMetric('FCP', entry.startTime);
        }
      }
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('📊 RUM: FCP observation failed:', error);
    }
  }

  _onWebVital(metric) {
    this._recordMetric(metric.name, metric.value, {
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      entries: metric.entries?.length || 0
    });
  }

  _initPerformanceObserver() {
    const entryTypes = [];

    if (this.config.enableUserTiming) {
      entryTypes.push('measure', 'mark');
    }

    if (this.config.enableResourceTiming) {
      entryTypes.push('resource');
    }

    if (this.config.enableNavigationTiming) {
      entryTypes.push('navigation');
    }

    if (entryTypes.length === 0) return;

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        this._handlePerformanceEntry(entry);
      }
    });

    try {
      observer.observe({ entryTypes });
      this.observers.set('performance', observer);
    } catch (error) {
      console.warn('📊 RUM: Performance Observer failed:', error);
    }
  }

  _handlePerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'measure':
      case 'mark':
        this._recordMetric('user-timing', entry.duration || 0, {
          name: entry.name,
          type: entry.entryType,
          startTime: entry.startTime
        });
        break;

      case 'resource':
        // Only track significant resources
        if (entry.transferSize > 1000) {
          this._recordMetric('resource-timing', entry.duration, {
            name: entry.name,
            type: this._getResourceType(entry.name),
            size: entry.transferSize,
            cached: entry.transferSize === 0
          });
        }
        break;

      case 'navigation':
        this._recordNavigation(entry);
        break;
    }
  }

  _recordNavigation(entry) {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connect': entry.connectEnd - entry.connectStart,
      'tls-handshake': entry.secureConnectionStart > 0 ?
        entry.connectEnd - entry.secureConnectionStart : 0,
      'request': entry.responseStart - entry.requestStart,
      'response': entry.responseEnd - entry.responseStart,
      'dom-processing': entry.domComplete - entry.responseEnd,
      'load-complete': entry.loadEventEnd - entry.loadEventStart
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this._recordMetric('navigation-timing', value, { phase: name });
      }
    });
  }

  _getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  _initErrorTracking() {
    // Global error handler
    window.addEventListener('error', event => {
      this._recordError('javascript', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this._recordError('promise', {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });

    // React error boundary integration
    if (window.reportReactError) {
      window.reportReactError = (error, errorInfo) => {
        this._recordError('react', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      };
    }
  }

  _initUserInteractionTracking() {
    // Track clicks
    document.addEventListener('click', this._trackInteraction.bind(this, 'click'));

    // Track form submissions
    document.addEventListener('submit', this._trackInteraction.bind(this, 'submit'));

    // Track route changes (for SPA)
    this._trackRouteChanges();
  }

  _trackInteraction(type, event) {
    const target = event.target;
    const selector = this._getElementSelector(target);

    this._recordMetric('user-interaction', 1, {
      type,
      selector,
      tagName: target.tagName.toLowerCase(),
      timestamp: Date.now()
    });
  }

  _trackRouteChanges() {
    let currentPath = window.location.pathname;

    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this._onRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this._onRouteChange();
    };

    // Listen for popstate
    window.addEventListener('popstate', () => {
      this._onRouteChange();
    });

    const checkRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        this._onRouteChange();
      }
    };

    // Fallback polling for route changes
    setInterval(checkRouteChange, 1000);
  }

  _onRouteChange() {
    const newPath = window.location.pathname;
    const oldPath = this.pageInfo.pathname;

    this._recordMetric('route-change', 1, {
      from: oldPath,
      to: newPath,
      timestamp: Date.now()
    });

    // Update page info
    this.pageInfo = this._getPageInfo();
  }

  _getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  _recordMetric(name, value, context = {}) {
    const metric = {
      name,
      value,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: this.pageInfo,
      userAgent: navigator.userAgent,
      ...this.config.customDimensions
    };

    this.metrics.push(metric);

    if (this.config.debug) {
      console.log('📊 RUM Metric:', metric);
    }

    // Auto-flush if buffer is full
    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  _recordError(type, details) {
    this._recordMetric('error', 1, {
      type,
      ...details,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  _setupPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  _setupPageLifecycle() {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this._recordMetric('visibility-change', 1, {
        hidden: document.hidden,
        timestamp: Date.now()
      });
    });

    // Page focus/blur
    window.addEventListener('focus', () => {
      this._recordMetric('page-focus', 1, { timestamp: Date.now() });
    });

    window.addEventListener('blur', () => {
      this._recordMetric('page-blur', 1, { timestamp: Date.now() });
    });
  }

  _setupUnloadHandler() {
    // Send remaining metrics before page unload
    const sendBeacon = () => {
      if (this.metrics.length > 0) {
        this.flush(true);
      }
    };

    window.addEventListener('beforeunload', sendBeacon);
    window.addEventListener('pagehide', sendBeacon);

    // Use sendBeacon API if available
    if (navigator.sendBeacon) {
      window.addEventListener('unload', sendBeacon);
    }
  }

  async flush(useBeacon = false) {
    if (this.metrics.length === 0) return;

    const payload = {
      metrics: [...this.metrics],
      session: {
        id: this.sessionId,
        startTime: this.startTime,
        duration: Date.now() - this.startTime
      }
    };

    // Clear metrics buffer
    this.metrics = [];

    try {
      if (useBeacon && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery
        navigator.sendBeacon(
          this.config.endpoint,
          JSON.stringify(payload)
        );
      } else {
        // Use fetch for regular requests
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }

      if (this.config.debug) {
        console.log('📊 RUM: Metrics sent', payload.metrics.length);
      }
    } catch (error) {
      console.warn('📊 RUM: Failed to send metrics:', error);

      // Restore metrics to buffer for retry
      this.metrics.unshift(...payload.metrics);
    }
  }

  // Public methods
  startTiming(name) {
    performance.mark(`${name}-start`);
  }

  endTiming(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  recordCustomMetric(name, value, context = {}) {
    this._recordMetric(`custom-${name}`, value, context);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setCustomDimension(key, value) {
    this.config.customDimensions[key] = value;
  }

  // Utility methods
  _generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateUserId() {
    // Try to get from localStorage
    let userId = localStorage.getItem('rum-user-id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rum-user-id', userId);
    }
    return userId;
  }

  _getPageInfo() {
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      title: document.title
    };
  }

  getStatistics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      metricsBuffered: this.metrics.length,
      sessionDuration: Date.now() - this.startTime,
      observersActive: this.observers.size
    };
  }

  destroy() {
    // Cleanup observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();

    // Send remaining metrics
    if (this.metrics.length > 0) {
      this.flush(true);
    }
  }
}

// Global RUM instance
let rumMonitor = null;

// Initialize RUM
export function initializeRUM(options = {}) {
  if (typeof window === 'undefined') return null;

  if (rumMonitor) {
    console.warn('📊 RUM: Already initialized');
    return rumMonitor;
  }

  rumMonitor = new RUMMonitor({
    endpoint: process.env.REACT_APP_RUM_ENDPOINT || '/api/rum/metrics',
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    customDimensions: {
      version: process.env.REACT_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    ...options
  });

  // Make it globally available
  window.rumMonitor = rumMonitor;

  return rumMonitor;
}

// Get current RUM instance
export function getRUM() {
  return rumMonitor;
}

export default RUMMonitor;
