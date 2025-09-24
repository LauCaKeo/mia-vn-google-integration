// Performance Monitoring và Reporting
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      bundleSize: 1024 * 1024, // 1MB
      loadTime: 3000, // 3s
      renderTime: 100, // 100ms
      memoryUsage: 50 * 1024 * 1024 // 50MB
    };

    this.init();
  }

  init() {
    // Monitor bundle loading
    this.monitorBundleSize();

    // Monitor page performance
    this.monitorPagePerformance();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor user interactions
    this.monitorUserInteractions();

    // Setup reporting
    this.setupReporting();
  }

  monitorBundleSize() {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      let totalJSSize = 0;
      let totalCSSSize = 0;

      resources.forEach(resource => {
        if (resource.name.includes('.js')) {
          totalJSSize += resource.transferSize || resource.decodedBodySize || 0;
        }
        if (resource.name.includes('.css')) {
          totalCSSSize += resource.transferSize || resource.decodedBodySize || 0;
        }
      });

      this.metrics.bundleSize = {
        js: totalJSSize,
        css: totalCSSSize,
        total: totalJSSize + totalCSSSize,
        timestamp: Date.now()
      };

      // Alert if bundle too large
      if (this.metrics.bundleSize.total > this.thresholds.bundleSize) {
        console.warn(`⚠️ Bundle size warning: ${(this.metrics.bundleSize.total / 1024).toFixed(2)}KB > ${this.thresholds.bundleSize / 1024}KB`);
        this.reportIssue('bundle_size_warning', this.metrics.bundleSize);
      }
    }
  }

  monitorPagePerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;

      this.metrics.pageLoad = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstByte: timing.responseStart - timing.navigationStart,
        timestamp: Date.now()
      };

      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        this.observeWebVitals();
      }
    }
  }

  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;

      if (lastEntry.startTime > 2500) {
        console.warn(`⚠️ LCP warning: ${lastEntry.startTime.toFixed(2)}ms > 2500ms`);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID) - approximation
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;

        if (this.metrics.fid > 100) {
          console.warn(`⚠️ FID warning: ${this.metrics.fid.toFixed(2)}ms > 100ms`);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;

      if (clsValue > 0.1) {
        console.warn(`⚠️ CLS warning: ${clsValue.toFixed(3)} > 0.1`);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  monitorMemoryUsage() {
    if ('memory' in window.performance) {
      setInterval(() => {
        const memory = window.performance.memory;
        this.metrics.memory = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
          console.warn(`⚠️ Memory usage warning: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  monitorUserInteractions() {
    // Track component render times
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.metrics.componentRender = {
              name: entry.name,
              duration: entry.duration,
              timestamp: Date.now()
            };

            if (entry.duration > this.thresholds.renderTime) {
              console.warn(`⚠️ Slow component render: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
      }).observe({ entryTypes: ['measure'] });
    }
  }

  setupReporting() {
    // Report metrics every 5 minutes
    setInterval(() => {
      this.sendMetrics();
    }, 5 * 60 * 1000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
  }

  sendMetrics() {
    const report = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.metrics,
      performance: {
        score: this.calculatePerformanceScore()
      }
    };

    // Send to analytics (replace with your endpoint)
    console.log('📊 Performance Report:', report);

    // In production, send to your analytics service:
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report)
    // });
  }

  calculatePerformanceScore() {
    let score = 100;

    // Bundle size impact
    if (this.metrics.bundleSize) {
      const sizeMB = this.metrics.bundleSize.total / (1024 * 1024);
      if (sizeMB > 1) score -= (sizeMB - 1) * 20;
    }

    // LCP impact
    if (this.metrics.lcp) {
      if (this.metrics.lcp > 2500) score -= 20;
      else if (this.metrics.lcp > 1000) score -= 10;
    }

    // FID impact
    if (this.metrics.fid) {
      if (this.metrics.fid > 100) score -= 15;
      else if (this.metrics.fid > 50) score -= 5;
    }

    // CLS impact
    if (this.metrics.cls) {
      if (this.metrics.cls > 0.25) score -= 20;
      else if (this.metrics.cls > 0.1) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  reportIssue(type, data) {
    console.warn(`🚨 Performance Issue: ${type}`, data);

    // In production, send to monitoring service
    // fetch('/api/monitoring/issue', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data, timestamp: Date.now() })
    // });
  }
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = new PerformanceMonitor();
}

export default PerformanceMonitor;