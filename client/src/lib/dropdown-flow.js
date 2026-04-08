export function isCustomOptionLabel(label) {
  return /^(other|custom)\b/i.test(String(label).trim());
}

export function resolveDropdownState({ value, options = [] }) {
  const labels = options.map((option) => typeof option === 'string' ? option : option?.value);
  const customOptionLabel = labels.find(isCustomOptionLabel) || '';
  const hasCustomOption = Boolean(customOptionLabel);
  const isKnownOption = labels.includes(value);
  const isCustomSelected = Boolean(value) && hasCustomOption && !isKnownOption;

  return {
    hasCustomOption,
    selectValue: isCustomSelected ? customOptionLabel : (value || ''),
    customValue: isCustomSelected ? value : '',
    customOptionLabel,
    isCustomSelected,
  };
}
