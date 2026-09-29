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
  const selectId =
    id ||
    `select-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`field-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`field-select${error ? ' error' : ''}`}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {text}
            </option>
          );
        })}
      </select>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
