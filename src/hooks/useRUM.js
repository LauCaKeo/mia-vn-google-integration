/**
 * RUM React Integration Hook - Phase 3C Advanced Optimization
 * React hooks for Real User Monitoring integration
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { getRUM } from '../utils/rumMonitor';

/**
 * Hook for component performance monitoring
 */
export function useRUMComponent(componentName, options = {}) {
  const mountTimeRef = useRef(null);
  const rum = getRUM();

  useEffect(() => {
    if (!rum) return;

    const startTime = performance.now();
    mountTimeRef.current = startTime;

    // Record component mount
    rum.recordCustomMetric('component-mount', 1, {
      component: componentName,
      timestamp: Date.now(),
      ...options
    });

    // Start timing for component lifecycle
    rum.startTiming(`${componentName}-lifecycle`);

    return () => {
      // Record component unmount and duration
      const duration = performance.now() - startTime;

      rum.recordCustomMetric('component-unmount', duration, {
        component: componentName,
        timestamp: Date.now(),
        ...options
      });

      rum.endTiming(`${componentName}-lifecycle`);
    };
  }, [componentName, rum, JSON.stringify(options)]);

  const recordInteraction = useCallback((action, data = {}) => {
    if (!rum) return;

    rum.recordCustomMetric('component-interaction', 1, {
      component: componentName,
      action,
      ...data,
      timestamp: Date.now()
    });
  }, [componentName, rum]);

  const recordError = useCallback((error, context = {}) => {
    if (!rum) return;

    rum.recordCustomMetric('component-error', 1, {
      component: componentName,
      error: error.message,
      stack: error.stack,
      ...context,
      timestamp: Date.now()
    });
  }, [componentName, rum]);

  return {
    recordInteraction,
    recordError,
    mountTime: mountTimeRef.current
  };
}

/**
 * Hook for API call monitoring
 */
export function useRUMAPI() {
  const rum = getRUM();

  const trackAPICall = useCallback(async (apiCall, options = {}) => {
    if (!rum) return apiCall();

    const {
      name = 'api-call',
      includeResponse = false,
      includePayload = false
    } = options;

    const startTime = performance.now();
    const callId = `${name}-${Date.now()}`;

    // Start timing
    rum.startTiming(callId);

    // Record API call start
    rum.recordCustomMetric('api-start', 1, {
      name,
      callId,
      timestamp: Date.now(),
      ...(includePayload && options.payload ? { payload: options.payload } : {})
    });

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      // Record successful API call
      rum.recordCustomMetric('api-success', duration, {
        name,
        callId,
        timestamp: Date.now(),
        ...(includeResponse ? { response: result } : {})
      });

      rum.endTiming(callId);
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;

      // Record API error
      rum.recordCustomMetric('api-error', duration, {
        name,
        callId,
        error: error.message,
        status: error.status || error.code,
        timestamp: Date.now()
      });

      rum.endTiming(callId);
      throw error;
    }
  }, [rum]);

  return { trackAPICall };
}

/**
 * Hook for page performance monitoring
 */
export function useRUMPage(pageName, options = {}) {
  const rum = getRUM();
  const [pageMetrics, setPageMetrics] = useState(null);

  useEffect(() => {
    if (!rum) return;

    // Record page view
    rum.recordCustomMetric('page-view', 1, {
      page: pageName,
      timestamp: Date.now(),
      ...options
    });

    // Start page timing
    rum.startTiming(`${pageName}-visit`);

    // Collect initial page metrics
    const collectInitialMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.navigationStart
        };

        setPageMetrics(metrics);

        // Record page load metrics
        Object.entries(metrics).forEach(([metric, value]) => {
          rum.recordCustomMetric(`page-${metric}`, value, {
            page: pageName,
            timestamp: Date.now()
          });
        });
      }
    };

    // Wait for page to load
    if (document.readyState === 'complete') {
      collectInitialMetrics();
    } else {
      window.addEventListener('load', collectInitialMetrics, { once: true });
    }

    return () => {
      rum.endTiming(`${pageName}-visit`);

      // Record page exit
      rum.recordCustomMetric('page-exit', 1, {
        page: pageName,
        timestamp: Date.now()
      });
    };
  }, [pageName, rum, JSON.stringify(options)]);

  const recordPageEvent = useCallback((event, data = {}) => {
    if (!rum) return;

    rum.recordCustomMetric('page-event', 1, {
      page: pageName,
      event,
      ...data,
      timestamp: Date.now()
    });
  }, [pageName, rum]);

  return {
    pageMetrics,
    recordPageEvent
  };
}

