import { useEffect, useState } from 'react';
import { isCustomOptionLabel, resolveDropdownState } from '../../lib/dropdown-flow';

export default function Dropdown({ label, tooltip, options = [], error, required, placeholder = 'Select…', className = '', value = '', onChange, ...props }) {
  const resolved = resolveDropdownState({ value, options });
  const [customSelected, setCustomSelected] = useState(resolved.isCustomSelected);

  useEffect(() => {
    if (resolved.isCustomSelected) {
      setCustomSelected(true);
      return;
    }

    if (value && !isCustomOptionLabel(value)) {
      setCustomSelected(false);
    }
  }, [resolved.isCustomSelected, value]);

  const handleSelectChange = (event) => {
    const nextValue = event.target.value;

    if (isCustomOptionLabel(nextValue)) {
      setCustomSelected(true);
      onChange?.({ target: { value: '' } });
      return;
    }

    setCustomSelected(false);
    onChange?.(event);
  };

  const handleCustomChange = (event) => {
    onChange?.({ target: { value: event.target.value } });
  };

  const showCustomInput = resolved.hasCustomOption && (customSelected || resolved.isCustomSelected);
  const selectValue = showCustomInput
    ? resolved.customOptionLabel
    : resolved.selectValue;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {tooltip && (
            <span className="group relative ml-1 cursor-help text-gray-400 hover:text-gray-600">
              ?
              <span className="absolute left-0 top-6 z-10 hidden w-64 rounded-md bg-gray-900 p-2 text-xs text-white group-hover:block">
                {tooltip}
              </span>
            </span>
          )}
        </label>
      )}
      <select
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 ${error ? 'border-red-400' : ''} ${className}`}
        value={selectValue}
        onChange={handleSelectChange}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {showCustomInput && (
        <input
          type="text"
          value={resolved.isCustomSelected ? resolved.customValue : ''}
          onChange={handleCustomChange}
          placeholder={`Enter ${label?.toLowerCase() || 'custom value'}`}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
