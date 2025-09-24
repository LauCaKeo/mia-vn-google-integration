// Environment configuration management
const EnvironmentConfig = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    googleApiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    telegramBotToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
    debug: true,
    logLevel: 'debug',
    enableServiceWorker: false,
    enableAnalytics: false,
    cacheStrategy: 'network-first'
  },

  staging: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://staging-api.mia-vn.com',
    googleApiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    telegramBotToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
    debug: false,
    logLevel: 'info',
    enableServiceWorker: true,
    enableAnalytics: true,
    cacheStrategy: 'cache-first'
  },

  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.mia-vn.com',
    googleApiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    telegramBotToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
    debug: false,
    logLevel: 'error',
    enableServiceWorker: true,
    enableAnalytics: true,
    cacheStrategy: 'cache-first'
  }
};

// Environment detection
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    if (window.location.hostname.includes('staging')) {
      return 'staging';
    }
    return 'production';
  }
  return 'development';
};

// Get current environment configuration
const getCurrentConfig = () => {
  const env = getEnvironment();
  return {
    environment: env,
    ...EnvironmentConfig[env]
  };
};

// Environment validation
const validateEnvironment = (config) => {
  const required = ['googleApiKey', 'googleClientId'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  return true;
};

// Security configuration
const getSecurityConfig = () => {
  const config = getCurrentConfig();

  return {
    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React development
        "'unsafe-eval'", // Required for development
        'https://apis.google.com',
        'https://accounts.google.com',
        'https://www.googletagmanager.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        config.apiUrl,
        'https://*.googleapis.com',
        'https://accounts.google.com',
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'wss:'
      ],
      'frame-src': [
        'https://accounts.google.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    },

    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    }
  };
};

// Feature flags based on environment
const getFeatureFlags = () => {
  const config = getCurrentConfig();

  return {
    enableOfflineMode: config.enableServiceWorker,
    enablePushNotifications: config.environment !== 'development',
    enableAdvancedAnalytics: config.enableAnalytics,
    enableExperimentalFeatures: config.environment === 'development',
    enableCaching: config.enableServiceWorker,
    enableErrorReporting: config.environment !== 'development',
    enablePerformanceMonitoring: config.environment === 'production'
  };
};

// Cache configuration based on environment
const getCacheConfig = () => {
  const config = getCurrentConfig();

  const baseConfig = {
    'network-first': {
      networkTimeoutSeconds: 3,
      cacheableResponse: { statuses: [0, 200] }
    },
    'cache-first': {
      cacheName: 'static-resources',
      cacheableResponse: { statuses: [0, 200] }
    },
    'stale-while-revalidate': {
      cacheName: 'dynamic-content',
      cacheableResponse: { statuses: [0, 200] }
    }
  };

  return {
    strategy: config.cacheStrategy,
    ...baseConfig[config.cacheStrategy]
  };
};

// API configuration
const getAPIConfig = () => {
  const config = getCurrentConfig();

  return {
    baseURL: config.apiUrl,
    timeout: config.environment === 'development' ? 10000 : 5000,
    retries: config.environment === 'production' ? 3 : 1,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'X-Environment': config.environment
    }
  };
};

// Google APIs configuration
const getGoogleConfig = () => {
  const config = getCurrentConfig();

  return {
    apiKey: config.googleApiKey,
    clientId: config.googleClientId,
    discoveryDocs: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly'
    ].join(' '),
    hosted_domain: config.environment === 'production' ? 'mia-vn.com' : undefined
  };
};

// Monitoring and analytics configuration
const getMonitoringConfig = () => {
  const config = getCurrentConfig();

  return {
    enabled: config.enableAnalytics,
    googleAnalyticsId: process.env.REACT_APP_GA_ID || '',
    sentryDsn: process.env.REACT_APP_SENTRY_DSN || '',
    logRocketId: process.env.REACT_APP_LOGROCKET_ID || '',
    hotjarId: process.env.REACT_APP_HOTJAR_ID || '',

    // Performance monitoring
    performance: {
      enabled: config.environment === 'production',
      sampleRate: config.environment === 'production' ? 0.1 : 1.0,
      enableWebVitals: true,
      enableUserInteraction: true
    },

    // Error tracking
    errorTracking: {
      enabled: config.environment !== 'development',
      enableSourceMaps: config.environment === 'staging',
      enableUserReporting: true,
      enablePerformanceMonitoring: true
    }
  };
};

// Export configuration object
const AppConfig = {
  getCurrentConfig,
  validateEnvironment,
  getSecurityConfig,
  getFeatureFlags,
  getCacheConfig,
  getAPIConfig,
  getGoogleConfig,
  getMonitoringConfig,

  // Utility functions
  isDevelopment: () => getEnvironment() === 'development',
  isStaging: () => getEnvironment() === 'staging',
  isProduction: () => getEnvironment() === 'production',

  // Environment info
  getEnvironmentInfo: () => ({
    environment: getEnvironment(),
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    gitCommit: process.env.REACT_APP_GIT_COMMIT || 'unknown',
    nodeEnv: process.env.NODE_ENV
  })
};

export default AppConfig;
