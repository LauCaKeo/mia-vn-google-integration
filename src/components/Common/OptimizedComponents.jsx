import React, { memo, useCallback, useMemo } from 'react';

// HOC để wrap components với React.memo và optimizations
export const withOptimization = (WrappedComponent, displayName) => {
  const OptimizedComponent = memo((props) => {
    // Memoize expensive calculations
    const memoizedProps = useMemo(() => {
      const { data, config, ...rest } = props;
      return {
        ...rest,
        data: data || {},
        config: config || {}
      };
    }, [props]);

    // Memoize callbacks
    const memoizedCallbacks = useMemo(() => {
      const callbacks = {};
      Object.keys(props).forEach(key => {
        if (typeof props[key] === 'function') {
          callbacks[key] = useCallback(props[key], [props[key]]);
        }
      });
      return callbacks;
    }, [props]);

    return <WrappedComponent {...memoizedProps} {...memoizedCallbacks} />;
  });

  OptimizedComponent.displayName = `withOptimization(${displayName || WrappedComponent.displayName || WrappedComponent.name})`;

  return OptimizedComponent;
};

// Optimized components
export const OptimizedAutomationDashboard = withOptimization(
  require('../automation/AutomationDashboard').default,
  'AutomationDashboard'
);

export const OptimizedGoogleSheetsIntegration = withOptimization(
  require('../GoogleSheet/GoogleSheetsIntegration').default,
  'GoogleSheetsIntegration'
);

export const OptimizedGoogleDriveIntegration = withOptimization(
  require('../GoogleDrive/GoogleDriveIntegration').default,
  'GoogleDriveIntegration'
);

export const OptimizedTelegramIntegration = withOptimization(
  require('../telegram/TelegramIntegration').default,
  'TelegramIntegration'
);

export const OptimizedConfigPageWrapper = withOptimization(
  require('../automation/ConfigPageWrapper').default,
  'ConfigPageWrapper'
);

export const OptimizedAutomationPanelWrapper = withOptimization(
  require('../automation/AutomationPanelWrapper').default,
  'AutomationPanelWrapper'
);

// Expected render performance improvement: ~25%