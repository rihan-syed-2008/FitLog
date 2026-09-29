import React from 'react';

export default function Field({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  max,
  step,
  disabled = false,
  className = '',
  helperText,
  icon: Icon
}) {
  const inputId = id || `field-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).slice(2, 7)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>
            {label}
            {required && <span style={{ color: 'var(--accent-rose)', marginLeft: '4px' }}>*</span>}
          </span>
          {helperText && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{helperText}</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)', pointerEvents: 'none' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="glass-input"
          style={{
            paddingLeft: Icon ? '38px' : '14px',
            borderColor: error ? 'var(--accent-rose)' : undefined
          }}
        />
      </div>

      {error && (
        <span
          style={{
            fontSize: '0.775rem',
            color: 'var(--accent-rose)',
            fontWeight: 500,
            marginTop: '2px'
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
