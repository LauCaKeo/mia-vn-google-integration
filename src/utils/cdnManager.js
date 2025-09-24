/**
 * CDN Integration Utility - Phase 3C Performance Optimization
 * Handles CDN asset loading with fallback strategies
 */

class CDNManager {
  constructor(options = {}) {
    this.config = {
      // Primary CDN
      primaryCDN: options.primaryCDN || 'https://cdn.jsdelivr.net',

      // Fallback CDN
      fallbackCDN: options.fallbackCDN || 'https://unpkg.com',

      // Local fallback
      localFallback: options.localFallback || true,

      // Timeout for CDN requests
      timeout: options.timeout || 5000,

      // Cache duration (milliseconds)
      cacheDuration: options.cacheDuration || 24 * 60 * 60 * 1000, // 24 hours

      // Retry attempts
      retryAttempts: options.retryAttempts || 2,

      // Custom domains for different asset types
      domains: {
        images: options.domains?.images || 'https://images.mia-vn.com',
        fonts: options.domains?.fonts || 'https://fonts.googleapis.com',
        scripts: options.domains?.scripts || 'https://cdn.jsdelivr.net',
        styles: options.domains?.styles || 'https://cdn.jsdelivr.net',
        ...options.domains
      },

      // Assets to serve from CDN
      assets: {
        // JavaScript libraries
        scripts: {
          'react': 'react@18/umd/react.production.min.js',
          'react-dom': 'react-dom@18/umd/react-dom.production.min.js',
          'lodash': 'lodash@4/lodash.min.js',
          'moment': 'moment@2/min/moment.min.js',
          'chart.js': 'chart.js@4/dist/chart.min.js',
          ...options.assets?.scripts
        },

        // CSS libraries
        styles: {
          'antd': 'antd@5/dist/reset.css',
          'normalize': 'normalize.css@8/normalize.css',
          ...options.assets?.styles
        },

        // Font families
        fonts: {
          'roboto': 'css2?family=Roboto:wght@300;400;500;700&display=swap',
          'inter': 'css2?family=Inter:wght@300;400;500;600;700&display=swap',
          ...options.assets?.fonts
        },

        ...options.assets
      }
    };

    // Cache for loaded assets
    this.cache = new Map();

    // Loading states
    this.loading = new Map();

    // Failed assets
    this.failed = new Set();

    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      failures: 0,
      totalLoadTime: 0
    };
  }

  /**
   * Load script from CDN with fallback
   */
  async loadScript(name, version = null, options = {}) {
    const cacheKey = `script-${name}-${version || 'latest'}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.metrics.hits++;
      return this.cache.get(cacheKey);
    }

    // Check if already loading
    if (this.loading.has(cacheKey)) {
      return this.loading.get(cacheKey);
    }

    const startTime = performance.now();

    const loadPromise = this._loadScriptInternal(name, version, options)
      .then(result => {
        this.metrics.totalLoadTime += performance.now() - startTime;
        this.cache.set(cacheKey, result);
        this.loading.delete(cacheKey);
        return result;
      })
      .catch(error => {
        this.metrics.failures++;
        this.loading.delete(cacheKey);
        this.failed.add(cacheKey);
        throw error;
      });

    this.loading.set(cacheKey, loadPromise);
    this.metrics.misses++;

    return loadPromise;
  }

  async _loadScriptInternal(name, version, options) {
    const scriptConfig = this.config.assets.scripts[name];
    if (!scriptConfig) {
      throw new Error(`Unknown script: ${name}`);
    }

    const urls = this._buildAssetUrls('scripts', scriptConfig, version);

    for (let i = 0; i < urls.length; i++) {
      try {
        await this._loadScriptFromUrl(urls[i], options);
        console.log(`✅ Loaded ${name} from CDN:`, urls[i]);
        return { name, url: urls[i], source: i === 0 ? 'primary' : 'fallback' };
      } catch (error) {
        console.warn(`❌ Failed to load ${name} from ${urls[i]}:`, error);
        if (i === urls.length - 1) throw error;
      }
    }
  }

  _loadScriptFromUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = options.async !== false;
      script.defer = options.defer || false;
      script.crossOrigin = options.crossOrigin || 'anonymous';

      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Script load timeout: ${url}`));
      }, this.config.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Script load failed: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load stylesheet from CDN with fallback
   */
  async loadStylesheet(name, version = null, options = {}) {
    const cacheKey = `style-${name}-${version || 'latest'}`;

    if (this.cache.has(cacheKey)) {
      this.metrics.hits++;
      return this.cache.get(cacheKey);
    }

    if (this.loading.has(cacheKey)) {
      return this.loading.get(cacheKey);
    }

    const startTime = performance.now();

    const loadPromise = this._loadStylesheetInternal(name, version, options)
      .then(result => {
        this.metrics.totalLoadTime += performance.now() - startTime;
        this.cache.set(cacheKey, result);
        this.loading.delete(cacheKey);
        return result;
      })
      .catch(error => {
        this.metrics.failures++;
        this.loading.delete(cacheKey);
        this.failed.add(cacheKey);
        throw error;
      });

    this.loading.set(cacheKey, loadPromise);
    this.metrics.misses++;

    return loadPromise;
  }

  async _loadStylesheetInternal(name, version, options) {
    const styleConfig = this.config.assets.styles[name];
    if (!styleConfig) {
      throw new Error(`Unknown stylesheet: ${name}`);
    }

    const urls = this._buildAssetUrls('styles', styleConfig, version);

    for (let i = 0; i < urls.length; i++) {
      try {
        await this._loadStylesheetFromUrl(urls[i], options);
        console.log(`✅ Loaded ${name} stylesheet from CDN:`, urls[i]);
        return { name, url: urls[i], source: i === 0 ? 'primary' : 'fallback' };
      } catch (error) {
        console.warn(`❌ Failed to load ${name} stylesheet from ${urls[i]}:`, error);
        if (i === urls.length - 1) throw error;
      }
    }
  }

  _loadStylesheetFromUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.crossOrigin = options.crossOrigin || 'anonymous';

      // Set timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Stylesheet load timeout: ${url}`));
      }, this.config.timeout);

      link.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      link.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Stylesheet load failed: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Load font from CDN
   */
  async loadFont(name, options = {}) {
    const fontConfig = this.config.assets.fonts[name];
    if (!fontConfig) {
      throw new Error(`Unknown font: ${name}`);
    }

    const url = `${this.config.domains.fonts}/${fontConfig}`;

    try {
      await this.loadStylesheet(name, null, { ...options, customUrl: url });

      // Preload font files for better performance
      if (options.preload !== false) {
        this._preloadFontFiles(name);
      }

      return { name, url, source: 'cdn' };
    } catch (error) {
      console.warn(`❌ Failed to load font ${name}:`, error);
      throw error;
    }
  }

  _preloadFontFiles(fontName) {
    // This would typically extract font URLs from the CSS and preload them
    // For now, we'll add a generic preload hint
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Build CDN URLs with fallbacks
   */
  _buildAssetUrls(type, assetPath, version) {
    const urls = [];
    const domain = this.config.domains[type];

    // Primary CDN URL
    if (version) {
      urls.push(`${this.config.primaryCDN}/npm/${assetPath.replace('@', `@${version}/`)}`);
    } else {
      urls.push(`${domain || this.config.primaryCDN}/npm/${assetPath}`);
    }

    // Fallback CDN URL
    if (this.config.fallbackCDN !== this.config.primaryCDN) {
      urls.push(`${this.config.fallbackCDN}/${assetPath}`);
    }

    return urls;
  }

  /**
   * Preload critical assets
   */
  async preloadCriticalAssets(assets = []) {
    const preloadPromises = [];

    for (const asset of assets) {
      if (asset.type === 'script') {
        preloadPromises.push(this.loadScript(asset.name, asset.version));
      } else if (asset.type === 'style') {
        preloadPromises.push(this.loadStylesheet(asset.name, asset.version));
      } else if (asset.type === 'font') {
        preloadPromises.push(this.loadFont(asset.name));
      }
    }

    const results = await Promise.allSettled(preloadPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    console.log(`🚀 Preloaded ${successful}/${assets.length} critical assets`);
    return results;
  }

  /**
   * Get CDN statistics
   */
  getStatistics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total * 100).toFixed(1) : 0;
    const avgLoadTime = this.metrics.misses > 0 ?
      (this.metrics.totalLoadTime / this.metrics.misses).toFixed(2) : 0;

    return {
      cacheHits: this.metrics.hits,
      cacheMisses: this.metrics.misses,
      failures: this.metrics.failures,
      hitRate: `${hitRate}%`,
      averageLoadTime: `${avgLoadTime}ms`,
      cachedAssets: this.cache.size,
      failedAssets: this.failed.size
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.failed.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      failures: 0,
      totalLoadTime: 0
    };
    console.log('🗑️ CDN cache cleared');
  }

  /**
   * Check CDN health
   */
  async checkHealth() {
    const testUrl = `${this.config.primaryCDN}/npm/react@18/package.json`;

    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        timeout: this.config.timeout
      });

      return {
        healthy: response.ok,
        status: response.status,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Create global CDN manager instance
const cdnManager = new CDNManager({
  domains: {
    images: process.env.REACT_APP_CDN_IMAGES || 'https://images.mia-vn.com',
    fonts: 'https://fonts.googleapis.com',
    scripts: 'https://cdn.jsdelivr.net',
    styles: 'https://cdn.jsdelivr.net'
  }
});

// Initialize CDN manager
if (typeof window !== 'undefined') {
  window.cdnManager = cdnManager;

  // Preload critical assets on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const criticalAssets = [
        { type: 'font', name: 'roboto' },
        { type: 'style', name: 'normalize' }
      ];

      cdnManager.preloadCriticalAssets(criticalAssets)
        .catch(error => console.warn('CDN preload failed:', error));
    });
  }
}

export default cdnManager;
