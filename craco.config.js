const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      ...(process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : []),
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
    ],
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // Optimize chunks
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              google: {
                test: /[\\/]node_modules[\\/](googleapis|google-auth-library)[\\/]/,
                name: 'google-apis',
                chunks: 'all',
                priority: 20,
              },
              antd: {
                test: /[\\/]node_modules[\\/]antd[\\/]/,
                name: 'antd',
                chunks: 'all',
                priority: 15,
              },
              charts: {
                test: /[\\/]node_modules[\\/](recharts|chart\.js|react-chartjs-2)[\\/]/,
                name: 'charts',
                chunks: 'all',
                priority: 15,
              },
            },
          },
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                },
              },
            }),
          ],
        };
      }
      return webpackConfig;
    },
  },
};