/**
 * Hook for form performance monitoring
 */
export function useRUMForm(formName) {
  const rum = getRUM();
  const startTimeRef = useRef(null);

  const trackFormStart = useCallback(() => {
    if (!rum) return;

    startTimeRef.current = performance.now();

    rum.recordCustomMetric('form-start', 1, {
      form: formName,
      timestamp: Date.now()
    });
  }, [formName, rum]);

  const trackFormSubmit = useCallback((success = true, errors = null) => {
    if (!rum || !startTimeRef.current) return;

    const duration = performance.now() - startTimeRef.current;

    rum.recordCustomMetric('form-submit', duration, {
      form: formName,
      success,
      errors: errors ? Object.keys(errors).length : 0,
      timestamp: Date.now()
    });

    startTimeRef.current = null;
  }, [formName, rum]);

  const trackFieldInteraction = useCallback((fieldName, action = 'focus') => {
    if (!rum) return;

    rum.recordCustomMetric('form-field-interaction', 1, {
      form: formName,
      field: fieldName,
      action,
      timestamp: Date.now()
    });
  }, [formName, rum]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction
  };
}

/**
 * Hook for user session monitoring
 */
export function useRUMSession() {
  const rum = getRUM();
  const [sessionStats, setSessionStats] = useState(null);

  useEffect(() => {
    if (!rum) return;

    // Update session stats periodically
    const updateStats = () => {
      setSessionStats(rum.getStatistics());
    };

    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [rum]);

  const recordCustomEvent = useCallback((eventName, data = {}) => {
    if (!rum) return;

    rum.recordCustomMetric('custom-event', 1, {
      event: eventName,
      ...data,
      timestamp: Date.now()
    });
  }, [rum]);

  const setUserProperty = useCallback((key, value) => {
    if (!rum) return;

    rum.setCustomDimension(key, value);
  }, [rum]);

  const flushMetrics = useCallback(() => {
    if (!rum) return;

    rum.flush();
  }, [rum]);

  return {
    sessionStats,
    recordCustomEvent,
    setUserProperty,
    flushMetrics
  };
}

/**
 * Hook for error boundary integration
 */
export function useRUMErrorBoundary(boundaryName) {
  const rum = getRUM();

  const recordError = useCallback((error, errorInfo) => {
    if (!rum) return;

    rum.recordCustomMetric('error-boundary', 1, {
      boundary: boundaryName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    });
  }, [boundaryName, rum]);

  const recordRecovery = useCallback(() => {
    if (!rum) return;

    rum.recordCustomMetric('error-recovery', 1, {
      boundary: boundaryName,
      timestamp: Date.now()
    });
  }, [boundaryName, rum]);

  return {
    recordError,
    recordRecovery
  };
}

/**
 * Higher-order component for automatic RUM tracking
 */
export function withRUM(componentName, options = {}) {
  return function(WrappedComponent) {
    return function RUMTrackedComponent(props) {
      const { recordInteraction, recordError } = useRUMComponent(componentName, options);

      // Enhance props with RUM tracking
      const enhancedProps = {
        ...props,
        rumTrack: recordInteraction,
        rumError: recordError
      };

      return <WrappedComponent {...enhancedProps} />;
    };
  };
}

/**
 * Custom hook for measuring render performance
 */
export function useRUMRender(componentName) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(null);
  const rum = getRUM();

  useEffect(() => {
    if (!rum) return;

    renderCountRef.current += 1;
    const renderTime = performance.now();

    // Record render
    rum.recordCustomMetric('component-render', 1, {
      component: componentName,
      renderCount: renderCountRef.current,
      timestamp: Date.now()
    });

    // Calculate render interval
    if (lastRenderTimeRef.current) {
      const interval = renderTime - lastRenderTimeRef.current;
      rum.recordCustomMetric('render-interval', interval, {
        component: componentName,
        timestamp: Date.now()
      });
    }

    lastRenderTimeRef.current = renderTime;
  });

  return {
    renderCount: renderCountRef.current
  };
}
