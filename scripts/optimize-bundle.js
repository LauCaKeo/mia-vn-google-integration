const fs = require('fs');
const path = require('path');

console.log('🛠️  Bundle Optimization Script');
console.log('Tạo cấu hình tối ưu hóa cho Vite...\n');

// Đọc vite.config.js hiện tại
const viteConfigPath = path.join(__dirname, '../vite.config.js');

let viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize dependencies
      include: "**/*.{jsx,tsx}",
    }),
    // Bundle analyzer - chỉ trong development
    mode === 'development' && visualizer({
      filename: 'bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  // Tối ưu hóa build
  build: {
    // Target modern browsers
    target: 'es2020',

    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks: {
          // React và React DOM
          'react-vendor': ['react', 'react-dom'],

          // React Router
          'router': ['react-router-dom'],

          // State Management
          'redux': ['redux', 'react-redux', 'redux-thunk', 'redux-persist'],

          // UI Libraries
          'ui-libs': ['antd', '@ant-design/icons'],

          // Charts
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],

          // Google APIs
          'google-apis': ['googleapis', 'google-auth-library'],

          // Utilities
          'utils': ['axios', 'lodash', 'moment', 'dayjs'],

          // Development tools
          'dev-tools': ['web-vitals']
        },

        // Naming strategy
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
            : 'chunk';
          return \`assets/\${facadeModuleId}.[hash].js\`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];

          if (/\.(css)$/.test(assetInfo.name)) {
            return \`assets/css/[name].[hash].\${extType}\`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return \`assets/images/[name].[hash].\${extType}\`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return \`assets/fonts/[name].[hash].\${extType}\`;
          }

          return \`assets/[name].[hash].\${extType}\`;
        }
      }
    },

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: mode === 'production',
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Optimize conditionals
        conditionals: true,
        // Optimize loops
        loops: true,
        // Remove unused imports
        unused: true
      },
      mangle: {
        // Keep function names for better debugging
        keep_fnames: mode !== 'production'
      }
    },

    // Source maps
    sourcemap: mode !== 'production',

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // CSS code splitting
    cssCodeSplit: true,

    // Asset inlining threshold
    assetsInlineLimit: 4096
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'axios'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded dynamically
    ]
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@hooks': path.resolve(__dirname, 'src/hooks')
    }
  },

  // Development server
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Preview server
  preview: {
    port: 3000,
    open: true
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}));`;

// Ghi file vite.config.js mới
fs.writeFileSync(viteConfigPath, viteConfig);

console.log('✅ Đã tạo vite.config.js tối ưu hóa');
console.log('✅ Cấu hình manual chunking cho vendor libraries');
console.log('✅ Thiết lập minification và tree shaking');
console.log('✅ Tối ưu hóa assets và CSS code splitting');
console.log('');
console.log('📋 Các tối ưu hóa đã áp dụng:');
console.log('   • Manual chunking cho React, Redux, UI libs');
console.log('   • Terser minification với drop console.log');
console.log('   • CSS code splitting và asset optimization');
console.log('   • Path aliases cho import ngắn gọn');
console.log('   • Bundle analyzer integration');
console.log('');
console.log('🚀 Chạy "npm run build" để xem kết quả tối ưu hóa!');

// Tạo script lazy loading helper
const lazyLoadHelper = `// Lazy loading utilities for React components
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
};`;

fs.writeFileSync(
  path.join(__dirname, '../src/utils/lazyLoading.js'),
  lazyLoadHelper
);

console.log('✅ Đã tạo utilities cho lazy loading');
console.log('');
console.log('💡 Tiếp theo:');
console.log('   1. Cập nhật App.jsx để sử dụng lazy components');
console.log('   2. Chạy "npm run analyze" để xem kết quả');
console.log('   3. Kiểm tra performance với Lighthouse');
