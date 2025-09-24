import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring configuration
const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_ENDPOINT;
const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

// Performance thresholds for ratings
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
};

// Performance metrics storage
let performanceMetrics = {};

// Send performance metrics to analytics
function sendToAnalytics({ name, value, id, delta, ...extra }) {
  const rating = getRating(name, value);

  // Store metrics locally
  performanceMetrics[name] = {
    value: Math.round(value),
    rating,
    timestamp: Date.now(),
    ...extra
  };

  const body = JSON.stringify({
    metric: name,
    value: Math.round(value),
    rating,
    id,
    delta: Math.round(delta),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    appVersion: APP_VERSION,
    sessionId: getSessionId(),
    ...extra
  });

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${name}:`, {
      value: Math.round(value),
      rating,
      threshold: PERFORMANCE_THRESHOLDS[name],
      ...extra
    });
  }

  // Send to analytics if endpoint is configured
  if (ANALYTICS_ENDPOINT) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch(console.error);
    }
  }
}

// Get performance rating
function getRating(name, value) {
  const threshold = PERFORMANCE_THRESHOLDS[name];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// Enhanced performance monitoring
export function initPerformanceMonitoring() {
  console.log('🚀 Initializing Performance Monitoring...');

  // Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Custom performance metrics
  measureCustomMetrics();

  // Resource timing
  measureResourceTiming();

  // User interactions
  measureUserInteractions();

  // Error tracking
  trackErrors();

  // Memory usage monitoring
  monitorMemoryUsage();

  // Bundle size analysis
  analyzeBundlePerformance();
}

// Get current performance metrics
export function getPerformanceMetrics() {
  return performanceMetrics;
}

// Get performance summary
export function getPerformanceSummary() {
  const summary = {
    overall: 'good',
    metrics: performanceMetrics,
    recommendations: []
  };

  let poorCount = 0;
  let improvementCount = 0;

  Object.entries(performanceMetrics).forEach(([name, data]) => {
    if (data.rating === 'poor') {
      poorCount++;
      summary.overall = 'poor';
      summary.recommendations.push(`Improve ${name}: ${data.value}ms`);
    } else if (data.rating === 'needs-improvement') {
      improvementCount++;
      if (summary.overall !== 'poor') {
        summary.overall = 'needs-improvement';
      }
    }
  });

  return summary;
}

// Measure custom application metrics
function measureCustomMetrics() {
  // Time to Interactive (TTI) approximation
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const tti = entry.domContentLoadedEventEnd - entry.navigationStart;
        sendToAnalytics({
          name: 'TTI',
          value: tti,
          id: `tti-${Date.now()}`,
          delta: 0,
        });
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['navigation'] });
  } catch (e) {
    console.warn('Navigation timing not supported');
  }

  // Component render time tracking
  window.componentRenderTime = {};

  // API response time tracking
  trackAPIPerformance();
}

// Monitor memory usage
function monitorMemoryUsage() {
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = performance.memory;
      sendToAnalytics({
        name: 'MEMORY_USAGE',
        value: memory.usedJSHeapSize,
        id: `memory-${Date.now()}`,
        delta: 0,
        totalHeapSize: memory.totalJSHeapSize,
        heapSizeLimit: memory.jsHeapSizeLimit
      });
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
  }
}

// Analyze bundle performance
function analyzeBundlePerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.name.includes('.js') && entry.transferSize > 50000) { // > 50KB
          console.warn(`📦 Large JavaScript bundle: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`);

          sendToAnalytics({
            name: 'LARGE_BUNDLE',
            value: entry.transferSize,
            id: `bundle-${Date.now()}`,
            delta: 0,
            resource: entry.name,
            duration: entry.duration
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }
}

// Track API performance with detailed metrics
function trackAPIPerformance() {
  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const startTime = performance.now();
    const url = args[0];

    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Only track API calls, not static resources
      if (typeof url === 'string' && (url.includes('/api/') || url.includes('googleapis.com'))) {
        sendToAnalytics({
          name: 'API_RESPONSE_TIME',
          value: duration,
          id: `api-${Date.now()}`,
          delta: 0,
          url: typeof url === 'string' ? url : url.url,
          status: response.status,
          method: args[1]?.method || 'GET'
        });
      }

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      sendToAnalytics({
        name: 'API_ERROR',
        value: duration,
        id: `api-error-${Date.now()}`,
        delta: 0,
        url: typeof url === 'string' ? url : url.url,
        error: error.message,
        method: args[1]?.method || 'GET'
      });

      throw error;
    }
  };
}

// Measure resource timing with categorization
function measureResourceTiming() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();

    entries.forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceType = entry.initiatorType;
        const duration = entry.responseEnd - entry.requestStart;

        // Only track significant resources
        if (duration > 100 || entry.transferSize > 10000) {
          sendToAnalytics({
            name: `RESOURCE_${resourceType.toUpperCase()}_TIME`,
            value: duration,
            id: `resource-${Date.now()}`,
            delta: 0,
            resource: entry.name,
            size: entry.transferSize || 0,
            cached: entry.transferSize === 0 && duration < 50
          });
        }
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    console.warn('Resource observer not supported');
  }
}

// Measure user interactions with throttling
function measureUserInteractions() {
  let clickCount = 0;
  let lastClickTime = 0;

  // Throttled click tracking
  document.addEventListener('click', (event) => {
    const now = Date.now();
    if (now - lastClickTime > 1000) { // Throttle to 1 click per second
      clickCount++;
      lastClickTime = now;

      sendToAnalytics({
        name: 'USER_CLICK',
        value: 1,
        id: `click-${now}`,
        delta: 1,
        element: event.target.tagName,
        className: event.target.className
      });
    }
  });

  // Scroll depth tracking with throttling
  let maxScroll = 0;
  let scrollTimeout = null;

  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

      if (scrolled > maxScroll && scrolled % 25 === 0) {
        maxScroll = scrolled;
        sendToAnalytics({
          name: 'SCROLL_DEPTH',
          value: maxScroll,
          id: `scroll-${Date.now()}`,
          delta: 0,
        });
      }

      scrollTimeout = null;
    }, 100);
  });
}

// Error tracking with context
function trackErrors() {
  // JavaScript errors
  window.addEventListener('error', (event) => {
    sendToAnalytics({
      name: 'JS_ERROR',
      value: 1,
      id: `error-${Date.now()}`,
      delta: 1,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendToAnalytics({
      name: 'PROMISE_REJECTION',
      value: 1,
      id: `rejection-${Date.now()}`,
      delta: 1,
      reason: event.reason?.message || String(event.reason),
      stack: event.reason?.stack
    });
  });
}

// Component performance HOC with enhanced tracking
export function withPerformanceTracking(WrappedComponent, componentName) {
  return function PerformanceTrackedComponent(props) {
    const startTime = performance.now();
    const [renderCount, setRenderCount] = React.useState(0);

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      sendToAnalytics({
        name: 'COMPONENT_RENDER_TIME',
        value: renderTime,
        id: `component-${Date.now()}`,
        delta: 0,
        component: componentName,
        renderCount: renderCount + 1
      });

      setRenderCount(count => count + 1);
    });

    return React.createElement(WrappedComponent, props);
  };
}

// Route performance tracking
export function trackRouteChange(routeName) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    sendToAnalytics({
      name: 'ROUTE_CHANGE_TIME',
      value: duration,
      id: `route-${Date.now()}`,
      delta: 0,
      route: routeName
    });
  };
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  // Initialize Web Vitals monitoring
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Track resource loading performance
  trackResourceTiming();

  // Track custom metrics
  trackCustomMetrics();

  console.log('📊 Performance monitoring initialized');
}
