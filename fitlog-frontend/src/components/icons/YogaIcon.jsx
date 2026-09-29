import React from 'react';

/** Custom Yoga icon */
export default function YogaIcon({ size = 20, color = 'currentColor', ...props }) {
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
      <circle cx="12" cy="4" r="1.5" />
      <path d="M12 6v4l-4 4" />
      <path d="M12 10l4 4" />
      <path d="M8 18l2-4 2 2 2-4 2 4" />
    </svg>
  );
}
