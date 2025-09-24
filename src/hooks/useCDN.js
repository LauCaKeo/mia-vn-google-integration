/**
 * CDN Asset Loading Hook - Phase 3C Performance Optimization
 * React hook for CDN asset management with fallback strategies
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import cdnManager from '../utils/cdnManager';

/**
 * Hook for loading CDN assets with fallback and caching
 */
export function useCDNAsset(type, name, version = null, options = {}) {
  const [state, setState] = useState({
    loading: true,
    loaded: false,
    error: null,
    url: null,
    source: null
  });

  const loadAsset = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let result;
      switch (type) {
        case 'script':
          result = await cdnManager.loadScript(name, version, options);
          break;
        case 'style':
          result = await cdnManager.loadStylesheet(name, version, options);
          break;
        case 'font':
          result = await cdnManager.loadFont(name, options);
          break;
        default:
          throw new Error(`Unsupported asset type: ${type}`);
      }

      setState({
        loading: false,
        loaded: true,
        error: null,
        url: result.url,
        source: result.source
      });

    } catch (error) {
      setState({
        loading: false,
        loaded: false,
        error: error.message,
        url: null,
        source: null
      });
    }
  }, [type, name, version, JSON.stringify(options)]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const retry = useCallback(() => {
    loadAsset();
  }, [loadAsset]);

  return {
    ...state,
    retry
  };
}

/**
 * Hook for batch loading multiple CDN assets
 */
export function useCDNAssets(assets = []) {
  const [state, setState] = useState({
    loading: true,
    loaded: false,
    error: null,
    results: {},
    statistics: null
  });

  const loadAssets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const loadPromises = assets.map(async asset => {
        const { type, name, version, options = {} } = asset;

        try {
          let result;
          switch (type) {
            case 'script':
              result = await cdnManager.loadScript(name, version, options);
              break;
            case 'style':
              result = await cdnManager.loadStylesheet(name, version, options);
              break;
            case 'font':
              result = await cdnManager.loadFont(name, options);
              break;
            default:
              throw new Error(`Unsupported asset type: ${type}`);
          }

          return {
            ...asset,
            success: true,
            result,
            error: null
          };
        } catch (error) {
          return {
            ...asset,
            success: false,
            result: null,
            error: error.message
          };
        }
      });

      const results = await Promise.allSettled(loadPromises.map(p => p.catch(e => e)));
      const processedResults = {};
      let hasErrors = false;

      results.forEach((result, index) => {
        const asset = assets[index];
        const key = `${asset.type}-${asset.name}`;

        if (result.status === 'fulfilled') {
          processedResults[key] = await loadPromises[index];
        } else {
          processedResults[key] = {
            ...asset,
            success: false,
            result: null,
            error: result.reason?.message || 'Unknown error'
          };
          hasErrors = true;
        }
      });

      const statistics = cdnManager.getStatistics();

      setState({
        loading: false,
        loaded: true,
        error: hasErrors ? 'Some assets failed to load' : null,
        results: processedResults,
        statistics
      });

    } catch (error) {
      setState({
        loading: false,
        loaded: false,
        error: error.message,
        results: {},
        statistics: null
      });
    }
  }, [JSON.stringify(assets)]);

  useEffect(() => {
    if (assets.length > 0) {
      loadAssets();
    }
  }, [loadAssets]);

  const retry = useCallback(() => {
    loadAssets();
  }, [loadAssets]);

  const getAssetResult = useCallback((type, name) => {
    const key = `${type}-${name}`;
    return state.results[key] || null;
  }, [state.results]);

  return {
    ...state,
    retry,
    getAssetResult
  };
}

/**
 * Hook for CDN health monitoring
 */
