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

  // Update display value when value changes from outside (parent component)
  // but ONLY when the field is not focused
  React.useEffect(() => {
    // Don't update display if user is actively typing
    if (isFocused && !props.readOnly) {
      return;
    }

    // Update display value with formatted version
    if (value !== undefined && value !== '') {
      setDisplayValue(formatNumber(value as number));
    } else {
      setDisplayValue('');
    }
  }, [value, formatType, props.readOnly]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't handle focus for readOnly fields - they should always show formatted value
    if (props.readOnly) {
      return;
    }

    setIsFocused(true);

    // Show raw number when focused (remove formatting)
    if (value !== undefined && value !== '') {
      setDisplayValue(String(value));
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    const rawValue = e.target.value.trim();
    const numValue = rawValue === '' ? undefined : Number(rawValue);

    // Update parent with final value
    if (rawValue === '') {
      onChange(undefined);
      setDisplayValue('');
    } else if (!isNaN(numValue as number) && numValue !== undefined) {
      onChange(numValue);
      setDisplayValue(formatNumber(numValue));
    } else {
      // Invalid input - revert to previous value
      if (value !== undefined && value !== '') {
        setDisplayValue(formatNumber(value as number));
      } else {
        setDisplayValue('');
      }
    }

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update local display value while typing
    // Don't call onChange until blur
    setDisplayValue(e.target.value);
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
