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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 24px',
        textAlign: 'center',
        background: 'rgba(17, 24, 39, 0.4)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}
      className={className}
    >
      {Icon && (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-green)',
            marginBottom: '16px'
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', maxWidth: '380px', marginBottom: actionText ? '20px' : '0' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
}
