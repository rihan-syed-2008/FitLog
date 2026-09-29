import React from 'react';

/** Custom Running icon — lucide-react has no "Running" */
export default function RunningIcon({ size = 20, color = 'currentColor', ...props }) {
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
      <circle cx="13" cy="4" r="1.5" />
      <path d="M7 21l3-7 2 2 3-4" />
      <path d="M14 21h4" />
      <path d="M5 13l3-1 2 3 4-5 3 1" />
    </svg>
  );
}
