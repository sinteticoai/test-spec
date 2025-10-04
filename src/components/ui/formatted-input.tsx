import * as React from "react"
import { Input } from "./input"

interface FormattedInputProps extends Omit<React.ComponentProps<"input">, 'type' | 'value' | 'onChange'> {
  value: number | undefined | '';
  onChange: (value: number | undefined) => void;
  formatType: 'currency' | 'percentage' | 'number';
}

export function FormattedInput({ value, onChange, formatType, onBlur, ...props }: FormattedInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (formatType === 'currency') {
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (formatType === 'percentage') {
      return `${num.toFixed(2)}%`;
    } else {
      return num >= 10
        ? num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : num.toString();
    }
  };

  // Update display value when value changes and field is not focused
  React.useEffect(() => {
    // For readOnly fields, always update the display (they won't have focus)
    // For regular fields, only update when not focused
    const shouldUpdate = props.readOnly || !isFocused;

    if (shouldUpdate) {
      if (value !== undefined && value !== '' && value !== 0) {
        setDisplayValue(formatNumber(value as number));
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isFocused, props.readOnly]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't handle focus for readOnly fields - they should always show formatted value
    if (props.readOnly) {
      return;
    }
    setIsFocused(true);
    // Show raw number when focused
    const rawValue = value !== undefined && value !== '' && value !== 0 ? String(value) : '';
    setDisplayValue(rawValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    const rawValue = e.target.value;
    const numValue = rawValue === '' ? undefined : Number(rawValue);

    // Call onChange with final value
    if (rawValue === '') {
      onChange(undefined);
      setDisplayValue('');
    } else if (!isNaN(numValue as number) && numValue !== undefined) {
      onChange(numValue);
      setDisplayValue(formatNumber(numValue));
    }

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // CRITICAL: Update display value immediately while focused
    setDisplayValue(rawValue);

    // Update parent state
    if (rawValue === '') {
      onChange(undefined);
    } else {
      const numValue = Number(rawValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
      style={{
        // Remove spinner arrows
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
        ...props.style
      }}
    />
  );
}
