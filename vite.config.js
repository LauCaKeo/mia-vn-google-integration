import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx,js,ts}",
    }),
  ],

  // Build configuration
  build: {
    outDir: "build",
    sourcemap: process.env.GENERATE_SOURCEMAP !== "false",
    minify: "terser",
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd", "@ant-design/icons"],
          google: ["googleapis", "google-auth-library"],
          charts: ["chart.js", "react-chartjs-2", "recharts"],
          redux: ["redux", "react-redux", "redux-thunk", "redux-persist"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Development server
  server: {
    port: 3000,
    host: "localhost",
    open: true,
    cors: true,
    headers: {
      // Security Headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      // Content Security Policy
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://sheets.googleapis.com https://drive.googleapis.com https://www.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com;",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server
  preview: {
    port: 3000,
    host: "localhost",
    headers: {
      // Security Headers for Production Preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://sheets.googleapis.com https://drive.googleapis.com https://www.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com;",
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@constants": path.resolve(__dirname, "./src/constants"),
    },
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    preprocessorOptions: {
      less: {
        modifyVars: {
          // Ant Design theme customization
          "@primary-color": "#1890ff",
          "@link-color": "#1890ff",
          "@success-color": "#52c41a",
          "@warning-color": "#faad14",
          "@error-color": "#f5222d",
        },
        javascriptEnabled: true,
      },
    },
  },

  // Environment variables
  define: {
    global: "globalThis",
  },

  // Optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "antd",
      "@ant-design/icons",
      "axios",
      "dayjs",
      "lodash",
      "chart.js",
      "react-chartjs-2",
      "recharts",
    ],
    exclude: ["googleapis", "google-auth-library"],
  },

  // Base URL for GitHub Pages or custom domain
  base: process.env.NODE_ENV === "production" ? "./" : "/",

  // Enable esbuild for faster builds
  esbuild: {
    target: "es2015",
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
