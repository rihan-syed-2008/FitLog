import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 4px',
        marginTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}
    >
      <div>
        Showing page <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{page + 1}</span> of{' '}
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{totalPages}</span> ({totalElements} total)
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          style={{ padding: '6px 12px' }}
        >
          <ChevronLeft size={16} /> Prev
        </Button>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          style={{ padding: '6px 12px' }}
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
