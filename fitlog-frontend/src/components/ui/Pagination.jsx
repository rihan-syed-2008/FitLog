import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <div className="pagination-info">
        Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
        <span style={{ color: 'var(--ink-soft)' }}> ({totalElements} total)</span>
      </div>

      <div className="pagination-btns">
        <Button
          variant="secondary"
          className="btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          icon={ChevronLeft}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          className="btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
