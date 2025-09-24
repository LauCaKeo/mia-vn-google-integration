const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

/**
 * Vite Plugin for Automatic Image Processing - Phase 3C
 * Automatically optimizes images during build process
 */

const imageOptimizationPlugin = (options = {}) => {
  const {
    // Input directories to scan
    inputDirs = ['src/assets/images', 'public/images'],

    // Output directory
    outputDir = 'build/assets/images',

    // Format options
    formats = ['webp', 'avif'],

    // Quality settings
    quality = {
      jpeg: 85,
      webp: 85,
      avif: 80,
      png: 90
    },

    // Responsive breakpoints
    breakpoints = [480, 768, 1024, 1200, 1600],

    // Enable responsive generation
    generateResponsive = true,

    // File size limits (in bytes)
    limits = {
      maxSize: 1024 * 1024 * 2, // 2MB
      minSize: 1024 * 10        // 10KB
    },

    // Skip patterns
    skipPatterns = [/favicon/, /logo/, /icon-/],

    // Verbose logging
    verbose = true
  } = options;

  let isProduction = false;

  return {
    name: 'vite-plugin-image-optimization',

    configResolved(config) {
      isProduction = config.command === 'build';
    },

    async buildStart() {
      if (!isProduction) return;

      console.log('🖼️  Starting automatic image optimization...');

      try {
        await optimizeImages();
        console.log('✅ Image optimization completed successfully!');
      } catch (error) {
        console.error('❌ Image optimization failed:', error);
      }
    }
  };

  async function optimizeImages() {
    const stats = {
      processed: 0,
      optimized: 0,
      saved: 0,
      errors: 0
    };

    // Ensure output directory exists
    await ensureDir(outputDir);

    // Process each input directory
    for (const inputDir of inputDirs) {
      if (await pathExists(inputDir)) {
        await processDirectory(inputDir, stats);
      }
    }

    // Generate optimization report
    generateReport(stats);
  }

  async function processDirectory(dir, stats, relativePath = '') {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativeFilePath = path.join(relativePath, file.name);

      if (file.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(fullPath, stats, relativeFilePath);
      } else if (isImageFile(file.name)) {
        // Process image files
        await processImageFile(fullPath, relativeFilePath, stats);
      }
    }
  }

  async function processImageFile(inputPath, relativePath, stats) {
    try {
      // Skip if matches skip patterns
      if (skipPatterns.some(pattern => pattern.test(path.basename(inputPath)))) {
        if (verbose) console.log(`⏭️  Skipping ${relativePath} (matches skip pattern)`);
        return;
      }

      // Get image metadata
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      const originalSize = (await fs.stat(inputPath)).size;

      // Skip if too small or too large
      if (originalSize < limits.minSize || originalSize > limits.maxSize) {
        if (verbose) console.log(`⏭️  Skipping ${relativePath} (size: ${formatBytes(originalSize)})`);
        return;
      }

      stats.processed++;

      if (verbose) {
        console.log(`🔄 Processing ${relativePath} (${metadata.width}x${metadata.height}, ${formatBytes(originalSize)})`);
      }

      const baseName = path.parse(relativePath).name;
      const outputPath = path.join(outputDir, path.dirname(relativePath));

      // Ensure output directory exists
      await ensureDir(outputPath);

      let totalSaved = 0;

      // Generate optimized versions in different formats
      for (const format of formats) {
        if (format === 'avif' && !await isAvifSupported()) continue;

        // Generate main optimized image
        const mainOutput = path.join(outputPath, `${baseName}.${format}`);
        const optimizedSize = await optimizeImage(
          image.clone(),
          mainOutput,
          format,
          quality[format] || quality.webp
        );

        if (optimizedSize > 0) {
          totalSaved += Math.max(0, originalSize - optimizedSize);

          if (verbose) {
            console.log(`  ✅ ${format.toUpperCase()}: ${formatBytes(optimizedSize)} (saved ${formatBytes(originalSize - optimizedSize)})`);
          }
        }

        // Generate responsive versions
        if (generateResponsive && metadata.width > breakpoints[0]) {
          await generateResponsiveImages(
            image.clone(),
            outputPath,
            baseName,
            format,
            quality[format] || quality.webp,
            breakpoints.filter(bp => bp < metadata.width)
          );
        }
      }

      // Copy original if no modern format generated
      if (formats.length === 0) {
        const originalOutput = path.join(outputPath, path.basename(relativePath));
        await fs.copyFile(inputPath, originalOutput);
      }

      if (totalSaved > 0) {
        stats.optimized++;
        stats.saved += totalSaved;
      }

    } catch (error) {
      stats.errors++;
      console.error(`❌ Error processing ${relativePath}:`, error.message);
    }
  }

  async function optimizeImage(image, outputPath, format, qualityValue) {
    try {
      let pipeline = image;

      // Apply format-specific optimizations
      switch (format) {
        case 'jpeg':
        case 'jpg':
          pipeline = pipeline.jpeg({
            quality: qualityValue,
            progressive: true,
            mozjpeg: true
          });
          break;

        case 'webp':
          pipeline = pipeline.webp({
            quality: qualityValue,
            effort: 6
          });
          break;

        case 'avif':
          pipeline = pipeline.avif({
            quality: qualityValue,
            effort: 6
          });
          break;

        case 'png':
          pipeline = pipeline.png({
            quality: qualityValue,
            compressionLevel: 9,
            progressive: true
          });
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Write optimized image
      await pipeline.toFile(outputPath);

      // Return file size
      const stats = await fs.stat(outputPath);
      return stats.size;
    } catch (error) {
      console.error(`Error optimizing to ${format}:`, error.message);
      return 0;
    }
  }

  async function generateResponsiveImages(image, outputPath, baseName, format, qualityValue, responsiveBreakpoints) {
    for (const width of responsiveBreakpoints) {
      try {
        const responsiveOutput = path.join(outputPath, `${baseName}_${width}w.${format}`);

        await image
          .clone()
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toFormat(format, { quality: qualityValue })
          .toFile(responsiveOutput);

        if (verbose) {
          const size = (await fs.stat(responsiveOutput)).size;
          console.log(`    📱 ${width}w: ${formatBytes(size)}`);
        }
      } catch (error) {
        console.error(`Error generating ${width}w version:`, error.message);
      }
    }
  }

  function generateReport(stats) {
    console.log('\n📊 Image Optimization Report:');
    console.log('=' .repeat(40));
    console.log(`📁 Files processed: ${stats.processed}`);
    console.log(`✅ Files optimized: ${stats.optimized}`);
    console.log(`💾 Total saved: ${formatBytes(stats.saved)}`);
    console.log(`❌ Errors: ${stats.errors}`);

    if (stats.processed > 0) {
      const optimizationRate = ((stats.optimized / stats.processed) * 100).toFixed(1);
      console.log(`📈 Optimization rate: ${optimizationRate}%`);
    }

    if (stats.saved > 0) {
      console.log(`🎯 Average savings per file: ${formatBytes(stats.saved / Math.max(1, stats.optimized))}`);
    }
  }

  // Utility functions
  function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  async function pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async function ensureDir(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  async function isAvifSupported() {
    try {
      // Check if Sharp supports AVIF
      const formats = sharp.format;
      return formats.avif && formats.avif.output;
    } catch {
      return false;
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

module.exports = imageOptimizationPlugin;
