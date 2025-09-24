import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Virtual Scrolling Component - Phase 3C Performance Optimization
 * Renders only visible items for large datasets to optimize performance
 */
const VirtualScrolling = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  onScroll = null,
  loadMoreThreshold = 0.8,
  onLoadMore = null,
  isLoading = false,
  hasMore = true,
  emptyState = null,
  errorState = null,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight, visibleItems } = useMemo(() => {
    if (!items.length) {
      return {
        startIndex: 0,
        endIndex: 0,
        totalHeight: 0,
        visibleItems: []
      };
    }

    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    // Add overscan items for smoother scrolling
    const startIdx = Math.max(0, start - overscan);
    const endIdx = Math.min(items.length - 1, start + visibleCount + overscan);

    const visible = items.slice(startIdx, endIdx + 1);
    const total = items.length * itemHeight;

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      totalHeight: total,
      visibleItems: visible
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Handle scroll with throttling
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Trigger custom scroll handler
    if (onScroll) {
      onScroll(e);
    }

    // Check if we need to load more items
    if (onLoadMore && hasMore && !isLoading) {
      const scrollPercentage = (scrollTop + containerHeight) / (items.length * itemHeight);
      if (scrollPercentage >= loadMoreThreshold) {
        onLoadMore();
      }
    }
  }, [onScroll, onLoadMore, hasMore, isLoading, loadMoreThreshold, containerHeight, itemHeight, items.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Error state
  if (errorState) {
    return (
      <div className={`virtual-scroll-container ${className}`} style={{ height: containerHeight }}>
        <div className="virtual-scroll-error">
          {errorState}
        </div>
      </div>
    );
  }

  // Empty state
  if (!items.length && !isLoading) {
    return (
      <div className={`virtual-scroll-container ${className}`} style={{ height: containerHeight }}>
        <div className="virtual-scroll-empty">
          {emptyState || (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div>Không có dữ liệu để hiển thị</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...props.style
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Spacer for total height */}
      <div
        className="virtual-scroll-spacer"
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* Visible items */}
        <div
          className="virtual-scroll-items"
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
            willChange: 'transform'
          }}
        >
          {visibleItems.map((item, index) => {
            const itemIndex = startIndex + index;

            return (
              <div
                key={item.id || itemIndex}
                className={`virtual-scroll-item ${isScrolling ? 'scrolling' : ''}`}
                style={{
                  height: itemHeight,
                  overflow: 'hidden',
                  position: 'relative'
                }}
                data-index={itemIndex}
              >
                {renderItem(item, itemIndex)}
              </div>
            );
          })}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div
            className="virtual-scroll-loading"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              borderTop: '1px solid #e8e8e8'
            }}
          >
            <div className="loading-spinner">
              <div className="spinner" />
              <span style={{ marginLeft: '8px' }}>Đang tải thêm...</span>
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      {items.length > 0 && (
        <div
          className="virtual-scroll-indicator"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            opacity: isScrolling ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {Math.floor((scrollTop + containerHeight/2) / itemHeight) + 1} / {items.length}
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .virtual-scroll-container {
          position: relative;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          background: #fff;
        }

        .virtual-scroll-container::-webkit-scrollbar {
          width: 6px;
        }

        .virtual-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .virtual-scroll-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .virtual-scroll-item {
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .virtual-scroll-item:hover {
          background-color: #fafafa;
        }

        .virtual-scroll-item.scrolling {
          pointer-events: none;
        }

        .virtual-scroll-error,
        .virtual-scroll-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          color: #666;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e8e8e8;
          border-top: 2px solid #1890ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .virtual-scroll-container {
            background: #1f1f1f;
            border-color: #434343;
            color: #ffffff;
          }

          .virtual-scroll-item {
            border-color: #434343;
          }

          .virtual-scroll-item:hover {
            background-color: #2a2a2a;
          }

          .virtual-scroll-loading {
            background: rgba(31, 31, 31, 0.9);
            border-color: #434343;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .virtual-scroll-indicator {
            font-size: 11px;
            padding: 2px 6px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook for using Virtual Scrolling with data fetching
 */
export const useVirtualScrolling = (
  fetchData,
  options = {}
) => {
  const {
    pageSize = 50,
    initialLoad = true,
    cacheKey = null
  } = options;

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  // Load initial data
  useEffect(() => {
    if (initialLoad) {
      loadItems(0, true);
    }
  }, [initialLoad]);

  // Load items function
  const loadItems = useCallback(async (pageNum = page, reset = false) => {
    if (isLoading && !reset) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData({
        page: pageNum,
        pageSize,
        offset: reset ? 0 : items.length
      });

      const newItems = result.items || result.data || [];
      const total = result.total || result.count || 0;

      if (reset) {
        setItems(newItems);
        setPage(0);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(pageNum + 1);
      }

      // Check if there are more items
      const currentTotal = reset ? newItems.length : items.length + newItems.length;
      setHasMore(currentTotal < total);

    } catch (err) {
      setError(err);
      console.error('Virtual scrolling data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pageSize, page, items.length, isLoading]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadItems(page + 1);
    }
  }, [loadItems, page, isLoading, hasMore]);

  // Refresh function
  const refresh = useCallback(() => {
    loadItems(0, true);
  }, [loadItems]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
    reset,
    setItems
  };
};

export default VirtualScrolling;
