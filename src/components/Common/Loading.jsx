import React from "react";
import "./Loading.css";

const Loading = ({
  size = "medium",
  color = "primary",
  text = "Đang tải...",
  fullScreen = false,
  skeleton = false,
  progress = null,
}) => {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  const colorClasses = {
    primary: "loading-primary",
    secondary: "loading-secondary",
    success: "loading-success",
    warning: "loading-warning",
    danger: "loading-danger",
  };

  const containerClass = fullScreen
    ? "loading-fullscreen"
    : "loading-container";

  // Skeleton loader for better perceived performance
  if (skeleton) {
    return (
      <div className="skeleton-loader">
        <div className="skeleton-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-line-title"></div>
            <div className="skeleton-line skeleton-line-subtitle"></div>
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-line-full"></div>
          <div className="skeleton-line skeleton-line-medium"></div>
          <div className="skeleton-line skeleton-line-short"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading content"
    >
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <div className="loading-text">{text}</div>}
      {progress !== null && (
        <div className="loading-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

export default Loading;
