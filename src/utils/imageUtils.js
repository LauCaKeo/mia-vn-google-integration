/**
 * Image Processing Utilities
 * Provides image compression, format conversion, and optimization utilities
 */

/**
 * Compress an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {number} quality - Compression quality (0.1 to 1.0)
 * @param {number} maxWidth - Maximum width for resizing
 * @param {number} maxHeight - Maximum height for resizing
 * @param {string} outputFormat - Output format ('webp', 'jpeg', 'png')
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = async (
  file,
  quality = 0.85,
  maxWidth = 1920,
  maxHeight = 1080,
  outputFormat = 'webp'
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob with specified quality and format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${outputFormat}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - New dimensions {width, height}
 */
export const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Calculate scaling ratios
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  // Apply scaling
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  return { width, height };
};

/**
 * Generate responsive image sources for different screen sizes
 * @param {string} imagePath - Base image path
 * @param {Array} breakpoints - Array of breakpoint widths
 * @returns {Object} - Responsive sources object
 */
export const generateResponsiveSources = (imagePath, breakpoints = [480, 768, 1024, 1200, 1600]) => {
  const baseUrl = imagePath.split('.')[0];
  const extension = imagePath.split('.').pop();

  return {
    srcSet: breakpoints
      .map(bp => `${baseUrl}_${bp}w.${extension} ${bp}w`)
      .join(', '),
    sizes: generateSizesAttribute(breakpoints),
    webp: `${baseUrl}.webp`,
    avif: `${baseUrl}.avif`,
    fallback: imagePath
  };
};

/**
 * Generate sizes attribute for responsive images
 * @param {Array} breakpoints - Array of breakpoint widths
 * @returns {string} - Sizes attribute string
 */
const generateSizesAttribute = (breakpoints) => {
  return breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp}px`;
      }
      return `(max-width: ${bp}px) ${bp}px`;
    })
    .join(', ');
};

/**
 * Convert image to WebP format
 * @param {File|Blob} imageFile - Image file to convert
 * @param {number} quality - WebP quality (0.1 to 1.0)
 * @returns {Promise<Blob>} - WebP blob
 */
export const convertToWebP = async (imageFile, quality = 0.85) => {
  return compressImage(imageFile, quality, 1920, 1080, 'webp');
};

/**
 * Convert image to AVIF format (if supported)
 * @param {File|Blob} imageFile - Image file to convert
 * @param {number} quality - AVIF quality (0.1 to 1.0)
 * @returns {Promise<Blob|null>} - AVIF blob or null if not supported
 */
export const convertToAVIF = async (imageFile, quality = 0.85) => {
  // Check if browser supports AVIF
  if (!isFormatSupported('avif')) {
    return null;
  }

  try {
    return await compressImage(imageFile, quality, 1920, 1080, 'avif');
  } catch (error) {
    console.warn('AVIF conversion failed:', error);
    return null;
  }
};

/**
 * Check if image format is supported by the browser
 * @param {string} format - Image format to check ('webp', 'avif', etc.)
 * @returns {boolean} - Whether format is supported
 */
export const isFormatSupported = (format) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    const dataUrl = canvas.toDataURL(`image/${format}`);
    return dataUrl.indexOf(`data:image/${format}`) === 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get optimal image format based on browser support
 * @returns {string} - Best supported format
 */
export const getOptimalFormat = () => {
  if (isFormatSupported('avif')) {
    return 'avif';
  }
  if (isFormatSupported('webp')) {
    return 'webp';
  }
  return 'jpeg';
};

/**
 * Preload image with promise
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} - Promise that resolves with image element
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Batch preload multiple images
 * @param {Array<string>} sources - Array of image source URLs
 * @param {number} concurrency - Number of images to load simultaneously
 * @returns {Promise<Array<HTMLImageElement>>} - Promise that resolves with all loaded images
 */
export const batchPreloadImages = async (sources, concurrency = 3) => {
  const results = [];

  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);
    const batchPromises = batch.map(src => preloadImage(src));

    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.warn('Batch preload failed:', error);
    }
  }

  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

/**
 * Get image dimensions without loading the full image
 * @param {string} src - Image source URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Create a placeholder image with specified dimensions and color
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Background color
 * @param {string} textColor - Text color
 * @param {string} text - Placeholder text
 * @returns {string} - Data URL of placeholder image
 */
export const createPlaceholder = (
  width = 300,
  height = 200,
  color = '#f0f0f0',
  textColor = '#999999',
  text = `${width}×${height}`
) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toDataURL();
};

/**
 * Image processing configuration
 */
export const IMAGE_CONFIG = {
  // Compression settings
  quality: {
    high: 0.95,
    medium: 0.85,
    low: 0.7
  },

  // Format preferences
  formats: {
    photo: ['avif', 'webp', 'jpeg'],
    graphic: ['avif', 'webp', 'png'],
    icon: ['webp', 'png', 'svg']
  },

  // Size presets
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 200 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 800 },
    xlarge: { width: 1920, height: 1080 }
  },

  // Breakpoints for responsive images
  breakpoints: [480, 768, 1024, 1200, 1600]
};
