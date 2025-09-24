import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage Component
 * Implements lazy loading, WebP support, and responsive images
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  lazy = true,
  placeholder = null,
  sizes = null,
  quality = 85,
  format = 'webp',
  fallback = null,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate optimized image sources
  const generateSources = (baseSrc) => {
    if (!baseSrc) return { webp: null, fallback: null };

    const baseUrl = baseSrc.split('.')[0];
    const extension = baseSrc.split('.').pop();

    return {
      webp: `${baseUrl}.webp`,
      avif: `${baseUrl}.avif`,
      fallback: baseSrc,
      // For responsive images
      srcSet: sizes ? generateSrcSet(baseUrl, extension) : null
    };
  };

  // Generate responsive srcSet
  const generateSrcSet = (baseUrl, extension) => {
    const breakpoints = [480, 768, 1024, 1200, 1600];
    return breakpoints
      .map(bp => `${baseUrl}_${bp}w.${extension} ${bp}w`)
      .join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate image sources
  const sources = generateSources(src);

  // Placeholder component
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;

    return (
      <div
        className={`image-placeholder ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}
      >
        {hasError ? 'Failed to load' : 'Loading...'}
      </div>
    );
  };

  // Error fallback
  if (hasError && fallback) {
    return fallback;
  }

  // Show placeholder while not in view or not loaded
  if (!isInView || (!isLoaded && !hasError)) {
    return (
      <div ref={imgRef} className={`optimized-image-container ${className}`}>
        {renderPlaceholder()}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`optimized-image-container ${className}`}>
      <picture>
        {/* AVIF support (modern browsers) */}
        {sources.avif && (
          <source
            srcSet={sources.avif}
            type="image/avif"
            sizes={sizes}
          />
        )}

        {/* WebP support (most modern browsers) */}
        {sources.webp && (
          <source
            srcSet={sources.webp}
            type="image/webp"
            sizes={sizes}
          />
        )}

        {/* Fallback image */}
        <img
          src={sources.fallback}
          srcSet={sources.srcSet}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          width={width}
          height={height}
          sizes={sizes}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>

      {/* Loading overlay */}
      {!isLoaded && !hasError && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

// CSS-in-JS styles (you can move this to a separate CSS file)
const styles = `
.optimized-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.optimized-image {
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.optimized-image.loading {
  opacity: 0;
}

.optimized-image.loaded {
  opacity: 1;
}

.image-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
  border-radius: 4px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes loading-shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive image utilities */
.img-responsive {
  max-width: 100%;
  height: auto;
}

.img-cover {
  object-fit: cover;
}

.img-contain {
  object-fit: contain;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .image-placeholder {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
    color: #d1d5db;
  }

  .loading-overlay {
    background: rgba(17, 24, 39, 0.8);
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('optimized-image-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'optimized-image-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default OptimizedImage;