export function useCDNHealth(checkInterval = 30000) {
  const [health, setHealth] = useState({
    healthy: null,
    lastCheck: null,
    error: null,
    checking: false
  });

  const checkHealth = useCallback(async () => {
    setHealth(prev => ({ ...prev, checking: true }));

    try {
      const result = await cdnManager.checkHealth();
      setHealth({
        healthy: result.healthy,
        lastCheck: new Date(),
        error: result.error || null,
        checking: false,
        responseTime: result.responseTime
      });
    } catch (error) {
      setHealth({
        healthy: false,
        lastCheck: new Date(),
        error: error.message,
        checking: false
      });
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return {
    ...health,
    checkHealth
  };
}

/**
 * Hook for CDN statistics monitoring
 */
export function useCDNStatistics(updateInterval = 5000) {
  const [statistics, setStatistics] = useState(null);

  const updateStatistics = useCallback(() => {
    const stats = cdnManager.getStatistics();
    setStatistics(stats);
  }, []);

  useEffect(() => {
    // Initial update
    updateStatistics();

    // Set up periodic updates
    const interval = setInterval(updateStatistics, updateInterval);

    return () => clearInterval(interval);
  }, [updateStatistics, updateInterval]);

  const clearCache = useCallback(() => {
    cdnManager.clearCache();
    updateStatistics();
  }, [updateStatistics]);

  return {
    statistics,
    updateStatistics,
    clearCache
  };
}

/**
 * Hook for optimized image loading with CDN
 */
export function useCDNImage(src, options = {}) {
  const [state, setState] = useState({
    loading: true,
    loaded: false,
    error: null,
    src: null,
    optimizedSrc: null
  });

  const {
    quality = 85,
    format = 'webp',
    width,
    height,
    fallback = true
  } = options;

  const optimizedSrc = useMemo(() => {
    if (!src) return null;

    // Check if image is already from CDN
    if (src.startsWith('http')) {
      return src;
    }

    // Build CDN URL with optimizations
    const cdnBase = process.env.REACT_APP_CDN_IMAGES || 'https://images.mia-vn.com';
    const params = new URLSearchParams();

    if (quality) params.set('q', quality);
    if (format) params.set('f', format);
    if (width) params.set('w', width);
    if (height) params.set('h', height);

    const queryString = params.toString();
    return `${cdnBase}${src}${queryString ? `?${queryString}` : ''}`;
  }, [src, quality, format, width, height]);

  useEffect(() => {
    if (!optimizedSrc) {
      setState({
        loading: false,
        loaded: false,
        error: 'No image source provided',
        src: null,
        optimizedSrc: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      setState({
        loading: false,
        loaded: true,
        error: null,
        src: optimizedSrc,
        optimizedSrc
      });
    };

    const handleError = () => {
      if (fallback && optimizedSrc !== src) {
        // Try original source as fallback
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';

        fallbackImg.onload = () => {
          setState({
            loading: false,
            loaded: true,
            error: null,
            src: src,
            optimizedSrc: src
          });
        };

        fallbackImg.onerror = () => {
          setState({
            loading: false,
            loaded: false,
            error: 'Failed to load image',
            src: null,
            optimizedSrc
          });
        };

        fallbackImg.src = src;
      } else {
        setState({
          loading: false,
          loaded: false,
          error: 'Failed to load image',
          src: null,
          optimizedSrc
        });
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [optimizedSrc, src, fallback]);

  return state;
}

/**
 * Higher-order component for CDN asset injection
 */
export function withCDNAssets(assets) {
  return function(WrappedComponent) {
    return function CDNAssetProvider(props) {
      const cdnState = useCDNAssets(assets);

      if (cdnState.loading) {
        return <div className="cdn-loading">Loading CDN assets...</div>;
      }

      if (cdnState.error && !cdnState.loaded) {
        return (
          <div className="cdn-error">
            <p>Failed to load CDN assets: {cdnState.error}</p>
            <button onClick={cdnState.retry}>Retry</button>
          </div>
        );
      }

      return <WrappedComponent {...props} cdnAssets={cdnState} />;
    };
  };
}
