import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * ConfirmDialog — accessible modal that replaces window.confirm().
 *
 * Props:
 *   isOpen     boolean
 *   title      string
 *   message    string
 *   onConfirm  () => void  — called when the user clicks the destructive action
 *   onCancel   () => void  — called on cancel or Escape
 *   confirmLabel  string  (default "Delete")
 *   cancelLabel   string  (default "Cancel")
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel'
}) {
  useEffect(() => {
    function onKey(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} color="var(--bib)" aria-hidden="true" />
          <h3 id="confirm-title" className="dialog-title" style={{ marginBottom: 0 }}>
            {title}
          </h3>
        </div>
        {message && <p className="dialog-body">{message}</p>}
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
