import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOver({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="slideover-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="slideover-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slideover-header">
          <h3 className="slideover-title">{title}</h3>
          <button
            onClick={onClose}
            className="slideover-close"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        <div className="slideover-body">
          {children}
        </div>
      </div>
    </div>
  );
}
