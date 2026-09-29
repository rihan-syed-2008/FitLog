import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const px = size === 'sm' ? 14 : size === 'lg' ? 34 : 22;
  const sw = size === 'sm' ? 3 : 2.5;

  return (
    <span className={`spinner ${className}`} role="status" aria-label="Loading">
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(27,37,33,0.12)" strokeWidth={sw} />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
