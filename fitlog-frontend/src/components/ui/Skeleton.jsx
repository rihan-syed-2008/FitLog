import React from 'react';

/**
 * Skeleton — shimmer placeholder for loading states.
 * Usage: <Skeleton width="100%" height={20} />
 */
export default function Skeleton({ width = '100%', height = 16, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
