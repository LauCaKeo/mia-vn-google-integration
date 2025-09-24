const fs = require('fs');
const path = require('path');

/**
 * Build Analysis Script
 * Analyzes the build output and generates performance report
 */

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildOutput() {
  const buildDir = path.join(__dirname, '..', 'build');
  const assetsDir = path.join(buildDir, 'assets');

  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    return;
  }

  console.log('📊 MIA.vn Google Integration - Build Analysis Report');
  console.log('=' .repeat(60));

  // Analyze main assets
  const assets = {
    js: [],
    css: [],
    total: 0
  };

  function scanDirectory(dir, basePath = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        scanDirectory(filePath, path.join(basePath, file));
      } else {
        const relativePath = path.join(basePath, file);
        const size = stats.size;
        assets.total += size;

        if (file.endsWith('.js')) {
          assets.js.push({ name: relativePath, size, compressed: size });
        } else if (file.endsWith('.css')) {
          assets.css.push({ name: relativePath, size, compressed: size });
        }
      }
    }
  }

  scanDirectory(assetsDir);

  // Sort by size (largest first)
  assets.js.sort((a, b) => b.size - a.size);
  assets.css.sort((a, b) => b.size - a.size);

  // JavaScript Bundles
  console.log('\n🟨 JavaScript Bundles:');
  console.log('-'.repeat(40));
  let totalJS = 0;
  assets.js.forEach((asset, index) => {
    totalJS += asset.size;
    const isLarge = asset.size > 100 * 1024; // > 100KB
    const icon = isLarge ? '⚠️ ' : '✅ ';
    console.log(`${icon}${index + 1}. ${asset.name} - ${formatBytes(asset.size)}`);
  });
  console.log(`Total JS: ${formatBytes(totalJS)}`);

  // CSS Files
  console.log('\n🟦 CSS Files:');
  console.log('-'.repeat(40));
  let totalCSS = 0;
  assets.css.forEach((asset, index) => {
    totalCSS += asset.size;
    console.log(`✅ ${index + 1}. ${asset.name} - ${formatBytes(asset.size)}`);
  });
  console.log(`Total CSS: ${formatBytes(totalCSS)}`);

  // Performance Analysis
  console.log('\n⚡ Performance Analysis:');
  console.log('-'.repeat(40));

  const largeChunks = assets.js.filter(asset => asset.size > 100 * 1024);
  const totalSize = totalJS + totalCSS;

  console.log(`📦 Total Bundle Size: ${formatBytes(totalSize)}`);
  console.log(`📊 JavaScript: ${formatBytes(totalJS)} (${((totalJS / totalSize) * 100).toFixed(1)}%)`);
  console.log(`🎨 CSS: ${formatBytes(totalCSS)} (${((totalCSS / totalSize) * 100).toFixed(1)}%)`);
  console.log(`📁 Number of JS chunks: ${assets.js.length}`);
  console.log(`⚠️  Large chunks (>100KB): ${largeChunks.length}`);

  // Performance Recommendations
  console.log('\n🚀 Performance Recommendations:');
  console.log('-'.repeat(40));

  if (largeChunks.length > 0) {
    console.log('⚠️  Large chunks detected:');
    largeChunks.forEach(chunk => {
      console.log(`   • ${chunk.name} (${formatBytes(chunk.size)}) - Consider further splitting`);
    });
  } else {
    console.log('✅ All JavaScript chunks are reasonably sized (<100KB)');
  }

  if (assets.js.length > 20) {
    console.log('⚠️  Many small chunks detected - may impact loading performance');
  } else {
    console.log(`✅ Good chunk count (${assets.js.length}) for optimal loading`);
  }

  if (totalSize < 1024 * 1024) { // < 1MB
    console.log('✅ Total bundle size is excellent (<1MB)');
  } else if (totalSize < 2048 * 1024) { // < 2MB
    console.log('✅ Total bundle size is good (<2MB)');
  } else {
    console.log('⚠️  Total bundle size is large (>2MB) - consider optimization');
  }

  // Chunking Strategy Analysis
  console.log('\n📦 Chunking Strategy Analysis:');
  console.log('-'.repeat(40));

  const chunkPatterns = {
    vendor: assets.js.filter(a => a.name.includes('vendor') || a.name.includes('chunk')),
    components: assets.js.filter(a => /[A-Z]\w+/.test(path.basename(a.name, '.js'))),
    main: assets.js.filter(a => a.name.includes('index'))
  };

  console.log(`📚 Vendor chunks: ${chunkPatterns.vendor.length}`);
  console.log(`🧩 Component chunks: ${chunkPatterns.components.length}`);
  console.log(`🏠 Main chunks: ${chunkPatterns.main.length}`);

  // Compression Estimate
  console.log('\n🗜️  Compression Estimates (gzip):');
  console.log('-'.repeat(40));
  const estimatedGzipJS = Math.round(totalJS * 0.3); // ~30% of original size
  const estimatedGzipCSS = Math.round(totalCSS * 0.25); // ~25% of original size
  const estimatedGzipTotal = estimatedGzipJS + estimatedGzipCSS;

  console.log(`📦 Estimated gzipped JS: ${formatBytes(estimatedGzipJS)}`);
  console.log(`🎨 Estimated gzipped CSS: ${formatBytes(estimatedGzipCSS)}`);
  console.log(`📊 Estimated total gzipped: ${formatBytes(estimatedGzipTotal)}`);

  // Performance Targets
  console.log('\n🎯 Performance Targets vs Current:');
  console.log('-'.repeat(40));

  const targets = {
    totalBundle: 2 * 1024 * 1024, // 2MB
    maxChunkSize: 200 * 1024,     // 200KB
    gzippedTotal: 500 * 1024      // 500KB gzipped
  };

  const bundleStatus = totalSize <= targets.totalBundle ? '✅' : '⚠️';
  const chunkStatus = Math.max(...assets.js.map(a => a.size)) <= targets.maxChunkSize ? '✅' : '⚠️';
  const gzipStatus = estimatedGzipTotal <= targets.gzippedTotal ? '✅' : '⚠️';

  console.log(`${bundleStatus} Total bundle size: ${formatBytes(totalSize)} / ${formatBytes(targets.totalBundle)}`);
  console.log(`${chunkStatus} Largest chunk: ${formatBytes(Math.max(...assets.js.map(a => a.size)))} / ${formatBytes(targets.maxChunkSize)}`);
  console.log(`${gzipStatus} Gzipped estimate: ${formatBytes(estimatedGzipTotal)} / ${formatBytes(targets.gzippedTotal)}`);

  console.log('\n' + '='.repeat(60));
  console.log('📈 Build analysis complete!');
}

// Generate performance report
function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: analyzeBuildOutput(),
    recommendations: [
      'Consider implementing dynamic imports for non-critical components',
      'Enable gzip compression on your web server',
      'Implement service worker caching for better repeat visits',
      'Monitor Core Web Vitals in production',
      'Consider lazy loading images and components'
    ]
  };

  return report;
}

if (require.main === module) {
  analyzeBuildOutput();
}

module.exports = {
  analyzeBuildOutput,
  generatePerformanceReport,
  formatBytes
};
