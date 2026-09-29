import React from 'react';

export default function Spinner({ size = 'md', color = '#10b981', className = '' }) {
  const pixelSize = size === 'sm' ? 16 : size === 'lg' ? 36 : 24;
  const strokeWidth = size === 'sm' ? 3 : 2.5;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className={className}
      role="status"
      aria-label="Loading"
    >
      <svg
        style={{
          width: pixelSize,
          height: pixelSize,
          animation: 'spin 0.75s linear infinite'
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
