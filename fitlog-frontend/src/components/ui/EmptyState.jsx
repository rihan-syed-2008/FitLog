import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`empty-state ${className}`} role="status">
      {Icon && (
        <div className="empty-state-icon" aria-hidden="true">
          <Icon size={26} />
        </div>
      )}
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
}
