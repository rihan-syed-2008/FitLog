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
  icon: Icon,
  ...props
}) {
  const inputId =
    id ||
    `field-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`field-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          <span>
            {label}
            {required && <span className="required-mark">*</span>}
          </span>
          {helperText && <span className="helper-text">{helperText}</span>}
        </label>
      )}

      <div className="field-input-icon-wrap">
        {Icon && (
          <span className="field-icon">
            <Icon size={15} />
          </span>
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
          className={`field-input${Icon ? ' has-icon' : ''}${error ? ' error' : ''}`}
          {...props}
        />
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
