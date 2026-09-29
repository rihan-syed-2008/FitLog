import React from 'react';

/** Custom Swimming icon */
export default function SwimmingIcon({ size = 20, color = 'currentColor', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="5" r="1.5" />
      <path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M6 14l3-6 3 3 2-2 4 5" />
    </svg>
  );
}
