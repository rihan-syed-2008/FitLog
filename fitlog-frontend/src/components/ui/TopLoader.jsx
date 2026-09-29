import React from 'react';

/**
 * TopLoader — thin progress bar along the top of the viewport.
 * Mount when a page-level async operation is in flight.
 * <TopLoader visible={loading} />
 */
export default function TopLoader({ visible = true }) {
  if (!visible) return null;
  return <div className="top-loader" aria-hidden="true" />;
}
