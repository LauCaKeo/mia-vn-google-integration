// Lazy loading utilities for React components
import { lazy, Suspense } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px'
  }}>
    <div>🔄 Đang tải...</div>
  </div>
);

// Higher-order component for lazy loading
export const withLazyLoading = (importFunc, fallback = <LoadingSpinner />) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Pre-built lazy components
export const LazyGoogleDriveIntegration = withLazyLoading(
  () => import('@components/GoogleDrive/GoogleDriveIntegration')
);

export const LazyGoogleSheetsIntegration = withLazyLoading(
  () => import('@components/GoogleSheet/GoogleSheetsIntegration')
);

export const LazyAutomationDashboard = withLazyLoading(
  () => import('@components/automation/AutomationDashboard')
);

export const LazyAIDashboard = withLazyLoading(
  () => import('@components/ai/AIDashboard')
);

export const LazyTelegramIntegration = withLazyLoading(
  () => import('@components/telegram/TelegramIntegration')
);

// Dynamic import utility
export const dynamicImport = (componentPath) => {
  return lazy(() => import(componentPath));
};

// Preload utility for better UX
export const preloadComponent = (importFunc) => {
  const componentImport = importFunc();
  return componentImport;
};