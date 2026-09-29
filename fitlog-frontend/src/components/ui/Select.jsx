import React from 'react';

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className = ''
}) {
  const selectId = id || `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).slice(2, 7)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--accent-rose)', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="glass-input"
        style={{
          borderColor: error ? 'var(--accent-rose)' : undefined,
          cursor: 'pointer',
          backgroundColor: '#0c1220'
        }}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} style={{ backgroundColor: '#111827', color: '#f8fafc' }}>
              {text}
            </option>
          );
        })}
      </select>

      {error && (
        <span style={{ fontSize: '0.775rem', color: 'var(--accent-rose)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}
